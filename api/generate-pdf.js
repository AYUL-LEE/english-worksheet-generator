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
  const tmpPath = path.join(os.tmpdir(), `worksheet_${Date.now()}.pdf`);

  try {
    const isVercel = process.env.VERCEL === '1';

    const executablePath = isVercel
      ? await chromium.executablePath()
      : process.env.CHROME_PATH ||
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    console.log('🔍 실행 환경:', isVercel ? 'Vercel' : 'Local');
    console.log('🔍 Chrome 경로:', executablePath);

    browser = await puppeteer.launch({
      args: isVercel
        ? chromium.args
        : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      executablePath,
      headless: true,
      defaultViewport: { width: 1240, height: 1754 },
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 120000,
    });

    // path 옵션으로 임시 파일에 직접 저장 → IO.read 스트림 오류 방지
    // margin: 0 → HTML 템플릿의 @page { margin } 이 이미 여백을 처리함 (이중 여백 방지)
    await page.pdf({
      path: tmpPath,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await page.close();
    await browser.close();
    browser = null;

    const pdfBuffer = fs.readFileSync(tmpPath);
    fs.unlinkSync(tmpPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="worksheet.pdf"');
    res.end(pdfBuffer);

  } catch (err) {
    console.error('❌ PDF 생성 오류:', err);
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
    res.status(500).json({ error: err.message });
  }
}
