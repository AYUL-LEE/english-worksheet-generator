import OpenAI from 'openai';
import { renderAllTypes, render_단어테스트, render_워크북_어법선택, render_워크북_어법수정, render_워크북_어휘선택, render_워크북_순서배열, render_워크북_삽입, render_워크북_빈칸단어, render_워크북_빈칸문장, render_워크북_요약, render_문제워크북 } from '../utils/templateRenderer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { passages, apiKey, model, selectedTypes, pageTitle = '리얼고 1학년 26년 1학기 중간고사 대비' } = req.body;

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
    },
  "type_01_본문노트": {
    "논리흐름": [
      {
        "소제목": "논리 단계의 핵심 주제를 명사형으로 구체적으로 서술",
        "내용": "해당 논리 단계의 핵심 내용을 2~3문장으로 서술 (한글, ㅇㅇ다.형태로). 첫 문장은 해당 단계의 핵심 주장, 이후 문장은 본문 근거나 심화 설명 포함"
      }
    ],
    "웹툰캡션": [
      "Panel 1 scene description in English (what to draw, no text)",
      "Panel 2 scene description in English (what to draw, no text)",
      "Panel 3 scene description in English (what to draw, no text)",
      "Panel 4 scene description in English (what to draw, no text)"
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
        "synonyms": ["동의어1", "동의어2"],
        "antonyms": ["반의어1", "반의어2 (없으면 빈 배열)"]
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
  },
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
  }
}

# 작성 지침

**중요: 반드시 모든 문장을 개별적으로 분리하세요!**

1. **문장 분리**: 마침표(.), 물음표(?), 느낌표(!) 기준으로 모든 문장을 개별 분리
   - 예시: 지문에 7개 문장이 있으면 sentences 배열에 7개 객체 필요
2. **핵심어휘**: 15-20개의 단어로 선정.
   - **반드시 고등학교 2, 3학년 수준의 단어만 선정**: 동사, 명사, 부사, 형용사만 포함.
   - **숙어(phrasal verb/idiom)도 포함**: 예를 들어 'look forward to'는 하나의 숙어로 처리 (pos: phr.)
   - **준동사는 동사원형으로**: 지문에 'born'이 있으면 'be born' 또는 'bear'로, 'running'이 있으면 'run'으로 변경
   - **쉬운 단어 제외**: help, college, soon, good, bad, make, go, come, think, know 등 중학교 수준 단어 제외
   - **반드시 고2 수준 이상만**: metabolism, paradigm, cooperative, nuanced, paradox 등의 수준
   - meanings: 첫 번째는 반드시 본문 문맥에서 사용된 뜻. **뜻은 1~4개 유동적으로 — 억지로 2개로 맞추지 말 것**
   - synonyms: **있는 만큼만** — 없으면 빈 배열, 너무 억지로 만들지 말 것
   - antonyms: **반의어가 있는 단어는 반드시 채워야 함. 있는 만큼만, 없으면 빈 배열**
3. **논리흐름**: 지문의 논리 전개를 2~4단계로 나누어 작성하세요.
4. **웹툰캡션**: 본문의 핵심 메시지를 함축하는 장면 4개를 DALL-E 이미지 생성용 영문 프롬프트로 작성하세요.
   - 스타일: "cartoon comic style, bold outlines, simple flat colors"를 각 캡션 앞에 고정으로 붙이세요.
   - 말풍선에 들어갈 짧은 영문 슬로건도 함께 포함하세요.
   - 반드시 4개 캡션만 작성하세요.

**다시 강조: type_03, type_09는 sentences 배열에 지문의 모든 문장이 포함되어야 합니다!**

