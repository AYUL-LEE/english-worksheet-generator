import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { htmlContent } = req.body;
  if (!htmlContent) {
    return res.status(400).json({ error: 'HTML content is required' });
  }

  let browser;
  const timestamp = Date.now();
  const tmpPdfPath = path.join(os.tmpdir(), `worksheet_${timestamp}.pdf`);

  try {
    const isVercel = process.env.VERCEL === '1';
    const isRender = !!process.env.RENDER;
    const isCloud = isVercel || isRender;

    const executablePath = isCloud
      ? await chromium.executablePath()
      : process.env.CHROME_PATH ||
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    console.log('🔍 실행 환경:', isVercel ? 'Vercel' : isRender ? 'Render' : 'Local');
    console.log('🔍 Chrome 경로:', executablePath);
    console.log('🔍 HTML 크기:', Math.round(htmlContent.length / 1024), 'KB');

    browser = await puppeteer.launch({
      args: isCloud
        ? chromium.args
        : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      executablePath,
      headless: true,
      defaultViewport: { width: 1240, height: 1754 },
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

    // Google Fonts 링크 제거 → 외부 네트워크 의존성 차단 (타임아웃 방지)
    const cleanedHTML = htmlContent.replace(
      /<link[^>]*fonts\.googleapis\.com[^>]*>/gi, ''
    );

    // 대용량 HTML(base64 이미지 포함)은 setContent 대신 임시 파일 → goto로 로드
    const tmpHtmlPath = path.join(os.tmpdir(), `worksheet_${timestamp}.html`);
    fs.writeFileSync(tmpHtmlPath, cleanedHTML, 'utf-8');
    const fileUrl = pathToFileURL(tmpHtmlPath).href;
    await page.goto(fileUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    });

    // 이미지 로딩 대기 (최대 15초, 실패해도 PDF 생성 계속)
    await page.evaluate(() => new Promise((resolve) => {
      const imgs = Array.from(document.querySelectorAll('img'));
      if (imgs.length === 0) return resolve();
      let done = 0;
      const finish = () => { if (++done >= imgs.length) resolve(); };
      imgs.forEach(img => {
        if (img.complete) finish();
        else { img.onload = finish; img.onerror = finish; }
      });
      setTimeout(resolve, 15000);
    }));

    await page.pdf({
      path: tmpPdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="height:12mm;width:100%;font-size:0;margin:0;padding:0;"></div>',
      footerTemplate: '<div style="height:10mm;width:100%;font-size:0;margin:0;padding:0;"></div>',
      margin: { top: '12mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });

    await page.close();
    await browser.close();
    browser = null;

    try { fs.unlinkSync(tmpHtmlPath); } catch (_) {}
    const pdfBuffer = fs.readFileSync(tmpPdfPath);
    fs.unlinkSync(tmpPdfPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="worksheet.pdf"');
    res.end(pdfBuffer);

  } catch (err) {
    console.error('❌ PDF 생성 오류:', err.message);
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    try { if (fs.existsSync(tmpHtmlPath)) fs.unlinkSync(tmpHtmlPath); } catch (_) {}
    try { if (fs.existsSync(tmpPdfPath)) fs.unlinkSync(tmpPdfPath); } catch (_) {}
    res.status(500).json({ error: err.message });
  }
}
