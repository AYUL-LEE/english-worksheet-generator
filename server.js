import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// API 라우트
app.post('/api/generate-worksheet', async (req, res) => {
  try {
    const handler = await import('./api/generate-worksheet.js');
    return handler.default(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API 라우트 추가
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const handler = await import('./api/generate-pdf.js');
    return handler.default(req, res);
  } catch (error) {
    console.error('PDF API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행: http://localhost:${PORT}`);
  console.log(`📂 브라우저에서 열기: http://localhost:${PORT}/index.html`);
});