import OpenAI from 'openai';
import { renderAllTypes, render_단어테스트, render_워크북_어법선택, render_워크북_어법수정, render_워크북_어휘선택, render_워크북_순서배열, render_워크북_삽입, render_워크북_빈칸단어, render_워크북_빈칸문장, render_워크북_요약, render_문제워크북, render_분석서 } from '../utils/templateRenderer.js';

// SVG 기반 만화 패널 생성 (API 불필요, 일관된 캐릭터, 즉시 생성)
function makePanelSVG(dialogue, idx) {
  const bgs = ['#FFFDE7', '#E3F2FD', '#F1F8E9', '#FCE4EC'];
  const bg = bgs[idx % 4];
  const clean = (dialogue || '').replace(/[^\x20-\x7E]/g, '').trim();

  // 패널별 표정 (neutral / thinking / surprised / happy)
  const mouths = [
    `<path d="M120,134 Q128,139 136,134" stroke="#444" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    `<path d="M120,136 Q128,132 136,136" stroke="#444" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    `<ellipse cx="128" cy="135" rx="6" ry="5" fill="none" stroke="#444" stroke-width="2"/>`,
    `<path d="M116,132 Q128,145 140,132" stroke="#444" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  ];
  const mouth = mouths[idx % 4];

  // 말풍선 텍스트 줄바꿈
  const words = clean.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + w).length > 22) { lines.push(cur.trim()); cur = w + ' '; }
    else cur += w + ' ';
  }
  if (cur.trim()) lines.push(cur.trim());
  const L = lines.slice(0, 2);
  const bh = L.length > 1 ? 48 : 32;

  const bubble = clean ? `
    <rect x="6" y="6" width="200" height="${bh}" rx="10" fill="white" stroke="#2d2d2d" stroke-width="2"/>
    <polygon points="32,${bh+4} 50,${bh+4} 41,${bh+17}" fill="white" stroke="#2d2d2d" stroke-width="1.5" stroke-linejoin="round"/>
    ${L.map((l, i) => `<text x="16" y="${22 + i * 17}" font-family="Arial,sans-serif" font-size="11" fill="#222">${l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`).join('')}` : '';

  const svg = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="${bg}"/>
  <rect x="0" y="212" width="256" height="44" fill="#c8ddb0" opacity="0.55"/>
  <circle cx="128" cy="118" r="32" fill="#FDBCB4" stroke="#2d2d2d" stroke-width="2.5"/>
  <path d="M96,104 Q102,74 128,72 Q154,74 160,104 Q152,76 128,74 Q104,76 96,104 Z" fill="#1a1a1a"/>
  <ellipse cx="115" cy="113" rx="7" ry="8.5" fill="white" stroke="#2d2d2d" stroke-width="1.5"/>
  <ellipse cx="141" cy="113" rx="7" ry="8.5" fill="white" stroke="#2d2d2d" stroke-width="1.5"/>
  <circle cx="116" cy="114" r="4.5" fill="#1a1a1a"/><circle cx="142" cy="114" r="4.5" fill="#1a1a1a"/>
  <circle cx="117.5" cy="112" r="1.5" fill="white"/><circle cx="143.5" cy="112" r="1.5" fill="white"/>
  ${mouth}
  <rect x="102" y="149" width="52" height="64" fill="#E8EFF8" stroke="#2d2d2d" stroke-width="2" rx="4"/>
  <line x1="128" y1="149" x2="120" y2="172" stroke="#2d2d2d" stroke-width="1.5"/>
  <line x1="128" y1="149" x2="136" y2="172" stroke="#2d2d2d" stroke-width="1.5"/>
  <line x1="102" y1="161" x2="76" y2="190" stroke="#FDBCB4" stroke-width="9" stroke-linecap="round"/>
  <line x1="154" y1="161" x2="180" y2="190" stroke="#FDBCB4" stroke-width="9" stroke-linecap="round"/>
  <rect x="108" y="211" width="18" height="30" fill="#334155" stroke="#2d2d2d" stroke-width="1.5" rx="2"/>
  <rect x="130" y="211" width="18" height="30" fill="#334155" stroke="#2d2d2d" stroke-width="1.5" rx="2"/>
  <ellipse cx="117" cy="243" rx="13" ry="7" fill="#111"/><ellipse cx="139" cy="243" rx="13" ry="7" fill="#111"/>
  ${bubble}
  <circle cx="236" cy="236" r="14" fill="#5B8A00"/>
  <text x="236" y="241" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" fill="white">${idx + 1}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { passages, apiKey, model, selectedTypes, pageTitle = '' } = req.body;

  if (!apiKey || !passages || passages.length === 0) {
    return res.status(400).json({ error: '필수 입력값이 없습니다.' });
  }

  try {
    const openai = new OpenAI({ apiKey });
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
      {"scene": "Panel 1 scene description in English (what to draw, no text, no written words)", "dialogue": "ENGLISH ONLY (max 8 words, NO Korean, NO Chinese, NO Japanese characters)"},
      {"scene": "Panel 2 scene description in English (what to draw, no text, no written words)", "dialogue": "ENGLISH ONLY (max 8 words, NO Korean, NO Chinese, NO Japanese characters)"},
      {"scene": "Panel 3 scene description in English (what to draw, no text, no written words)", "dialogue": "ENGLISH ONLY (max 8 words, NO Korean, NO Chinese, NO Japanese characters)"},
      {"scene": "Panel 4 scene description in English (what to draw, no text, no written words)", "dialogue": "ENGLISH ONLY (max 8 words, NO Korean, NO Chinese, NO Japanese characters)"}
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
4. **웹툰캡션**: dialogue(말풍선)는 반드시 영어로만 (한글·한자·일본어 절대 금지, max 8 words). 4개만.

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
        response_format: { type: 'json_object' },  // 순수 JSON만 출력 강제
      });

      let jsonText = completion.choices[0].message.content.trim();

      // 응답이 잘렸는지 확인
      const finishReason = completion.choices[0].finish_reason;
      console.log('=== GPT 응답 ===');
      console.log('토큰:', completion.usage);
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
              tokenUsage: completion.usage,
              finishReason,
            });
          }
        } else {
          return res.status(500).json({
            success: false,
            error: 'JSON 파싱 실패: ' + parseError.message,
            rawResponse: jsonText.substring(0, 2000),
            tokenUsage: completion.usage,
            finishReason,
          });
        }
      }

      // 디버깅 정보 저장
      debugInfo.push({
        passageIndex: i,
        tokenUsage: completion.usage,
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
        rawJSON: jsonData,
        sentenceCount: {
          type_02: jsonData.type_02_본문노트_직독직해?.sentences?.length || 0,
          type_03: jsonData.type_03_문장해석?.sentences?.length || 0,
          type_04: jsonData.type_04_문장분석?.sentences?.length || 0,
        }
      });

      console.log(`✅ 지문 ${i+1} 완료 - 토큰: ${completion.usage.total_tokens}`);

      // SVG 기반 4컷 만화 패널 생성 (DALL-E 없이 서버에서 직접 생성)
      const captions = jsonData.type_01_본문노트?.웹툰캡션 ?? [];
      const panelImages = captions.slice(0, 4).map((panel, idx) => {
        const dialogue = typeof panel === 'object' ? (panel.dialogue ?? '') : '';
        return { url: makePanelSVG(dialogue, idx), dialogue };
      });
      console.log(`🎨 SVG 웹툰 패널 ${panelImages.length}/4 생성 완료`);

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