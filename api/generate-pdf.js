import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import os from 'os';
import path from 'path';

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
  const tmpHtmlPath = path.join(os.tmpdir(), `worksheet_${timestamp}.html`);
  const tmpPdfPath = path.join(os.tmpdir(), `worksheet_${timestamp}.pdf`);

  try {
    const isVercel = process.env.VERCEL === '1';

    const executablePath = isVercel
      ? await chromium.executablePath()
      : process.env.CHROME_PATH ||
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    console.log('🔍 실행 환경:', isVercel ? 'Vercel' : 'Local');
    console.log('🔍 Chrome 경로:', executablePath);
    console.log('🔍 HTML 크기:', Math.round(htmlContent.length / 1024), 'KB');

    browser = await puppeteer.launch({
      args: isVercel
        ? chromium.args
        : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      executablePath,
      headless: true,
      defaultViewport: { width: 1240, height: 1754 },
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(180000);
    page.setDefaultTimeout(180000);

    // 대용량 HTML(base64 이미지 포함)은 임시 파일로 저장 후 file:// 로드
    // → setContent()보다 안정적이고 Google Fonts 타임아웃 없음
    fs.writeFileSync(tmpHtmlPath, htmlContent, 'utf8');
    await page.goto(`file:///${tmpHtmlPath.replace(/\\/g, '/')}`, {
      waitUntil: 'domcontentloaded',
      timeout: 180000,
    });

    await page.pdf({
      path: tmpPdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await page.close();
    await browser.close();
    browser = null;

    const pdfBuffer = fs.readFileSync(tmpPdfPath);
    fs.unlinkSync(tmpHtmlPath);
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
