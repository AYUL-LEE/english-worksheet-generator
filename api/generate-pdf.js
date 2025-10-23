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
    // ✅ 1️⃣ 환경 감지
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

    // ✅ 2️⃣ 실행 경로 후보
    const executablePath = isVercel
      ? await chromium.executablePath()
      : (process.env.CHROME_PATH ||
          (process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'darwin'
              ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
              : '/usr/bin/google-chrome'));

    // ✅ 3️⃣ 런타임 정보 전부 출력
    console.log('----- 🧭 RUNTIME INFO START -----');
        console.log('----- 🧭 RUNTIME INFO START -----');
    console.log('Node version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Architecture:', process.arch);
    console.log('process.env.VERCEL:', process.env.VERCEL);
    console.log('process.env.AWS_EXECUTION_ENV:', process.env.AWS_EXECUTION_ENV);
    console.log('chromium.executablePath():', await chromium.executablePath());
    console.log('chromium.headless:', chromium.headless);
    console.log('chromium.args (first 5):', chromium.args.slice(0, 5));
    console.log('Chosen executablePath:', executablePath);
    console.log('isVercel:', isVercel);
    console.log('----- 🧭 RUNTIME INFO END -----');

    // ✅ 4️⃣ Puppeteer 실행
    browser = await puppeteer.launch({
      args: isVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: true,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // ✅ 5️⃣ PDF 생성
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });

    await browser.close();

    // ✅ 6️⃣ PDF 응답
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="worksheet.pdf"');
    res.end(pdfBuffer);

  } catch (err) { 
    console.error('❌ PDF 생성 에ddd러 발생:', err);
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
}
