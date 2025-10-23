import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { htmlContent } = req.body;
  if (!htmlContent) {
    return res.status(400).json({ error: 'HTML content is required' });
  }

  let browser;
  try {
    const isVercel = !!process.env.VERCEL;

    const executablePath = isVercel
      ? await chromium.executablePath()
      : (process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : process.platform === 'darwin'
            ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            : '/usr/bin/google-chrome');

    const args = isVercel
      ? chromium.args
      : ['--no-sandbox', '--disable-setuid-sandbox'];

    browser = await puppeteer.launch({
      args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    // 반드시 PDF 생성 완료 후 닫기
    await browser.close();

    // ✅ 여기 중요: send가 아니라 end!
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="worksheet.pdf"');
    res.end(pdfBuffer);

  } catch (err) {
    console.error('PDF 생성 에러:', err);
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
}
