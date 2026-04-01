import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { renderAllTypes, render_단어테스트, render_워크북_어법선택, render_워크북_어법수정, render_워크북_어휘선택, render_워크북_순서배열, render_워크북_삽입, render_워크북_빈칸단어, render_워크북_빈칸문장, render_워크북_요약, render_문제워크북, render_분석서 } from '../utils/templateRenderer.js';

// SVG 기반 만화 패널 생성 — 일관된 캐릭터, 스토리 연속성, 큰 말풍선
function makePanelSVG(panel, idx) {
  const bgs = ['#FFF9C4', '#FFE0B2', '#B3E5FC', '#C8E6C9'];
  const groundColors = ['#c8a000', '#b05a00', '#0d5faa', '#2e7d32'];
  const bg = bgs[idx % 4];
  const gc = groundColors[idx % 4];

  function esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                   .replace(/[^\x20-\x7E]/g, '').trim().toUpperCase();
  }
  function wrap(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      if (cur && (cur + ' ' + w).length > maxChars) { lines.push(cur); cur = w; }
      else cur = cur ? cur + ' ' + w : w;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // dialogue 하나를 큰 말풍선으로 자연스럽게 렌더링
  const dialogue = esc(panel.dialogue || panel.line1 || '');
  const BW = 148, FS = 17, LH = 23, PAD = 14;
  const wrappedLines = dialogue ? wrap(dialogue, 10) : [];
  const bh = wrappedLines.length ? wrappedLines.length * LH + PAD + 8 : 0;

  // 패널별 표정/포즈
  const emotions = ['happy', 'neutral', 'sad', 'smile'];
  const emotion = emotions[idx % 4];
  const mouthSVG = {
    happy:   `<path d="M199,145 Q210,157 221,145" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    neutral: `<path d="M200,148 Q210,151 220,148" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    sad:     `<path d="M200,151 Q210,142 220,151" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    smile:   `<path d="M197,144 Q210,159 223,144" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  };
  const hoodieColors = { happy:'#4A90D9', neutral:'#5B8A50', sad:'#7B5EA7', smile:'#D9534F' };
  const hoodieColor = hoodieColors[emotion];
  const armsSVG = {
    happy:   `<line x1="186" y1="176" x2="160" y2="202" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>
              <line x1="234" y1="176" x2="258" y2="198" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>`,
    neutral: `<line x1="186" y1="176" x2="168" y2="213" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>
              <line x1="234" y1="176" x2="252" y2="213" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>`,
    sad:     `<line x1="186" y1="176" x2="172" y2="215" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>
              <line x1="234" y1="176" x2="248" y2="215" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>`,
    smile:   `<line x1="186" y1="176" x2="157" y2="200" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>
              <line x1="234" y1="176" x2="261" y2="200" stroke="#FDBCB4" stroke-width="12" stroke-linecap="round"/>`,
  };

  const bubbleY = 8;
  const tailY = bubbleY + bh / 2;
  const bubble = bh > 0 ? `
  <rect x="5" y="${bubbleY}" width="${BW}" height="${bh}" rx="13" fill="white" stroke="#222" stroke-width="2.5"/>
  <polygon points="${BW-2},${tailY-7} ${BW+18},${tailY+4} ${BW-2},${tailY+11}" fill="white" stroke="#222" stroke-width="2" stroke-linejoin="round"/>
  ${wrappedLines.map((l, i) => `<text x="${5 + BW/2}" y="${bubbleY + PAD/2 + LH*(i+1) - 1}" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="${FS}" font-weight="900" fill="#111">${l}</text>`).join('')}` : '';

  return `<svg width="280" height="280" xmlns="http://www.w3.org/2000/svg">
  <rect width="280" height="280" fill="${bg}"/>
  <rect x="0" y="238" width="280" height="42" fill="${gc}" opacity="0.35"/>
  <!-- Ears -->
  <ellipse cx="181" cy="130" rx="7" ry="9" fill="#FDBCB4" stroke="#222" stroke-width="1.5"/>
  <ellipse cx="239" cy="130" rx="7" ry="9" fill="#FDBCB4" stroke="#222" stroke-width="1.5"/>
  <!-- Head -->
  <circle cx="210" cy="128" r="31" fill="#FDBCB4" stroke="#222" stroke-width="2.5"/>
  <!-- Hair -->
  <path d="M180,120 Q185,90 210,88 Q235,90 240,120 Q228,94 210,93 Q192,94 180,120 Z" fill="#4A2C0A"/>
  <ellipse cx="210" cy="103" rx="28" ry="15" fill="#4A2C0A"/>
  <!-- Eyes -->
  <ellipse cx="199" cy="125" rx="7.5" ry="9" fill="white" stroke="#222" stroke-width="1.5"/>
  <ellipse cx="221" cy="125" rx="7.5" ry="9" fill="white" stroke="#222" stroke-width="1.5"/>
  <circle cx="200" cy="126" r="4.5" fill="#111"/>
  <circle cx="222" cy="126" r="4.5" fill="#111"/>
  <circle cx="201.5" cy="124" r="1.8" fill="white"/>
  <circle cx="223.5" cy="124" r="1.8" fill="white"/>
  <!-- Eyebrows -->
  <path d="M192,114 Q199,110 206,113" stroke="#4A2C0A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M214,113 Q221,110 228,114" stroke="#4A2C0A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  ${mouthSVG[emotion]}
  <!-- Hoodie body -->
  <rect x="185" y="158" width="50" height="60" fill="${hoodieColor}" rx="5" stroke="#222" stroke-width="2"/>
  <rect x="198" y="188" width="24" height="17" fill="${hoodieColor}" stroke="#222" stroke-width="1.5" rx="3" opacity="0.65"/>
  ${armsSVG[emotion]}
  <!-- Legs -->
  <rect x="193" y="216" width="17" height="42" fill="#1a2744" rx="3" stroke="#222" stroke-width="1.5"/>
  <rect x="212" y="216" width="17" height="42" fill="#1a2744" rx="3" stroke="#222" stroke-width="1.5"/>
  <!-- Shoes -->
  <ellipse cx="201" cy="260" rx="15" ry="7" fill="#111"/>
  <ellipse cx="220" cy="260" rx="15" ry="7" fill="#111"/>
  ${bubble}
  <!-- Panel number -->
  <circle cx="265" cy="265" r="13" fill="#1a73e8"/>
  <text x="265" y="270" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="13" font-weight="900" fill="white">${idx+1}</text>
</svg>`;
}

