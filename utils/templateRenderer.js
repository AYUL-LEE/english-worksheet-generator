// JSON 데이터를 HTML 템플릿에 삽입하는 함수들

const CIRCLED_NUMS = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];

// Helper: parse grammar/vocabulary choice markup "1[opt1/opt2]" → styled HTML
function parseChoiceMarkup(text) {
  return (text || '').replace(/(\d+)\[([^\]]+)\]/g, (_, num, content) => {
    const opts = content.split('/').map(s => s.trim()).join(' / ');
    return `<span class="cw"><sup class="cn">${num}</sup>[${opts}]</span>`;
  });
}

// Helper: parse grammar correction markup "1[wrongword]" → underlined HTML
function parseFixMarkup(text) {
  return (text || '').replace(/(\d+)\[([^\]]+)\]/g, (_, num, content) => {
    return `<span class="fw"><sup class="fn">${num}</sup><u>${content.trim()}</u></span>`;
  });
}

// 01_본문노트.html
export function render01_본문노트(data, webtoonImageUrl = null, pageTitle = '') {
  const { passage, type_01_본문노트, type_03_문장해석 } = data;

  const sentences = type_03_문장해석?.sentences ?? [];

  // 본문학습: 주황색 1,2,3 넘버링 + 인라인(줄바꿈 없이)
  const numberedText = sentences
    .map((s, i) => `<span class="sent-num">${i+1}</span> ${s.english?.trim()}`)
    .join(' ');

  // 논리흐름 렌더링
  const logicalFlow = type_01_본문노트?.논리흐름 ?? [];
  const logicalFlowHTML = logicalFlow.map((step, i) => `
    <div class="flow-item">
      <div class="flow-num">${i + 1}</div>
      <div class="flow-body">
        <div class="flow-title">${step.소제목}</div>
        <div class="flow-desc">${step.내용}</div>
      </div>
    </div>`).join('');

  // 웹툰 이미지 섹션
  const webtoonSection = webtoonImageUrl ? `
  <div class="webtoon-wrapper">
    <img src="${webtoonImageUrl}" alt="4컷 웹툰 요약" class="webtoon-img" />
  </div>` : '';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>본문노트 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.3; }

  .page-header { border-bottom:2px solid #E87B2E; padding-bottom:6px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; }
  .page-header .sub { font-size:9px; color:#E87B2E; font-weight:600; letter-spacing:.5px; }
  .page-header .academy { font-size:9px; color:#888; }

  .title-section { background:#FFF8F3; border-left:3px solid #E87B2E; padding:8px 12px; margin-bottom:12px; border-radius:0 4px 4px 0; }
  .title-korean { font-size:13px !important; font-weight:700; color:#1E293B; margin-bottom:3px; }
  .title-english { font-size:10px !important; color:#888; font-style:italic; }

  .text-content { line-height:2.3; color:#374151; padding:12px; background:#FEFEFE; border-radius:4px; font-weight:600; word-break:keep-all; margin-bottom:12px; font-size:12px !important; }
  .sent-num { color:#E87B2E; font-weight:700; }
  .flow-section { margin-bottom:20px; }

  /* 논리흐름 */
  .flow-item { display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid #F5EDE6; }
  .flow-item:last-child { border-bottom:none; }
  .flow-num { font-weight:700; color:#E87B2E; font-size:13px !important; flex-shrink:0; margin-top:1px; min-width:20px; }
  .flow-body { flex:1; }
  .flow-title { font-weight:700; color:#1E293B; margin-bottom:3px; font-size:11px !important; }
  .flow-desc { color:#475569; line-height:1.5; }

  .webtoon-wrapper { width:100%; margin-top:4px; background:transparent; text-align:center; }
  .webtoon-img { max-width:80%; display:inline-block; border-radius:4px; }
  @media print { body { width:100% !important; margin:0 !important; padding:0 !important; } }
</style>
</head>
<body>
  <div class="page-header">
    <div class="sub">${pageTitle}  -  본문노트</div>
    <div class="academy">평택 베리타스학원</div>
  </div>

  <div class="title-section">
    <div class="title-korean">${passage.korean_title}</div>
    <div class="title-english">${passage.english_title}</div>
  </div>

  <div class="text-content">${numberedText}</div>

  <div class="flow-section">
    ${logicalFlowHTML}
  </div>

  ${webtoonSection}
</body>
</html>
  `;
}


// 03_문장해석.html
export function render03_문장해석(data, pageTitle = '') {
  const { passage, type_03_문장해석, type_08_핵심어휘 } = data;
  const sentences = type_03_문장해석?.sentences ?? [];
  const passageCode = passage.original_text?.match(/[A-Z]\d+_\d+_\d+/)?.[0] ?? '';

  const sentenceRows = sentences.map((s, i) => `
  <div class="sentence-row">
    <div class="num">${s.num}</div>
    <div class="english-text">${s.english}</div>
    <div class="korean-text">${s.korean_natural}</div>
  </div>`).join('');

  const vocab = type_08_핵심어휘?.words ?? [];
  const wordsSection = vocab.length > 0 ? `
  <div class="words-section">
    <div class="words-header">| WORDS &amp; PHRASES</div>
    <div class="words-grid">
      ${vocab.map((w, i) => `
      <div class="word-item">
        <span class="word-num">(${i+1})</span>
        <span class="word-headword">${w.word}</span>
        <span class="word-pos">${w.pos ?? ''}</span>
        <span class="word-meaning">${(w.meanings ?? [w.meaning ?? w.meaning_ko]).filter(Boolean).join(', ')}</span>
      </div>`).join('')}
    </div>
  </div>` : '';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>문장해석 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 14mm 16mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:14mm 16mm; background:#fff; color:#1a1a1a; font-size:11px; line-height:1.4; }

  /* 상단 헤더 */
  .page-header { border-bottom:2px solid #E87B2E; padding-bottom:6px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; }
  .page-header .sub { font-size:9px; color:#E87B2E; font-weight:600; letter-spacing:.5px; }
  .page-header .academy { font-size:9px; color:#888; }
  .section-title { font-size:10px; font-weight:700; color:#1a1a1a; margin-bottom:2px; }
  .section-title .code { color:#E87B2E; margin-right:6px; }
  .section-title .korean { font-weight:700; }
  .section-title .english { font-weight:400; color:#555; font-style:italic; }

  /* 문장 행 */
  .sentence-row { display:grid; grid-template-columns:28px 3fr 2fr; gap:0 12px; padding:13px 0; border-bottom:1px solid #F0F0F0; align-items:start; break-inside:avoid; }
  .sentence-row:last-of-type { border-bottom:none; }
  .num { font-size:10px; font-weight:700; color:#E87B2E; padding-top:1px; white-space:nowrap; }
  .english-text { font-size:11px; line-height:1.75; font-weight:500; color:#111; word-break:keep-all; text-align:justify; }
  .korean-text { font-size:9.5px; line-height:1.6; color:#444; word-break:keep-all; }

  /* NOTE */
  .note-section { margin-top:20px; border-top:1px dashed #CCC; padding-top:8px; }
  .note-label { font-size:9px; font-weight:700; color:#888; letter-spacing:1px; margin-bottom:6px; }
  .note-lines { height:28mm; border-bottom:1px solid #E0E0E0; }

  /* WORDS & PHRASES */
  .words-section { margin-top:18px; border-top:1.5px solid #1a1a1a; padding-top:8px; }
  .words-header { font-size:9px; font-weight:700; letter-spacing:1px; color:#1a1a1a; margin-bottom:8px; }
  .words-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 20px; }
  .word-item { display:flex; gap:4px; align-items:baseline; font-size:9.5px; }
  .word-num { color:#888; min-width:18px; }
  .word-headword { font-weight:700; color:#E87B2E; margin-right:2px; }
  .word-pos { color:#E87B2E; font-style:italic; margin-right:3px; font-size:9px; }
  .word-meaning { color:#444; }

  @media print { body { width:100% !important; margin:0 !important; padding:0 !important; } .sentence-row { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="page-header">
    <div class="sub">${pageTitle}  -  문장해석</div>
    <div class="academy">평택 베리타스학원</div>
  </div>
  <div style="margin-bottom:8px;">
    <div class="section-title"><span class="korean">${passage.korean_title}</span></div>
    <div class="section-title"><span class="english">(${passage.english_title})</span></div>
  </div>

  ${sentenceRows}

  <div class="note-section">
    <div class="note-label">| NOTE</div>
    <div class="note-lines"></div>
  </div>

  ${wordsSection}
</body>
</html>
  `;
}
export function render04_문장분석(data) {
  const { passage, type_04_문장분석 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>문장해석 - ${type_04_문장분석.meta?.source_title || passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.35; color:#1f2937; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  .sentence-row { margin-bottom:12px; border-radius:4px; overflow:hidden; border:1px solid #E2E8F0; }
  .sentence-content { display:grid; grid-template-columns: 8fr 2fr; }
  .english-side { background:#fff; padding:12px 15px; border-right:1px solid #E2E8F0; display:flex; align-items:flex-start; gap:8px; }
  .korean-side { background:#F0F8FF; padding:12px 15px; display:flex; align-items:flex-start; font-size:9px !important; color:#1E40AF; }
  
  .sentence-number { background:#1E40AF; color:#fff; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:10px !important; flex-shrink:0; margin-top:2px; }
  
  .english-text { font-size:11px !important; line-height:1.7; font-weight:500; }
  .korean-text { font-size:9px !important; line-height:1.6; font-weight:500; }
  
  .g { color:#d90429; font-weight:800; }
  .dm { background:#ede9fe; padding:0 .25em; border-radius:6px; }
  
  .u { display:inline-flex; flex-direction:column; align-items:center; margin:0 2px; }
  .u .w { border-bottom:2px solid #3B82F6; padding-bottom:1px; line-height:1.2; }
  .u .l { font-size:9px !important; line-height:1; color:#334155; margin-top:1px; }
  
  .point-box { border-top:1px dashed #CBD5E1; background:#F9FAFB; padding:6px 10px; font-size:10px !important; color:#374151; }
  
  @media print { body { padding:10mm; } .sentence-row { break-inside:avoid; margin-bottom:8px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>문장해석</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  ${type_04_문장분석.sentences.map(s => `
  <div class="sentence-row">
    <div class="sentence-content">
      <div class="english-side">
        <div class="sentence-number">${String(s.id).padStart(2, '0')}</div>
        <div>
          <div class="english-text">
            ${s.tokens ? s.tokens.map(t => {
              const classes = ['u'];
              if (t.red_highlight) classes.push('g');
              const dmClass = t.is_discourse_marker ? ' dm' : '';
              return `<span class="${classes.join(' ')}"><span class="w${dmClass}">${t.text}</span><span class="l">${t.label_ko}</span></span>`;
            }).join(' ') : s.english}
          </div>
        </div>
      </div>
      <div class="korean-side"><div class="korean-text">${s.korean}</div></div>
    </div>
    ${s.points && s.points.length > 0 ? `
    <div class="point-box">
      ${s.points.map((p, idx) => {
        if (p.type === 'vocab') {
          return `① <strong>${p.headword}</strong> ${p.explain_ko} (유의: ${p.synonyms.join(' / ')} | 반의: ${p.antonyms.join(' / ')})`;
        } else {
          return `② <strong>${p.title}</strong> ${p.explain_ko}`;
        }
      }).join('<br>\n      ')}
    </div>
    ` : ''}
  </div>
  `).join('')}
</body>
</html>
  `;
}

// 05_어순배열.html
export function render05_어순배열(data) {
  const { passage, type_05_어순배열 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>어순배열 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.35; color:#1f2937; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  .item { border:1px solid #E2E8F0; border-radius:8px; overflow:hidden; margin-bottom:14px; display:grid; grid-template-columns:8fr 2fr; }
  .item-head { grid-column:1 / span 2; display:flex; align-items:center; gap:10px; padding:6px 10px; background:#F8FAFF; border-bottom:1px dashed #E2E8F0; }
  .num { background:#1E40AF; color:#fff; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:9px !important; }
  .hint { font-size:9px !important; color:#64748B; }
  
  .item-body { padding:12px 12px 20px; }
  .bank { background:#F8FAFC; padding:8px 10px; border-radius:4px; font-size:10px !important; color:#475569; margin-bottom:10px; line-height:1.6; }
  .answer-line { border-bottom:1px solid #CBD5E1; min-height:20px; margin:4px 0; }
  
  .ko { padding:8px 12px; font-size:10px !important; color:#1E40AF; display:flex; align-items:center; background:#F0F8FF; }
  
  @media print { body { padding:10mm; } .item { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>어순배열</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  ${type_05_어순배열.sentences.map(s => `
  <div class="item">
    <div class="item-head">
      <div class="num">${String(s.num).padStart(2, '0')}</div>
      <div class="hint">${s.hint}</div>
    </div>
    <div class="item-body">
      <div class="bank">${s.word_bank || ''}</div>
      <div class="answer-line"></div>
      <div class="answer-line"></div>
    </div>
    <div class="ko">${s.korean}</div>
  </div>
  `).join('')}
</body>
</html>
  `;
}

// 06_단어.html
export function render06_단어(data) {
  const { passage, type_06_단어 } = data;
  
  // 2열로 나누기
  const half = Math.ceil(type_06_단어.words.length / 2);
  const leftWords = type_06_단어.words.slice(0, half);
  const rightWords = type_06_단어.words.slice(half);
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>영한쓰기(단어연습) - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:10px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.5; color:#1f2937; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:10px 18px; border-radius:6px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:13px !important; font-weight:700; margin:0; }
  .header-right { font-size:9px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  h2.subtitle { font-size:11px !important; margin:18px 0 6px; color:#1E40AF; }
  
  table { width:100%; border-collapse:collapse; margin-bottom:14px; }
  th, td { border:1px solid #E2E8F0; padding:6px; text-align:center; }
  th { background:#F8FAFF; color:#1E40AF; font-size:9px !important; }
  td { height:24px; font-size:10px !important; }
  
  .chip-pos { display:inline-block; background:#1E40AF; color:#fff; font-size:7px; padding:1px 3px; border-radius:4px; margin-right:3px; vertical-align:middle; }
  
  @media print { body { padding:10mm; } table { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>영한쓰기 (단어연습)</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  <h2 class="subtitle">${passage.korean_title}</h2>
  <table>
    <tr>
      <th style="width:5%">No.</th>
      <th style="width:20%">영어</th>
      <th style="width:25%">뜻</th>
      <th style="width:5%">No.</th>
      <th style="width:20%">영어</th>
      <th style="width:25%">뜻</th>
    </tr>
    ${leftWords.map((word, idx) => {
      const rightWord = rightWords[idx];
      return `
    <tr>
      <td>${word.num ? String(word.num).padStart(2, '0') : ''}</td>
      <td><span class="chip-pos">${word.pos}</span>${word.word}</td>
      <td>${word.meaning}</td>
      ${rightWord ? `
      <td>${String(rightWord.num).padStart(2, '0')}</td>
      <td><span class="chip-pos">${rightWord.pos}</span>${rightWord.word}</td>
      <td>${rightWord.meaning}</td>
      ` : '<td></td><td></td><td></td>'}
    </tr>
      `;
    }).join('')}
  </table>
</body>
</html>
  `;
}

// 07_구문.html
export function render07_구문(data) {
  const { passage, type_07_구문 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>구문분석 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.4; color:#1f2937; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  .item { border:1px solid #E2E8F0; border-radius:8px; overflow:hidden; margin-bottom:14px; }
  .item-head { display:flex; align-items:center; gap:10px; padding:8px 12px; background:#F8FAFF; border-bottom:1px solid #E2E8F0; }
  .num { background:#1E40AF; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10px !important; }
  
  .item-body { padding:12px; }
  .english { font-weight:600; color:#1F2937; margin-bottom:8px; line-height:1.6; }
  .korean { color:#1E40AF; margin-bottom:10px; font-size:10px !important; }
  .grammar-box { background:#FEF3C7; border-left:3px solid #F59E0B; padding:10px; border-radius:4px; }
  .grammar-title { font-weight:700; color:#92400E; margin-bottom:6px; font-size:10px !important; }
  .grammar-content { color:#78350F; font-size:10px !important; line-height:1.5; }
  
  @media print { body { padding:10mm; } .item { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>구문분석</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  ${type_07_구문.sentences.map(s => `
  <div class="item">
    <div class="item-head">
      <div class="num">${String(s.num || s.id || s.index || '').padStart(2, '0')}</div>
    </div>
    <div class="item-body">
      <div class="english">${s.english}</div>
      <div class="korean">${s.korean}</div>
      <div class="grammar-box">
        <div class="grammar-title">▸ 구문 설명</div>
        <div class="grammar-content">${s.grammar_explanation}</div>
      </div>
    </div>
  </div>
  `).join('')}
</body>
</html>
  `;
}

// 08_핵심어휘.html
export function render08_핵심어휘(data, pageTitle = '') {
  const { passage, type_08_핵심어휘 } = data;
  const words = type_08_핵심어휘?.words ?? [];

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>핵심어휘 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 14mm 16mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:14mm 16mm; background:#fff; color:#1a1a1a; font-size:11px; line-height:1.4; }

  .page-header { border-bottom:2px solid #E87B2E; padding-bottom:6px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; }
  .page-header .sub { font-size:9px; color:#E87B2E; font-weight:600; letter-spacing:.5px; }
  .page-header .academy { font-size:9px; color:#888; }
  .section-label { background:#FFF3E8; border-left:3px solid #E87B2E; padding:6px 10px; margin-bottom:12px; border-radius:0 4px 4px 0; }
  .section-label .korean { font-weight:700; font-size:11px; color:#1a1a1a; }
  .section-label .english { font-size:9.5px; color:#666; font-style:italic; margin-top:2px; }

  table { width:100%; border-collapse:collapse; }
  thead tr { border-bottom:2px solid #1a1a1a; }
  th { font-size:10px; font-weight:700; color:#555; padding:6px 8px; text-align:left; }
  tbody tr { border-bottom:1px solid #EBEBEB; }
  tbody tr:last-child { border-bottom:none; }
  td { padding:7px 8px; vertical-align:top; font-size:10.5px; }

  .td-num { color:#999; width:32px; }
  .td-word { width:110px; }
  .word-en { font-weight:700; color:#E87B2E; font-size:11px; }
  .word-pos { color:#999; font-style:italic; font-size:9px; margin-left:4px; }
  .td-meaning { width:120px; color:#1a1a1a; }
  .meaning-main { font-weight:600; }
  .meaning-sub { color:#666; font-size:9.5px; }
  .td-syn { color:#0D7A5F; }
  .td-ant { color:#7C3AED; }

  @media print { body { width:100% !important; margin:0 !important; padding:0 !important; } tbody tr { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="page-header">
    <div class="sub">${pageTitle}  -  핵심어휘</div>
    <div class="academy">평택 베리타스학원</div>
  </div>
  <table>
    <thead>
      <tr>
        <th class="td-num">No.</th>
        <th class="td-word">영어</th>
        <th class="td-meaning">뜻</th>
        <th>동의어</th>
        <th>반의어</th>
      </tr>
    </thead>
    <tbody>
      ${words.map((w, i) => {
        const meanings = w.meanings ?? (w.meaning ? [w.meaning] : []);
        const [main, ...rest] = meanings;
        return `
      <tr>
        <td class="td-num">${i + 1}</td>
        <td class="td-word"><span class="word-en">${w.word}</span><span class="word-pos">${w.pos ?? ''}</span></td>
        <td class="td-meaning">
          <span class="meaning-main">${main ?? ''}</span>
          ${rest.length ? `<br><span class="meaning-sub">${rest.join(', ')}</span>` : ''}
        </td>
        <td class="td-syn">${(w.synonyms ?? []).join(', ')}</td>
        <td class="td-ant">${(w.antonyms ?? []).join(', ')}</td>
      </tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
}

// 단어 확인 테스트 (전체 지문 합산, 2컬럼 그리드)
export function render_단어테스트(allData, pageTitle = '') {
  const cols = 2;
  const sections = allData.map(({ passage, type_08_핵심어휘 }) => {
    const words = type_08_핵심어휘?.words ?? [];
    return `
    <div class="section">
      <div class="section-title">${passage.korean_title}</div>
      <table>
        <thead><tr><th>No.</th><th>단어</th><th>품사</th><th>뜻</th></tr></thead>
        <tbody>
          ${words.map((w, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td class="word">${w.word}</td>
            <td class="pos">${w.pos ?? ''}</td>
            <td class="blank"></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  });

  // 2컬럼 그리드로 배치
  const rows = [];
  for (let i = 0; i < sections.length; i += cols) {
    rows.push(`<div class="row">${sections.slice(i, i + cols).join('')}</div>`);
  }

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>단어 확인 테스트</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 14mm 16mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:14mm 16mm; background:#fff; color:#1a1a1a; font-size:10px; line-height:1.4; }

  .page-header { border-bottom:2px solid #E87B2E; padding-bottom:6px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; }
  .page-header .sub { font-size:9px; color:#E87B2E; font-weight:600; letter-spacing:.5px; }
  .page-header .academy { font-size:9px; color:#888; }

  .row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .section { }
  .section-title { background:#F3F4F6; border-left:3px solid #E87B2E; padding:4px 8px; font-weight:700; font-size:9.5px; color:#1a1a1a; margin-bottom:6px; border-radius:0 3px 3px 0; }

  table { width:100%; border-collapse:collapse; }
  thead tr { border-bottom:1.5px solid #1a1a1a; }
  th { font-size:9px; font-weight:700; color:#555; padding:4px 6px; text-align:left; }
  tbody tr { border-bottom:1px solid #EBEBEB; }
  td { padding:4px 6px; font-size:9.5px; }
  .num { color:#999; width:20px; }
  .word { font-weight:700; color:#E87B2E; width:70px; }
  .pos { color:#999; font-style:italic; font-size:8.5px; width:24px; }
  .blank { border-bottom:1px solid #CCC; }

  @media print { body { width:100% !important; margin:0 !important; padding:0 !important; } .row { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="page-header">
    <div class="sub">${pageTitle}  -  단어테스트</div>
    <div class="academy">평택 베리타스학원</div>
  </div>
  ${rows.join('')}
</body>
</html>
  `;
}

// 09_한줄해석.html
export function render09_한줄해석(data, pageTitle = '') {
  const { passage, type_09_한줄해석, type_03_문장해석 } = data;
  const _sentences09 = type_09_한줄해석?.sentences ?? type_03_문장해석?.sentences ?? [];

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>국문쓰기- ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.45; color:#1f2937; }
  
  .page-header { border-bottom:2px solid #E87B2E; padding-bottom:6px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; }
  .page-header .sub { font-size:9px; color:#E87B2E; font-weight:600; letter-spacing:.5px; }
  .page-header .academy { font-size:9px; color:#888; }
  .section-label { background:#FFF3E8; border-left:3px solid #E87B2E; padding:6px 10px; margin-bottom:12px; border-radius:0 4px 4px 0; }
  .section-label .korean { font-weight:700; font-size:11px; color:#1a1a1a; }

  .item { border:1px solid #F0E0D0; border-radius:6px; overflow:hidden; margin-bottom:10px; display:flex; flex-direction:column; break-inside:avoid; }
  .item-head { display:flex; align-items:flex-start; gap:8px; padding:8px 12px; background:#FFF8F3; border-bottom:1px dashed #F0E0D0; }
  .num { color:#E87B2E; font-weight:700; font-size:11px !important; flex-shrink:0; min-width:22px; }
  .eng { color:#111827; font-weight:600; font-size:11px !important; flex:1; line-height:1.6; }
  .write-area { position:relative; min-height:44px; margin:0 14px 10px 14px; }
  .write-line { position:absolute; bottom:0; left:0; right:0; border-top:1.5px solid #DDD; }

  @media print { body { width:100% !important; margin:0 !important; padding:0 !important; } .item { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="page-header">
    <div class="sub">${pageTitle}  -  한줄해석</div>
    <div class="academy">평택 베리타스학원</div>
  </div>

  ${_sentences09.map(s => `
  <div class="item">
    <div class="item-head">
      <div class="num">${String(s.num).padStart(2, '0')}</div>
      <div class="eng">${s.english}</div>
    </div>
    <div class="write-area"><div class="write-line"></div></div>
  </div>
  `).join('')}
</body>
</html>
  `;
}

// 워크북 공통 CSS
const WB_STYLE = `
  @page { size: A4; margin: 12mm 13mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm 13mm; background:#fff; color:#1a1a1a; font-size:10px; line-height:1.4; }
  .page-header { border-bottom:2px solid #E87B2E; padding-bottom:6px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; }
  .page-header .sub { font-size:9px; color:#E87B2E; font-weight:600; letter-spacing:.5px; }
  .page-header .academy { font-size:9px; color:#888; }
  .wb-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .wb-card { border:1px solid #DEDEDE; border-radius:4px; padding:10px 11px; break-inside:avoid; display:flex; flex-direction:column; }
  .wb-num { font-weight:700; font-size:11px; color:#1a1a1a; margin-bottom:3px; }
  .wb-inst { font-size:8px; color:#666; margin-bottom:7px; }
  .wb-text { line-height:1.95; font-size:10px; color:#222; flex:1; margin-bottom:9px; word-break:keep-all; text-align:justify; }
  .cw { font-weight:600; white-space:nowrap; }
  .cn { color:#E87B2E; font-size:7.5px; }
  .fw { }
  .fn { color:#E87B2E; font-size:7.5px; }
  .wb-ans { border-top:1px solid #E0E0E0; padding-top:7px; display:grid; grid-template-columns:repeat(4,1fr); gap:3px 6px; }
  .ai { display:flex; align-items:center; gap:3px; font-size:8.5px; }
  .an { color:#888; min-width:14px; }
  .ab { flex:1; border-bottom:1px solid #AAA; height:14px; }
  .sent-item { display:flex; gap:5px; margin-bottom:5px; font-size:10px; line-height:1.7; }
  .sl { font-weight:700; color:#E87B2E; min-width:20px; flex-shrink:0; }
  @media print { body { width:100% !important; margin:0 !important; padding:0 !important; } }
  .st { color:#222; }
  .order-ans { border-top:1px solid #E0E0E0; padding-top:7px; display:flex; align-items:center; gap:6px; font-size:9px; }
  .order-label { color:#555; font-weight:600; white-space:nowrap; }
  .order-blank { flex:1; border-bottom:1px solid #AAA; height:16px; }
`;

// 워크북: 어법선택
export function render_워크북_어법선택(allData, pageTitle = '') {
  const cards = allData.map((data, idx) => {
    const { passage, type_워크북_어법선택: wb } = data;
    if (!wb?.passage_marked) return '';
    const parsedText = parseChoiceMarkup(wb.passage_marked);
    return `
    <div class="wb-card">
      <div class="wb-num">${idx + 1}. 어법 선택</div>
      <div class="wb-inst">※ 괄호 안에서 어법상 적절한 것을 고르시오.</div>
      <div class="wb-text">${parsedText}</div>
    </div>`;
  }).filter(Boolean);

  const rows = [];
  for (let i = 0; i < cards.length; i += 2) rows.push(`<div class="wb-grid">${cards.slice(i,i+2).join('')}</div>`);
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>어법선택</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>${WB_STYLE}</style></head><body>
<div class="page-header"><div class="sub">${pageTitle}  -  워크북</div><div class="academy">평택 베리타스학원</div></div>
${rows.join('<div style="margin-top:12px;"></div>')}
</body></html>`;
}

// 워크북: 어법수정
export function render_워크북_어법수정(allData, pageTitle = '') {
  const cards = allData.map((data, idx) => {
    const { passage, type_워크북_어법수정: wb } = data;
    if (!wb?.passage_marked) return '';
    const parsedText = parseFixMarkup(wb.passage_marked);
    const answers = wb.answers ?? [];
    const blanks = answers.map(a => `<div class="ai"><span class="an">${a.num}</span><span style="font-size:8.5px;color:#C00;margin-right:2px;">${a.wrong}</span><span style="color:#888;margin-right:2px;">→</span><span class="ab"></span></div>`).join('');
    return `
    <div class="wb-card">
      <div class="wb-num">${idx + 1}. 어법 수정</div>
      <div class="wb-inst">※ 밑줄 친 부분을 어법에 맞게 고쳐 쓰시오.</div>
      <div class="wb-text">${parsedText}</div>
      <div class="wb-ans" style="grid-template-columns:repeat(2,1fr);">${blanks}</div>
    </div>`;
  }).filter(Boolean);

  const rows = [];
  for (let i = 0; i < cards.length; i += 2) rows.push(`<div class="wb-grid">${cards.slice(i,i+2).join('')}</div>`);
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>어법수정</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>${WB_STYLE}</style></head><body>
<div class="page-header"><div class="sub">${pageTitle}  -  워크북</div><div class="academy">평택 베리타스학원</div></div>
${rows.join('<div style="margin-top:12px;"></div>')}
</body></html>`;
}

// 워크북: 어휘선택
export function render_워크북_어휘선택(allData, pageTitle = '') {
  const cards = allData.map((data, idx) => {
    const { passage, type_워크북_어휘선택: wb } = data;
    if (!wb?.passage_marked) return '';
    const parsedText = parseChoiceMarkup(wb.passage_marked);
    return `
    <div class="wb-card">
      <div class="wb-num">${idx + 1}. 어휘 선택</div>
      <div class="wb-inst">※ 괄호 안에서 문맥에 맞는 낱말을 고르시오.</div>
      <div class="wb-text">${parsedText}</div>
    </div>`;
  }).filter(Boolean);

  const rows = [];
  for (let i = 0; i < cards.length; i += 2) rows.push(`<div class="wb-grid">${cards.slice(i,i+2).join('')}</div>`);
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>어휘선택</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>${WB_STYLE}</style></head><body>
<div class="page-header"><div class="sub">${pageTitle}  -  워크북</div><div class="academy">평택 베리타스학원</div></div>
${rows.join('<div style="margin-top:12px;"></div>')}
</body></html>`;
}

// 워크북: 순서배열
export function render_워크북_순서배열(allData, pageTitle = '') {
  const cards = allData.map((data, idx) => {
    const { passage, type_워크북_순서배열: wb } = data;
    if (!wb?.sentences?.length) return '';
    const sentHTML = wb.sentences.map(s =>
      `<div class="sent-item"><span class="sl">(${s.label})</span><span class="st">${s.text}</span></div>`
    ).join('');
    return `
    <div class="wb-card">
      <div class="wb-num">${idx + 1}. 순서 배열</div>
      <div class="wb-inst">※ 주어진 문장을 올바른 순서로 배열하시오.</div>
      <div class="wb-text">${sentHTML}</div>
      <div class="order-ans"><span class="order-label">정답:</span><span class="order-blank"></span></div>
    </div>`;
  }).filter(Boolean);

  const rows = [];
  for (let i = 0; i < cards.length; i += 2) rows.push(`<div class="wb-grid">${cards.slice(i,i+2).join('')}</div>`);
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>순서배열</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>${WB_STYLE}</style></head><body>
<div class="page-header"><div class="sub">${pageTitle}  -  워크북</div><div class="academy">평택 베리타스학원</div></div>
${rows.join('<div style="margin-top:12px;"></div>')}
</body></html>`;
}

// 전체 HTML 생성 (모든 유형 합치기)
export function renderAllTypes(jsonData, webtoonImageUrl = null, pageTitle = '리얼고 1학년 26년 1학기 중간고사 대비') {
  return {
    '01_본문노트': render01_본문노트(jsonData, webtoonImageUrl, pageTitle),
    '03_문장해석': render03_문장해석(jsonData, pageTitle),
    '08_핵심어휘': render08_핵심어휘(jsonData, pageTitle),
    '09_한줄해석': render09_한줄해석(jsonData, pageTitle),
  };
}