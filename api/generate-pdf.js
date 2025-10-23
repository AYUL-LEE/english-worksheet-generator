import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import os from 'os';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { htmlContent } = req.body;
  if (!htmlContent)
    return res.status(400).json({ error: 'HTML content is required' });

  let browser = null;

  try {
    const isLocal = os.platform() === 'win32' || os.platform() === 'darwin';
    const executablePath = isLocal
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : (await chromium.executablePath) || '/usr/bin/chromium-browser';

    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--disable-gl-drawing-for-tests',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    await browser.close();

    // ✅ 이 부분 중요
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=worksheet.pdf');
    res.end(pdf); // <--- send() ❌ end() ✅

  } catch (err) {
    console.error('PDF 생성 에러:', err);
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
}
