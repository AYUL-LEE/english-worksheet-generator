// /api/debug-env.js
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  try {
    console.log('🔍 NODE VERSION:', process.version);
    console.log('🔍 PLATFORM:', process.platform);
    console.log('🔍 ARCH:', process.arch);
    console.log('🔍 ENV.VERCEL:', process.env.VERCEL);
    console.log('🔍 ENV.AWS_EXECUTION_ENV:', process.env.AWS_EXECUTION_ENV);
    console.log('🔍 CURRENT WORKDIR:', process.cwd());
    console.log('🔍 FILES IN CWD:', require('fs').readdirSync(process.cwd()));
    console.log('🔍 chromium.executablePath():', await chromium.executablePath());
    console.log('🔍 chromium.headless:', chromium.headless);
    console.log('🔍 chromium.args sample:', chromium.args.slice(0, 5));

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ DEBUG ERROR:', err);
    res.status(500).json({ error: err.message });
  }
}
