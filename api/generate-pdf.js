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
    // ✅ Vercel 환경 감지
    const isVercel = process.env.VERCEL === '1';

    // ✅ executablePath 설정
    const executablePath = isVercel
      ? await chromium.executablePath()
      : process.env.CHROME_PATH || 
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    console.log('🔍 실행 환경:', isVercel ? 'Vercel' : 'Local');
    console.log('🔍 Chrome 경로:', executablePath);

    // ✅ Puppeteer 실행
    browser = await puppeteer.launch({
      args: isVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: true,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // ✅ PDF 생성
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });

    await browser.close();

    // ✅ PDF 응답
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="worksheet.pdf"');
    res.end(pdfBuffer);

  } catch (err) { 
    console.error('❌ PDF 생성 오류:', err);
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
}