const IMAGE_MODELS = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview'];

// 4컷 만화를 단일 이미지로 한 번에 생성
async function generateComicStrip(imageAI, captions, storyContexts) {
  const panels = captions.slice(0, 4).map((p, i) => {
    const obj = typeof p === 'object' ? p : { dialogue: String(p) };
    return {
      scene: obj.scene || obj.line1 || `Panel ${i + 1}`,
      dialogue: obj.dialogue || obj.line1 || '',
      context: storyContexts[i] || `Panel ${i + 1} of 4`,
    };
  });

  const prompt = `Create a COMPLETE 4-panel educational comic strip as a SINGLE IMAGE in a 2×2 grid layout.

CHARACTER: A young high school student with short dark spiky hair, wearing a blue hoodie — the EXACT SAME character in all 4 panels.

Panel 1 (top-left) — ${panels[0]?.context}: ${panels[0]?.scene}
  → Speech bubble: "${panels[0]?.dialogue}"

Panel 2 (top-right) — ${panels[1]?.context}: ${panels[1]?.scene}
  → Speech bubble: "${panels[1]?.dialogue}"

Panel 3 (bottom-left) — ${panels[2]?.context}: ${panels[2]?.scene}
  → Speech bubble: "${panels[2]?.dialogue}"

Panel 4 (bottom-right) — ${panels[3]?.context}: ${panels[3]?.scene}
  → Speech bubble: "${panels[3]?.dialogue}"

STYLE:
- Vibrant cartoon/webtoon style, thick black panel borders dividing the 2×2 grid
- Each panel has a colorful background matching its scene
- Speech bubbles with LARGE, BOLD, clearly readable English text
- Consistent character design across all 4 panels
- NO Korean characters anywhere`;

  for (const modelName of IMAGE_MODELS) {
    try {
      const response = await imageAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { responseModalities: ['IMAGE'] },
      });
      const parts = response.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find(p => p.inlineData?.mimeType);
      if (imgPart) {
        console.log(`🎨 4컷 만화 스트립 생성 완료 — 모델: ${modelName}`);
        return `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;
      }
    } catch (err) {
      console.warn(`  ↳ ${modelName} 실패: ${err.message.slice(0, 120)}`);
    }
  }
  console.warn('⚠️ 4컷 스트립 생성 실패 — SVG 폴백');
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { passages, apiKey, geminiKey, model, selectedTypes, pageTitle = '' } = req.body;

  if (!apiKey || !passages || passages.length === 0) {
    return res.status(400).json({ error: '필수 입력값이 없습니다.' });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const imageAI = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;
    const allResults = {};
    const allPassagesData = [];
    const debugInfo = [];

    // 각 지문별로 처리
    for (let i = 0; i < passages.length; i++) {
      const passage = passages[i];
      
      // selectedTypes에 따라 필요한 JSON 구조만 동적으로 구성
      const need기본 = !selectedTypes || selectedTypes.기본워크북;
      const need문제 = !selectedTypes || selectedTypes.문제워크북;
      const need분석서 = !selectedTypes || selectedTypes.분석서;

      // 필요한 타입에 따라 JSON 구조 블록 생성
      const jsonStructure기본 = need기본 ? `
  "type_01_본문노트": {
    "논리흐름": [
      {
        "소제목": "논리 단계의 핵심 주제를 명사형으로 구체적으로 서술",
        "내용": "해당 논리 단계의 핵심 내용을 2~3문장으로 서술 (한글, ㅇㅇ다.형태로). 첫 문장은 해당 단계의 핵심 주장, 이후 문장은 본문 근거나 심화 설명 포함"
      }
    ],
    "웹툰캡션": [
      {"scene": "Panel 1: Vivid scene description for Gemini image generation — characters, setting, action, emotion. English only.", "dialogue": "What the character says or thinks in this panel (English, natural speech, max 10 words)"},
      {"scene": "Panel 2: Vivid scene description continuing the story. Same character. English only.", "dialogue": "Character's speech/thought for panel 2 (English, max 10 words)"},
      {"scene": "Panel 3: Vivid scene description with story twist. Same character. English only.", "dialogue": "Character's speech/thought for panel 3 (English, max 10 words)"},
      {"scene": "Panel 4: Vivid scene description with story resolution. Same character. English only.", "dialogue": "Character's speech/thought for panel 4 (English, max 10 words)"}
    ]
  },
  "type_03_문장해석": {
    "sentences": [
      {
        "num": 1,
        "english": "영어 문장",
        "korean_natural": "자연스러운 한글 의역"
      }
    ]
  },
  "type_08_핵심어휘": {
    "words": [
      {
        "num": 1,
        "word": "핵심단어 (준동사는 동사원형으로)",
        "pos": "품사약어 (n./v./adj./adv./phr. 등)",
        "meanings": ["본문 문맥에서의 뜻 (가장 먼저)", "기타 주요 뜻2"],
        "synonyms": ["동의어1", "동의어2", "동의어3"],
        "antonyms": ["반의어1", "반의어2", "반의어3"]
      }
    ]
  },
  "type_09_한줄해석": {
    "sentences": [
      {
        "num": 1,
        "english": "영어 문장",
        "korean": "한글 해석"
      }
    ]
  },` : '';

      const jsonStructure문제 = need문제 ? `
  "type_워크북_어법선택": {
    "passage_marked": "지문 원문 텍스트 전체를 그대로 쓰되, 고2 내신 필수 어법 포인트마다 번호[정답단어/오답단어] 형식으로 선택지를 삽입. 예시: 'For a species 1[born/bearing] in a time 2[when/which] resources 3[were/was] limited' — 실제 지문 단어를 사용할 것. 절대로 correct, wrong, 정답, 오답 같은 메타 텍스트 금지. 7-9곳을 무작위로 선택."
  },
  "type_워크북_어휘선택": {
    "passage_marked": "지문 원문 텍스트 전체를 그대로 쓰되, 어휘 선택 포인트마다 번호[정답어휘/반의어휘] 형식으로 삽입. 예시: 'our natural 1[tendency/aversion] to share and cooperate is 2[complicated/simplified] when resources are 3[plentiful/scarce]' — 정답과 오답은 반드시 반의어 관계여야 함. 절대로 correct, wrong 같은 메타 텍스트 금지. 7-9곳 랜덤 선택.",
    "answers": [
      {"num": 1, "answer": "정답 단어"},
      {"num": 2, "answer": "정답 단어"}
    ]
  },
  "type_워크북_순서배열": {
    "first_sentence": "고정 첫 문장 (원문 첫 번째 문장 그대로)",
    "chunks": [
      {"label": "A", "text": "두 번째 문장. 세 번째 문장."},
      {"label": "B", "text": "네 번째 문장. 다섯 번째 문장."},
      {"label": "C", "text": "여섯 번째 문장. 일곱 번째 문장."}
    ],
    "answer": "C-A-B (올바른 순서)"
  },
  "type_워크북_삽입": {
    "insert_sentence": "삽입할 문장 - 지문에서 반전을 주는 문장, 요지가 되는 문장, 또는 접속사(However/Moreover/Therefore 등)로 시작하는 문장 하나를 선택",
    "passage_with_positions": "삽입 문장을 제거한 나머지 지문을 문장 사이마다 ( ① ) ( ② ) ( ③ ) ( ④ ) ( ⑤ ) 번호를 삽입하여 표시. 예: 'Max Kleiber was a pioneer. ( ① ) He was born in 1893. ( ② ) Kleiber graduated in 1920. ( ③ ) He earned his doctorate in 1924. ( ④ ) He came to UC Davis. ( ⑤ ) He received awards.'",
    "answer": 3
  },
  "type_워크북_빈칸단어": {
    "passage_with_blank": "지문에서 요지를 나타내는 핵심 단어 하나를 ______(으)로 대체한 전체 지문 텍스트",
    "choices": ["정답단어", "오답단어2", "오답단어3", "오답단어4", "오답단어5"],
    "answer": 1
  },
  "type_워크북_빈칸문장": {
    "passage_with_blank": "지문에서 요지를 나타내는 핵심 구절(5-10단어 정도)을 ______(으)로 대체한 전체 지문 텍스트",
    "choices": ["정답구절(5-10단어)", "오답구절2", "오답구절3", "오답구절4", "오답구절5"],
    "answer": 1
  },
  "type_워크북_요약": {
    "summary_with_blanks": "지문 전체 내용을 한 문장으로 요약한 영어 문장. (A)와 (B) 두 곳에 빈칸 표시. 예: 'Humans evolved to (A)______ in groups, but modern (B)______ has weakened this natural tendency.'",
    "choices": [
      {"num": 1, "A": "단어A1", "B": "단어B1"},
      {"num": 2, "A": "단어A2", "B": "단어B2"},
      {"num": 3, "A": "단어A3", "B": "단어B3"},
      {"num": 4, "A": "단어A4", "B": "단어B4"},
      {"num": 5, "A": "단어A5", "B": "단어B5"}
    ],
    "answer": 1
  },` : '';

      const jsonStructure분석서 = need분석서 ? `
  "type_분석서": {
    "summary": {
      "korean_summary": "지문 핵심 내용을 2-3줄로 한글 요약",
      "english_topic": "핵심 요지를 나타내는 영어 문장 (원문에서 발췌 또는 재구성)",
      "english_title": "지문의 영어 제목"
    },
    "sentences": [
      {
        "num": 1,
        "badges": [],
        "tags": [
          {"num": 1, "text": "구문 포인트 설명 (예: There+완료시제: '~이 있어왔다')"},
          {"num": 2, "text": "구문 포인트 설명2"}
        ],
        "chunked_english": "①There has been / a lot of **discussion** / on / ②why moths **are attracted** to **light**.",
        "chunked_korean": "있어 왔다 / 많은 논의가 / 나방이 빛에 끌리는 이유에 대한.",
        "words": [
          {"word": "discussion", "meaning_ko": "논의", "synonyms": ["debate", "conversation", "dialogue"], "antonyms": ["agreement", "silence", "consensus"]},
          {"word": "attracted", "meaning_ko": "끌리다", "synonyms": ["drawn", "appealed", "lured"], "antonyms": ["repelled", "deterred", "repulsed"]}
        ],
        "grammar_points": [
          "be attracted to: 수동태 표현이에요! attract는 '끌다'라는 타동사인데, 나방이 빛에 '끌리는' 것이므로 수동태를 써야 해요",
          "간접의문문 어순: 'why moths are'처럼 의문사 다음에 주어+동사 순서! 'why are moths'가 아니에요"
        ]
      }
    ]
  },` : '';

      // 지침 섹션도 필요한 것만 포함
      const guidelines기본 = need기본 ? `
1. **문장 분리**: 마침표(.), 물음표(?), 느낌표(!) 기준으로 모든 문장을 개별 분리
   - 예시: 지문에 7개 문장이 있으면 sentences 배열에 7개 객체 필요
2. **핵심어휘**: 10-12개의 단어로 선정.

   ▶ **[STEP 1] 지문 난이도 자동 판별 후 어휘 수준 결정**
   | 지문 Lexile 수준 | CEFR | 어휘 수준 기준 |
   |---|---|---|
   | 800L ~ 1000L | B1~B2 | 중급 어휘 (e.g. assess, contribute, consistent) |
   | 1000L ~ 1200L | B2 | 수능 빈출 어휘 (e.g. perceive, prominent, substantial, derive) |
   | 1200L ~ 1400L | B2~C1 | 수능 고빈도 학술어휘 (e.g. empirical, nuanced, paradigm, subsequent) |
   | 1400L ~ 1600L+ | C1~C2 | 고급 학술어휘 (e.g. epistemological, proliferate, dichotomy, mitigate) |

   **동의어/반의어도 지문과 동일 난이도 수준으로.**
   ▶ **[STEP 2] 어휘 선정 규칙**
   - 동사/명사/부사/형용사/숙어만. 준동사는 동사원형으로.
   - 중학교 기초단어 제외: help, good, bad, make, go, come, think, know, use 등
   - meanings: 첫 번째는 본문 문맥 뜻. synonyms: **2개**, antonyms: **2개**
3. **논리흐름**: 지문의 논리 전개를 2~4단계로 나누어 작성.
4. **웹툰캡션**: 4패널이 지문 핵심 내용을 하나의 스토리로 전개 (도입→전개→전환→결론). Gemini 이미지 생성 AI에게 전달할 프롬프트.
   - scene: 이미지 생성용 장면 묘사 — 캐릭터, 배경, 행동, 감정을 구체적으로 (영어만, 1-2문장)
   - dialogue: 말풍선 텍스트 — 자연스러운 영어 (한글·한자·일본어 절대 금지, max 10 words)
   - 4개 패널이 하나의 이야기처럼 연결되어야 함

**type_03, type_09는 sentences 배열에 지문의 모든 문장이 포함되어야 합니다!**` : '';

      const guidelinesMask문제 = need문제 ? `
5. **어법선택**: 6-8곳 번호[정답/오답] 형식 삽입. 어법 유형: 동사/준동사, 수동태/능동태, 수일치, 관계사/접속사, 형용사/부사 구별 등.
6. **어휘선택**: 7-9곳 번호[정답/반의어] 형식. 정답과 오답은 반의어 관계 필수.
7. **순서배열**: 첫 문장 고정, 나머지 2문장씩 묶어 chunks 구성. chunks를 랜덤 순서로 섞기.
8. **삽입**: 반전/접속사 시작 문장 하나 선택. 남은 지문에 ①~⑤ 삽입 위치 표시.
9. **빈칸단어**: 핵심 단어 하나를 ______으로 교체. choices[0]이 정답.
10. **빈칸문장**: 핵심 구절(5-10단어)을 ______으로 교체. choices[0]이 정답.
11. **요약**: 한 문장 영어 요약. (A)와 (B) 두 빈칸. choices 정답은 answer 필드에.` : '';

      const guidelines분석서 = need분석서 ? `
12. **분석서**: 모든 문장에 구문 분석.
   - tags: 2-3개 핵심 구문 포인트 (번호는 chunked_english의 ①②와 대응)
   - badges: 서술형 출제 가능 문장은 ["서술형 출제 가능"], 빈칸 문제는 ["빈칸"], 없으면 []
   - chunked_english: 슬래시(/)로 의미 단위 청킹. **word**는 핵심 어휘 bold
   - grammar_points: 어법 포인트 1~3개 (학생에게 친절하게 설명)` : '';

      // max_tokens를 선택된 타입에 따라 조정
      const maxTokens = (need기본 ? 4000 : 0) + (need문제 ? 5000 : 0) + (need분석서 ? 7000 : 0) || 4000;

      const prompt = `당신은 한국 고등학교 영어 내신 대비 학습자료 제작 전문가입니다.
다음 영어 지문을 분석하여 학습자료 데이터를 JSON 형태로 출력하세요.

**중요: 반드시 유효한 JSON 형식으로만 응답하세요. 설명이나 추가 텍스트 없이 JSON만 출력하세요.**

# 지문
${passage}

# 출력 JSON 구조
{
  "passage": {
    "original_text": "원문 전체",
    "english_title":"흥미롭고 통찰력 있는 영문 제목. 'A: B' 형식으로 작성 (예: 'The Wealth Paradox: Why Abundance Leads to Social Disconnection'). 단순 주제 나열이 아닌 역설, 반전, 질문 형태로 독자의 흥미를 유발할 것",
    "korean_title": "english title을 번역한 한글 제목"
  },${jsonStructure기본}${jsonStructure문제}${jsonStructure분석서}
}

# 작성 지침
**중요: 반드시 모든 문장을 개별적으로 분리하세요!**
${guidelines기본}${guidelinesMask문제}${guidelines분석서}

JSON만 출력하세요.`;

      console.log(`[${i+1}/${passages.length}] 지문 처리 중...`);

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });

      let jsonText = completion.choices[0].message.content.trim();

      const finishReason = completion.choices[0].finish_reason;
      const fakeUsage = {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens,
      };

      console.log('=== GPT 응답 ===');
      console.log('토큰:', fakeUsage);
      console.log('finish_reason:', finishReason);
      console.log('응답 길이:', jsonText.length);
      if (finishReason === 'length') {
        console.warn('⚠️ 응답이 max_tokens에서 잘림! JSON이 불완전할 수 있음.');
      }

      // 마크다운 코드블록 제거
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      // JSON 파싱 시도 (1차: 그대로)
      let jsonData;
      try {
        jsonData = JSON.parse(jsonText);
      } catch (parseError) {
        console.warn('1차 파싱 실패, JSON 블록 추출 시도:', parseError.message);

        // 2차: 첫 번째 { 부터 마지막 } 까지만 추출
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const extracted = jsonText.slice(firstBrace, lastBrace + 1);
          try {
            jsonData = JSON.parse(extracted);
            console.log('✅ 2차 파싱 성공 (블록 추출)');
          } catch (e2) {
            console.error('2차 파싱도 실패:', e2.message);
            console.error('문제 위치 주변 (position -100~+100):', jsonText.substring(Math.max(0, e2.message.match(/\d+/)?.[0] - 100), parseInt(e2.message.match(/\d+/)?.[0]) + 100));
            return res.status(500).json({
              success: false,
              error: 'JSON 파싱 실패: ' + e2.message,
              rawResponse: jsonText.substring(0, 2000),
              tokenUsage: fakeUsage,
              finishReason,
            });
          }
        } else {
          return res.status(500).json({
            success: false,
            error: 'JSON 파싱 실패: ' + parseError.message,
            rawResponse: jsonText.substring(0, 2000),
            tokenUsage: fakeUsage,
            finishReason,
          });
        }
      }

      // 디버깅 정보 저장
      debugInfo.push({
        passageIndex: i,
        tokenUsage: fakeUsage,
        promptTokens: fakeUsage.prompt_tokens,
        completionTokens: fakeUsage.completion_tokens,
        totalTokens: fakeUsage.total_tokens,
        rawJSON: jsonData,
        sentenceCount: {
          type_02: jsonData.type_02_본문노트_직독직해?.sentences?.length || 0,
          type_03: jsonData.type_03_문장해석?.sentences?.length || 0,
          type_04: jsonData.type_04_문장분석?.sentences?.length || 0,
        }
      });

      console.log(`✅ 지문 ${i+1} 완료 - 토큰: ${fakeUsage.total_tokens}`);

      // SVG 기반 4컷 만화 패널 생성 (DALL-E 없이 서버에서 직접 생성)
      // base64 data URL로 변환 → html2canvas가 <img>로 안정적으로 렌더링
      const captions = jsonData.type_01_본문노트?.웹툰캡션 ?? [];
      const storyContexts = [
        `Panel 1/4 - Story introduction: ${jsonData.type_01_본문노트?.논리흐름?.[0]?.소제목 || 'Story begins'}`,
        `Panel 2/4 - Story development: ${jsonData.type_01_본문노트?.논리흐름?.[1]?.소제목 || 'Story develops'}`,
        `Panel 3/4 - Story twist: ${jsonData.type_01_본문노트?.논리흐름?.[2]?.소제목 || 'Story turns'}`,
        `Panel 4/4 - Story resolution: conclusion`,
      ];
      let panelImages;
      if (imageAI) {
        const stripUrl = await generateComicStrip(imageAI, captions, storyContexts);
        if (stripUrl) {
          // 단일 이미지로 4컷 전체 표시
          panelImages = [{ svgContent: null, url: stripUrl, dialogue: '', isStrip: true }];
        } else {
          // 스트립 실패 시 SVG 폴백
          panelImages = captions.slice(0, 4).map((panel, pi) => {
            const panelObj = typeof panel === 'object' ? panel : { dialogue: String(panel) };
            const dialogue = panelObj.dialogue || panelObj.line1 || '';
            return { svgContent: null, url: `data:image/svg+xml;base64,${Buffer.from(makePanelSVG({ dialogue }, pi)).toString('base64')}`, dialogue };
          });
        }
      } else {
        panelImages = captions.slice(0, 4).map((panel, pi) => {
          const panelObj = typeof panel === 'object' ? panel : { dialogue: String(panel) };
          const dialogue = panelObj.dialogue || panelObj.line1 || '';
          return { svgContent: null, url: `data:image/svg+xml;base64,${Buffer.from(makePanelSVG({ dialogue }, pi)).toString('base64')}`, dialogue };
        });
      }
      console.log(`🎨 Gemini 웹툰 패널 ${panelImages.length}/4 생성 완료`);

      // JSON → HTML 변환 (기본워크북 선택시에만)
      const htmlResults = (!selectedTypes || selectedTypes.기본워크북)
        ? renderAllTypes(jsonData, panelImages, pageTitle)
        : {};

      // 결과 저장
      for (const [type, html] of Object.entries(htmlResults)) {
        allResults[`${type}_passage${i}`] = {
          type: type,
          title: type.replace(/_/g, ' '),
          content: html,
          passageNum: i
        };
      }

      // 단어테스트용 데이터 수집
      allPassagesData.push(jsonData);
    }

    // 문제워크북: 지문별로 7유형 통합 1문서
    if (!selectedTypes || selectedTypes.문제워크북) {
      for (let i = 0; i < allPassagesData.length; i++) {
        const content = render_문제워크북(allPassagesData[i], pageTitle);
        if (content) {
          allResults[`워크북_문제_passage${i}`] = {
            type: '워크북_문제',
            title: '문제 워크북',
            content,
            passageNum: i
          };
        }
      }
    }

    // 분석서: 지문별로 1문서
    if (!selectedTypes || selectedTypes.분석서) {
      for (let i = 0; i < allPassagesData.length; i++) {
        const content = render_분석서(allPassagesData[i], pageTitle);
        if (content) {
          allResults[`분석서_passage${i}`] = {
            type: '분석서',
            title: '분석서',
            content,
            passageNum: i
          };
        }
      }
    }

    // 단어 확인 테스트 (전체 지문 합산, 기본워크북 선택된 경우에만)
    if (!selectedTypes || selectedTypes.기본워크북) {
      allResults['단어테스트'] = {
        type: '단어테스트',
        title: '단어 확인 테스트',
        content: render_단어테스트(allPassagesData, pageTitle),
        passageNum: -1
      };
    }

    return res.status(200).json({
      success: true,
      results: allResults,
      passageCount: passages.length,
      debug: debugInfo
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}