5. **어법선택 passage_marked**: 고2 내신 필수 어법에서 **반드시 6-8곳** 선택하여 번호[정답단어/오답단어] 형식 삽입.
   - 적용 어법 유형: 동사/준동사 자리, 수동태/능동태, 5형식 목적격보어 형태, 동사의 수일치, 관계사/접속사 구분, 보어 자리 형용사/부사 구별, 비교급 수일치, 도치 문장 수일치, 대동사 적절성, 가정법 적절성
   - **반드시 6-8개 포인트 삽입. 절대로 3개 이하로 만들지 말 것.** 각 문장마다 최소 1개씩 찾아 넣을 것.
   - 대괄호 안은 실제 영어 단어 두 개 (정답 먼저). 메타 텍스트 절대 금지.
6. **어휘선택 passage_marked**: 고2-3학년 수준 어휘 7-9곳에 번호[정답/반의어] 형식 삽입.
   - **정답과 오답은 반드시 반의어(antonym) 관계**: tendency↔aversion, abundant↔scarce, cooperate↔compete 등
   - **목표: 7-9곳 랜덤 선택**
7. **순서배열**: 지문의 첫 문장은 first_sentence에 고정. 나머지 문장을 2개씩 묶어 chunks 배열 구성.
   - 2문장씩 묶어서 하나의 label (A, B, C...) 부여
   - chunks를 랜덤 순서로 섞기
   - answer 필드에 올바른 순서 (예: "C-A-B")
8. **삽입**: 지문에서 반전/요지/접속사 시작 문장 하나 선택하여 insert_sentence로 분리.
   - 남은 지문에 ( ① )~( ⑤ ) 삽입 위치 표시 (총 5곳)
   - answer는 정답 번호 (1-5 정수)
9. **빈칸단어**: 지문의 핵심 단어(요지 관련) 하나를 ______으로 교체.
   - choices[0]이 정답 (answer: 1)
   - 오답 4개는 같은 품사이나 의미상 맞지 않는 단어
10. **빈칸문장(구절)**: 지문의 핵심 구절(5-10단어)을 ______으로 교체.
    - choices[0]이 정답 (answer: 1)
    - 오답 4개는 비슷한 길이이나 의미상 맞지 않는 구절
11. **요약**: 지문 전체를 한 문장 영어 요약. (A)와 (B) 두 빈칸.
    - choices의 정답 번호는 answer 필드에 (1-5 정수)
    - 오답들은 그럴듯해 보이지만 의미상 맞지 않는 단어 쌍

JSON만 출력하세요.`;

      console.log(`[${i+1}/${passages.length}] 지문 처리 중...`);

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 16000,
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

      // DALL-E 3 4컷 웹툰 이미지 생성
      let webtoonImageUrl = null;
      try {
        const captions = jsonData.type_01_본문노트?.웹툰캡션 ?? [];
        const panelDescriptions = captions.slice(0, 4).map((desc, idx) =>
          `Panel ${idx + 1}: ${desc}`
        ).join('\n');

        const imagePrompt = `A single rectangular image containing EXACTLY 4 comic panels in a strict 2x2 grid layout (2 panels on top row, 2 panels on bottom row). IMPORTANT: create exactly 4 panels, no more, no less. Each panel is separated by clear thick black borders.

This is a 4-panel webtoon/comic strip about: "${jsonData.passage.english_title}".

${panelDescriptions}

Style requirements:
- EXACTLY 4 panels in a 2x2 grid (top-left, top-right, bottom-left, bottom-right)
- Clean webtoon style with bold black outlines and flat bright colors
- Simple cartoon characters (no specific ethnicity, religion, or cultural identity)
- Each panel has a short English speech bubble or caption text
- Clear thick black grid lines separating all 4 panels
- Consistent art style across all panels
- Full image fills the entire canvas with no empty space`;

        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1792x1024',
          quality: 'standard',
        });
        webtoonImageUrl = imageResponse.data[0].url;
        console.log(`🎨 웹툰 이미지 생성 완료`);
      } catch (imgError) {
        console.error('이미지 생성 실패:', imgError.message);
        // 이미지 실패해도 나머지 진행
      }

      // JSON → HTML 변환 (기본워크북 선택시에만)
      const htmlResults = (!selectedTypes || selectedTypes.기본워크북)
        ? renderAllTypes(jsonData, webtoonImageUrl, pageTitle)
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