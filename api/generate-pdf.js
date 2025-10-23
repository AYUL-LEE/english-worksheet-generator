import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { htmlContent } = req.body;
  if (!htmlContent)
    return res.status(400).json({ error: 'HTML content is required' });

  let browser;
  try {
    // ✅ 경로 자동 감지 (로컬/서버 둘 다)
    const executablePath =
      process.env.CHROME_PATH ||
      (process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=worksheet.pdf');
    res.send(pdf);
  } catch (err) {
    console.error('PDF 생성 에러:', err);
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
}
