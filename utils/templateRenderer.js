// JSON 데이터를 HTML 템플릿에 삽입하는 함수들

// 01_문단개요.html
export function render01_문단개요(data) {
    const { passage, type_01_문단개요, type_03_본문노트_의역 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>문단개요 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.3; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  .title-section { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:12px; margin-bottom:15px; text-align:center; }
  .title-korean { font-size:16px !important; font-weight:700; color:#1E293B; margin-bottom:6px; }
  .title-english { font-size:12px !important; color:#64748B; font-style:italic; }
  
  .content-section { margin-bottom:15px; }
  .section-header { background:#1E40AF; color:#fff; padding:6px 12px; font-size:12px !important; font-weight:700; border-radius:4px 4px 0 0; margin:0; }
  .section-content { border:1px solid #E2E8F0; border-top:none; padding:12px; border-radius:0 0 4px 4px; }
  .section-content p { margin-bottom:8px; }
  
  .text-content { line-height:2.0; color:#374151; border:1px solid #E2E8F0; padding:15px; background:#FEFEFE; border-radius:4px; font-weight:600; }
  .structure-content { line-height:1.5; color:#374151; }
  
  .summary-box { background:#EFF6FF; border-left:4px solid #1E40AF; padding:12px; border-radius:0 4px 4px 0; }
  .summary-english { margin-bottom:8px; font-style:italic; color:#1E40AF; }
  .summary-korean { color:#374151; }
  
  .expected-questions { display:flex; flex-wrap:wrap; gap:6px; }
  .question-tag { display:inline-block; background:#DBEAFE; color:#1E40AF; padding:4px 8px; border-radius:4px; font-size:10px !important; }
</style>
</head>
<body>
  <div class="header">
    <h1>문단개요</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  <div class="title-section">
    <div class="title-korean">${passage.korean_title}</div>
    <div class="title-english">${passage.english_title}</div>
  </div>
  
  <div class="content-section">
    <h3 class="section-header">| 본문학습</h3>
    <div class="section-content">
           <p><strong>본문을 있는 그대로 읽어보면서 중요한 부분을 확인해보세요.</strong></p>
            <br>
      <div class="text-content">${type_01_문단개요.본문학습.replace(/\.\s+/g, '.<br><br>')}</div>
       <div class="text-content">
  ${(data.type_03_본문노트_의역?.sentences ?? [])
    .map(s => s.korean_natural)
    .join(' ')}
</div>
      </div>
  </div>
  
  <div class="content-section">
    <h3 class="section-header">| 문단구성</h3>
    <div class="section-content structure-content">
    <p><strong>본문을 구조화해서 서론/본론/결론의 내용을 파악해보세요.</strong></p>
            <br>
      <p><strong>서론:</strong> ${type_01_문단개요.문단구성.서론}</p>
      <p><strong>본론:</strong> ${type_01_문단개요.문단구성.본론}</p>
      <p><strong>결론:</strong> ${type_01_문단개요.문단구성.결론}</p>
    </div>
  </div>
  
  <div class="content-section">
    <h3 class="section-header">| 문단요약</h3>
    <div class="section-content">
    <p><strong>간략한 문장으로 요약한 본문내용을 정리해보세요.</strong></p>
            <br>
      <div class="summary-box">
        <div class="summary-english">${type_01_문단개요.문단요약.영문}</div>
        <div class="summary-korean">${type_01_문단개요.문단요약.한글}</div>
      </div>
    </div>
  </div>
  
  <div class="content-section">
    <h3 class="section-header">| 예상문제</h3>
    <div class="section-content">
      <div class="expected-questions">
        ${type_01_문단개요.예상문제.map(q => `<span class="question-tag">${q}</span>`).join('')}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// 02_본문노트_직독직해.html
export function render02_본문노트_직독직해(data) {
  const { passage, type_02_본문노트_직독직해 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>본문노트(직독직해) - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.3; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  .sentence-row { margin-bottom:12px; border-radius:4px; overflow:hidden; border:1px solid #E2E8F0; }
  .sentence-content { display:grid; grid-template-columns:6fr 4fr; }
  .english-side { background:#fff; padding:12px 15px; border-right:1px solid #E2E8F0; display:flex; align-items:flex-start; gap:8px; min-height:80px; }
  .korean-side { background:#F0F8FF; padding:12px 15px; display:flex; align-items:center; min-height:80px; }
  
  .sentence-number { background:#1E40AF; color:#fff; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:10px !important; flex-shrink:0; margin-top:2px; }
  .english-text { color:#1F2937; line-height:1.6; font-weight:500; }
  .korean-text { color:#1E40AF; line-height:1.6; font-weight:500; }
  
  @media print { body { padding:10mm; } .sentence-row { break-inside:avoid; margin-bottom:8px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>본문노트 (직독직해)</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  ${type_02_본문노트_직독직해.sentences.map(s => `
  <div class="sentence-row">
    <div class="sentence-content">
      <div class="english-side">
        <div class="sentence-number">${String(s.num).padStart(2, '0')}</div>
        <div class="english-text">${s.english}</div>
      </div>
      <div class="korean-side">
        <div class="korean-text">${s.korean_slash}</div>
      </div>
    </div>
  </div>
  `).join('')}
</body>
</html>
  `;
}

// 03_본문노트_의역.html
export function render03_본문노트_의역(data) {
  const { passage, type_03_본문노트_의역 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>본문노트(의역) - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.3; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  .sentence-row { margin-bottom:12px; border-radius:4px; overflow:hidden; border:1px solid #E2E8F0; }
  .sentence-content { display:grid; grid-template-columns:6fr 4fr; }
  .english-side { background:#fff; padding:12px 15px; border-right:1px solid #E2E8F0; display:flex; align-items:flex-start; gap:8px; min-height:80px; }
  .korean-side { background:#F0F8FF; padding:12px 15px; display:flex; align-items:center; min-height:80px; }
  
  .sentence-number { background:#1E40AF; color:#fff; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:10px !important; flex-shrink:0; margin-top:2px; }
  .english-text { color:#1F2937; line-height:1.6; font-weight:500; }
  .korean-text { color:#1E40AF; line-height:1.6; font-weight:500; }
  
  @media print { body { padding:10mm; } .sentence-row { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>본문노트 (의역)</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  ${type_03_본문노트_의역.sentences.map(s => `
  <div class="sentence-row">
    <div class="sentence-content">
      <div class="english-side">
        <div class="sentence-number">${String(s.num).padStart(2, '0')}</div>
        <div class="english-text">${s.english}</div>
      </div>
      <div class="korean-side">
        <div class="korean-text">${s.korean_natural}</div>
      </div>
    </div>
  </div>
  `).join('')}
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
<title>문장분석 - ${type_04_문장분석.meta?.source_title || passage.korean_title}</title>
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
    <h1>문장분석</h1>
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
      <div class="bank">${s.word_bank}</div>
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
      <td>${String(word.num).padStart(2, '0')}</td>
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
      <div class="num">${String(s.num).padStart(2, '0')}</div>
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
export function render08_핵심어휘(data) {
  const { passage, type_08_핵심어휘 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>핵심어휘 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.45; color:#1f2937; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  h2.subtitle { font-size:12px !important; margin:12px 0 8px; color:#1E40AF; }
  
  table { width:100%; border-collapse:collapse; margin-bottom:14px; table-layout:fixed; }
  th, td { border:1px solid #E2E8F0; padding:8px; text-align:left; vertical-align:top; }
  th { background:#F8FAFF; color:#1E40AF; font-weight:700; font-size:10px !important; }
  td { font-size:10px !important; }
  
  .chip-pos { display:inline-block; background:#1E40AF; color:#fff; font-size:8px; padding:1px 4px; border-radius:999px; margin-right:6px; }
  .chip-tag { display:inline-block; background:#E0E7FF; color:#1E40AF; font-size:9px; padding:2px 6px; border-radius:6px; margin-right:4px; }
  .chip-anti { display:inline-block; background:#FFE4E6; color:#BE123C; font-size:9px; padding:2px 6px; border-radius:6px; margin-right:4px; }
  
  @media print { body { padding:10mm; } table { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>핵심어휘</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  <h2 class="subtitle">${passage.korean_title}</h2>
  <table>
    <colgroup>
      <col style="width:5%">
      <col style="width:18%">
      <col style="width:22%">
      <col style="width:25%">
      <col style="width:25%">
    </colgroup>
    <thead>
      <tr>
        <th>No.</th>
        <th>핵심어휘</th>
        <th>뜻</th>
        <th>동의어</th>
        <th>반의어</th>
      </tr>
    </thead>
    <tbody>
      ${type_08_핵심어휘.words.map(w => `
      <tr>
        <td>${String(w.num).padStart(2, '0')}</td>
        <td><span class="chip-pos">${w.pos}</span><strong>${w.word}</strong></td>
        <td>${w.meaning}</td>
        <td>${w.synonyms.map(s => `<span class="chip-tag">${s}</span>`).join('')}</td>
        <td>${w.antonyms.map(a => `<span class="chip-anti">${a}</span>`).join('')}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
}

// 09_한줄해석.html
export function render09_한줄해석(data) {
  const { passage, type_09_한줄해석 } = data;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>한줄해석 - ${passage.korean_title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { margin:0; padding:0; box-sizing:border-box; font-size:11px !important; }
  body { font-family:'Inter','Noto Sans KR',sans-serif; width:210mm; min-height:297mm; margin:0 auto; padding:12mm; background:#ffffff; line-height:1.45; color:#1f2937; }
  
  .header { background:linear-gradient(135deg,#1E40AF,#3B82F6); color:#fff; padding:12px 20px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; }
  .header h1 { font-size:14px !important; font-weight:700; margin:0; }
  .header-right { font-size:10px !important; text-transform:uppercase; letter-spacing:1px; opacity:.9; }
  
  .item { border:1px solid #E2E8F0; border-radius:8px; overflow:hidden; margin-bottom:14px; display:flex; flex-direction:column; }
  .item-head { display:flex; align-items:flex-start; gap:8px; padding:8px 12px; background:#F8FAFF; border-bottom:1px dashed #E2E8F0; }
  .num { background:#1E40AF; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; flex-shrink:0; }
  .eng { color:#111827; font-weight:600; font-size:13px !important; flex:1; }
  .write-area { position:relative; min-height:50px; margin:0 14px 10px 14px; }
  .write-line { position:absolute; bottom:0; left:0; right:0; border-top:2px solid #CBD5E1; }
  
  @media print { body { padding:10mm; } .item { break-inside:avoid; } }
</style>
</head>
<body>
  <div class="header">
    <h1>한줄해석</h1>
    <div class="header-right">평택 베리타스학원</div>
  </div>
  
  ${type_09_한줄해석.sentences.map(s => `
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

// 전체 HTML 생성 (모든 유형 합치기)
export function renderAllTypes(jsonData) {
  return {
    '01_문단개요': render01_문단개요(jsonData),
    '02_본문노트_직독직해': render02_본문노트_직독직해(jsonData),
    '03_본문노트_의역': render03_본문노트_의역(jsonData),
    '04_문장분석': render04_문장분석(jsonData),
    '05_어순배열': render05_어순배열(jsonData),
    '06_단어': render06_단어(jsonData),
    '07_구문': render07_구문(jsonData),
    '08_핵심어휘': render08_핵심어휘(jsonData),
    '09_한줄해석': render09_한줄해석(jsonData),
    // TODO: 03~08 추가
  };
}