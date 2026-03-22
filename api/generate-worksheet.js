import OpenAI from 'openai';
import { renderAllTypes, render_단어테스트, render_워크북_어법선택, render_워크북_어법수정, render_워크북_어휘선택, render_워크북_순서배열 } from '../utils/templateRenderer.js';

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
다음 영어 지문을 분석하여 9개 유형의 학습자료 데이터를 JSON 형태로 출력하세요.

**중요: 반드시 유효한 JSON 형식으로만 응답하세요. 설명이나 추가 텍스트 없이 JSON만 출력하세요.**

# 지문
${passage}

# 출력 JSON 구조
{
  "passage": {
    "original_text": "원문 전체",
    "english_title":"흥미롭고 통찰력 있는 영문 제목. 'A: B' 형식으로 작성 (예: 'The Wealth Paradox: Why Abundance Leads to Social Disconnection'). 단순 주제 나열이 아닌 역설, 반전, 질문 형태로 독자의 흥미를 유발할 것",
    "korean_title": "english title을 번역한 한글 제목",
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
        "word": "핵심단어",
        "pos": "품사약어 (n./v./adj./adv./phr. 등)",
        "meanings": ["본문 문맥에서의 뜻 (가장 먼저)", "기타 주요 뜻2", "기타 주요 뜻3"],
        "synonyms": ["동의어1", "동의어2", "동의어3 (자연스럽게 있는 만큼)"],
        "antonyms": ["반의어1", "반의어2 (자연스럽게 있는 만큼, 없으면 빈 배열)"]
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
    "passage_marked": "지문 원문 텍스트 전체를 그대로 쓰되, 어법 포인트마다 번호[정답단어/오답단어] 형식으로 선택지를 삽입. 예시: 'For a species 1[born/bearing] in a time 2[when/which] resources 3[were/was] limited and dangers 4[were/was] great' — 실제 지문 단어를 사용할 것. 절대로 correct, wrong, 정답, 오답 같은 메타 텍스트 금지. 거의 모든 문장에 1~2개씩 삽입, 지문 문장 수 × 1.5개 이상 목표.",
    "answers": [
      {"num": 1, "answer": "정답 단어"},
      {"num": 2, "answer": "정답 단어"}
    ]
  },
  "type_워크북_어법수정": {
    "passage_marked": "지문 원문 텍스트 전체를 그대로 쓰되, 어법 오류 위치의 단어를 번호[틀린형태] 로 교체. 예시: 'For a species 1[borned] in a time when resources 2[was] limited and dangers were great' — 번호 안의 단어는 반드시 틀린 형태의 실제 단어. 절대로 wrongform, error 같은 메타 텍스트 금지. 5~10개 오류 포함.",
    "answers": [
      {"num": 1, "wrong": "틀린단어", "correct": "바른단어"},
      {"num": 2, "wrong": "틀린단어", "correct": "바른단어"}
    ]
  },
  "type_워크북_어휘선택": {
    "passage_marked": "지문 원문 텍스트 전체를 그대로 쓰되, 어휘 선택 포인트마다 번호[정답어휘/반의어휘] 형식으로 삽입. 예시: 'our natural 1[tendency/aversion] to share and cooperate is 2[complicated/simplified] when resources are 3[plentiful/scarce]' — 실제 지문 단어와 그 반의어/오류 어휘 사용. 절대로 correct, wrong 같은 메타 텍스트 금지. 거의 모든 문장에 1개씩, 지문 문장 수와 동일하거나 그 이상 목표.",
    "answers": [
      {"num": 1, "answer": "정답 단어"},
      {"num": 2, "answer": "정답 단어"}
    ]
  },
  "type_워크북_순서배열": {
    "sentences": [
      {"label": "A", "text": "문장 텍스트 (원문 문장 그대로, 순서 섞어서 배열)"},
      {"label": "B", "text": "문장 텍스트"},
      {"label": "C", "text": "문장 텍스트"}
    ],
    "answer": "C-A-B-... (올바른 순서)"
  }
}

# 작성 지침

**중요: 반드시 모든 문장을 개별적으로 분리하세요!**

1. **문장 분리**: 마침표(.), 물음표(?), 느낌표(!) 기준으로 모든 문장을 개별 분리
   - 예시: 지문에 7개 문장이 있으면 sentences 배열에 7개 객체 필요
2. **핵심어휘**: 20개의 단어로 선정 (수능 난이도).
   - meanings: 첫 번째는 반드시 본문 문맥에서 사용된 뜻, 이후 주요 뜻들을 추가 (있는 만큼 자연스럽게)
   - synonyms: 실제 영어 동의어 단어들로 구성 (메타 설명 금지)
   - antonyms: **반의어가 있는 단어는 반드시 채워야 함.** 예: tendency→aversion/reluctance, cooperate→compete/oppose, limited→abundant/plentiful, nomadic→settled/stationary. 없는 경우에만 빈 배열.
3. **논리흐름**: 지문의 논리 전개를 2~4단계로 나누어 작성하세요.
   - 소제목: 해당 단계의 핵심 주제를 명사형으로 간결하게 (예: "자원 부족 환경에서의 생존 전략인 공유와 협력")
   - 내용: 2~3문장으로 작성. 첫 문장은 핵심 주장을 명확히 서술하고, 이후 문장은 본문의 구체적 근거나 심화 설명을 포함할 것. 단순 요약이 아닌 논리적 흐름이 드러나게 서술하세요.
4.  **웹툰캡션**: 본문의 핵심 메시지를 함축하는 장면 4개를 DALL-E 이미지 생성용 영문 프롬프트로 작성하세요.
   - 스타일: "cartoon comic style, bold outlines, simple flat colors, speech bubble with short English text"를 각 캡션 앞에 고정으로 붙이세요.
   - 내용: 본문 문장을 직역하지 말고, 핵심 메시지를 과장되고 상징적인 장면으로 함축하세요.
     (예: 풍요=집 주변에 높은 울타리와 자물쇠, 단절=군중 속 혼자 폰 보는 사람)
   - 말풍선에 들어갈 짧은 영문 슬로건도 함께 포함하세요. (예: "SHARE TO SURVIVE.", "MORE STUFF, LESS SHARING.")
   - 4컷이 하나의 스토리 흐름을 가지도록 구성하세요.

**다시 강조: type_03, type_09는 sentences 배열에 지문의 모든 문장이 포함되어야 합니다!**

5. **어법선택 passage_marked**: 지문 원문을 그대로 쓰되, 번호[정답단어/오답단어] 형식 삽입.
   - 예: "For a species 1[born/bearing] in a time 2[when/which] resources 3[were/was] limited"
   - 대괄호 안은 반드시 실제 영어 단어 두 개 (정답 먼저). correct/wrong 같은 메타 텍스트 절대 금지.
   - 내신 빈출 어법: 수일치, 관계사, 분사, to부정사/동명사, 형용사/부사, 접속사, 병렬, 시제 등
   - **목표: 거의 모든 문장에 최소 1~2개씩 삽입. 지문 문장 수 × 1.5개 이상 (예: 7문장이면 10개 이상)**
6. **어법수정 passage_marked**: 지문 원문을 그대로 쓰되, 오류 위치 단어를 번호[틀린단어] 로 교체.
   - 예: "For a species 1[borned] in a time when resources 2[was] limited"
   - 대괄호 안은 반드시 틀린 형태의 실제 영어 단어. wrongform/error 같은 메타 텍스트 절대 금지.
   - **목표: 거의 모든 문장에 최소 1개씩. 지문 문장 수와 동일하거나 그 이상**
7. **어휘선택 passage_marked**: 지문 원문을 그대로 쓰되, 번호[정답어휘/반의어휘] 형식 삽입.
   - 예: "our natural 1[tendency/aversion] to share and cooperate is 2[complicated/simplified]"
   - 대괄호 안은 실제 영어 단어 두 개 (정답 먼저, 반의어/오류 어휘 두 번째). correct/wrong 절대 금지.
   - **목표: 거의 모든 문장에 최소 1개씩. 지문 문장 수와 동일하거나 그 이상**
8. **순서배열**: 지문의 모든 문장을 랜덤 순서로 섞어 (A)(B)(C)... 레이블 부여.
   - 원문 문장 그대로 사용 (수정 없이)
   - answer 필드에 올바른 순서 표기 (예: "C-A-F-B-E-D-G")

JSON만 출력하세요.`;

      console.log(`[${i+1}/${passages.length}] 지문 처리 중...`);

      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 12000
      });

      let jsonText = completion.choices[0].message.content.trim();
      
      // 원본 응답 로그 (파싱 전)
      console.log('=== GPT 원본 응답 ===');
      console.log('토큰:', completion.usage);
      console.log('응답 길이:', jsonText.length);
      console.log('원본 텍스트 일부:', jsonText.substring(0, 8000));

      // JSON 추출
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      // JSON 파싱 시도
      let jsonData;
      try {
        jsonData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON 파싱 에러:', parseError.message);
        console.error('문제 위치 주변:', jsonText.substring(10400, 10500));

        // 파싱 실패 시 원본 반환
        return res.status(500).json({
          success: false,
          error: 'JSON 파싱 실패: ' + parseError.message,
          rawResponse: jsonText,
          tokenUsage: completion.usage
        });
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

        const imagePrompt = `Create a single image divided into exactly 4 panels arranged in a 2x2 grid, in a clean webtoon/comic strip style with simple bold outlines and flat colors.
Each panel illustrates a key scene from an English passage about: "${jsonData.passage.english_title}".

${panelDescriptions}

Style: Modern webtoon / comic strip, clean bold line art, flat bright colors, simple backgrounds. Abstract cartoon characters only — no specific ethnicity, religion, or cultural identity.
Each panel should have a short speech bubble or caption with a punchy English slogan (e.g. "SHARE TO SURVIVE", "MORE STUFF, LESS SHARING").
All 4 panels must be clearly separated by thin black borders and have a consistent art style.`;

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

      // JSON → HTML 변환
      const htmlResults = renderAllTypes(jsonData, webtoonImageUrl, pageTitle);

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

    // 워크북 (전체 지문 합산)
    if (!selectedTypes || selectedTypes.wb_어법선택) {
      allResults['워크북_어법선택'] = { type: '워크북_어법선택', title: '어법 선택', content: render_워크북_어법선택(allPassagesData, pageTitle), passageNum: -1 };
    }
    if (!selectedTypes || selectedTypes.wb_어법수정) {
      allResults['워크북_어법수정'] = { type: '워크북_어법수정', title: '어법 수정', content: render_워크북_어법수정(allPassagesData, pageTitle), passageNum: -1 };
    }
    if (!selectedTypes || selectedTypes.wb_어휘선택) {
      allResults['워크북_어휘선택'] = { type: '워크북_어휘선택', title: '어휘 선택', content: render_워크북_어휘선택(allPassagesData, pageTitle), passageNum: -1 };
    }
    if (!selectedTypes || selectedTypes.wb_순서배열) {
      allResults['워크북_순서배열'] = { type: '워크북_순서배열', title: '순서 배열', content: render_워크북_순서배열(allPassagesData, pageTitle), passageNum: -1 };
    }

    // 단어 확인 테스트 (전체 지문 합산, 핵심어휘 선택된 경우에만)
    if (!selectedTypes || selectedTypes.type08) {
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