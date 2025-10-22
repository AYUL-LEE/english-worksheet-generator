import OpenAI from 'openai';
import { renderAllTypes } from '../utils/templateRenderer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { passages, apiKey, model, selectedTypes } = req.body;

  if (!apiKey || !passages || passages.length === 0) {
    return res.status(400).json({ error: '필수 입력값이 없습니다.' });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const allResults = {};
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
    "korean_title": "적절한 한글 제목",
    "english_title": "적절한 영문 제목"
  },
  "type_01_문단개요": {
    "본문학습": "원문 텍스트",
    "문단구성": {
      "서론": "서론 내용 요약",
      "본론": "본론 내용 요약",
      "결론": "결론 내용 요약"
    },
    "문단요약": {
      "영문": "영문 요약 1-2문장",
      "한글": "한글 요약 1-2문장"
    },
    "예상문제": ["제목", "주제", "요지", "주장", "목적", "요약", "순서", "삽입", "연결", "무관", "일치", "불일치", "빈칸", "함축", "서술"]
  },
  "type_02_본문노트_직독직해": {
    "sentences": [
      {
        "num": 1,
        "english": "영어 문장",
        "korean_slash": "영어 / 어순대로 / 슬래시로 / 끊어서 / 해석"
      }
    ]
  },
  "type_03_본문노트_의역": {
    "sentences": [
      {
        "num": 1,
        "english": "영어 문장",
        "korean_natural": "자연스러운 한글 의역"
      }
    ]
  },
  "type_04_문장분석": {
    "meta": {
      "source_title": "지문 제목",
      "labels_ko": ["주어","동사","목적어","보어","전치사구","관계사절","접속사","의문사","조동사","동명사","분사","담화표지"]
    },
    "sentences": [
      {
        "id": 1,
        "english": "영어 문장",
        "korean": "한글 해석",
        "tokens": [
          {
            "text": "단어나 구",
            "label_ko": "주어|동사|목적어|보어|전치사구|관계사절|접속사|의문사|조동사|동명사|분사|담화표지",
            "underline": true,
            "red_highlight": false,
            "is_discourse_marker": false
          }
        ],
        "points": [
          {
            "type": "vocab",
            "headword": "핵심단어",
            "explain_ko": "뜻 설명",
            "synonyms": ["유의어1", "유의어2"],
            "antonyms": ["반의어1"]
          },
          {
            "type": "grammar",
            "title": "문법 제목",
            "explain_ko": "문법 설명"
          }
        ]
      }
    ]
  },
  "type_05_어순배열": {
    "sentences": [
      {
        "num": 1,
        "hint": "평서문|의문문|조건절+주절|관계사절 포함|수동태 구문|분사구문 등",
        "bank": "조각1 / 조각2 / 조각3 / 조각4 / ...",
        "korean": "한글 해석"
      }
    ]
  },
   "type_06_단어": {
    "meta": {
      "source_title": "지문 제목"
    },
    "words": [
      {
        "id": 1,
        "word": "영어단어",
        "pos": "명|동|형|부|전|접|대|조",
        "meaning": ""
      }
    ]
  },
  "type_07_구문": {
    "meta": {
      "source_title": "지문 제목"
    },
    "sentences": [
      {
        "id": 1,
        "english": "영어 문장 (원문 그대로)",
        "korean": "한글 해석",
        "grammar_explanation": "구문 설명"
      }
    ]
  },
  "type_08_핵심어휘": {
    "words": [
      {
        "num": 1,
        "word": "핵심단어",
        "pos": "품사",
        "meaning": "한글 뜻",
        "synonyms": ["동의어1", "동의어2"],
        "antonyms": ["반의어1", "반의어2"]
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
  }
}

# 작성 지침

**중요: 반드시 모든 문장을 개별적으로 분리하세요!**

1. **문장 분리**: 마침표(.), 물음표(?), 느낌표(!) 기준으로 모든 문장을 개별 분리
   - 예시: 지문에 7개 문장이 있으면 sentences 배열에 7개 객체 필요
2. 직독직해: 영어 어순대로 / 슬래시로 끊어서
3. 의역: 자연스러운 한국어
4. 어순배열: 의미 단위로 끊기
5. 단어: 핵심 단어 10-15개 (뜻 비우기)
6. 핵심어휘: 수능/내신 빈출 10-15개
7. 문법: 수능/내신 중요 문법만

**type_04_문장분석 세부 규칙:**
- 라벨은 전부 한국어: 주어/동사/목적어/보어/전치사구/관계사절/접속사/의문사/조동사/동명사/분사/담화표지
- 밑줄 표시는 토큰 단위: underline:true를 주면 해당 단어·구에만 밑줄. 라벨은 label_ko에 기입
- 문법 하이라이트(빨간 굵게): red_highlight:true (예: 현재완료 have+pp, 수동태 be+pp, 관계사절 that…, 동명사/분사 등)
- 담화표지: is_discourse_marker:true 추가
- 문장별 포인트(points): vocab(headword 굵게, 유의어/반의어 포함), grammar(title + explain_ko)
- "출제포인트"라는 단어는 넣지 않음
- 중복 표기 금지: 문장 상단에 "현재완료/조건절" 같은 라벨은 쓰지 않음
- 정확도: 문장 단위 잘못 분리 금지, 모호할 땐 최소 단위만 밑줄


**type_05_어순배열 세부 규칙:**
- 각 문장을 최소 4~10개의 의미 조각으로 나눔
- bank는 슬래시(/)로 구분하되, 조각 앞뒤 공백 유지: "조각1 / 조각2 / 조각3"
- 조각 기준: 주어 / 동사구 / 목적어 / 부사구 / 전치사구 / 접속사절 등 의미 단위
- hint에는 문장 구조 특징 명시 (예: "평서문", "의문문", "조건절+주절", "관계사절 포함", "수동태")
- 너무 세분화하지 말고, 학생이 조립할 수 있는 적절한 크기로 나눔
- 해석은 자연스러운 한국어로 제공

**예시:**
{
  "num": 1,
  "hint": "평서문",
  "bank": "Children today / are / safe",
  "korean": "오늘날 아이들은 안전하다."
},
{
  "num": 2,
  "hint": "관계사절 포함",
  "bank": "Their only worries / consist of / fights with their parents / and dealing with / the list of activities / that they're signed up for",
  "korean": "그들의 유일한 걱정은 부모와의 다툼, 그리고 등록된 활동 목록을 처리하는 일이다."
}


**type_06_단어 세부 규칙:**
- word: 영어 단어, 지문 내 중요한 어휘만 추출 (10-15개)
- pos: 품사는 한국어 약칭으로 (명/동/형/부/전/접/대/조 등)
  * 명: 명사, 동: 동사, 형: 형용사, 부: 부사
  * 전: 전치사, 접: 접속사, 대: 대명사, 조: 조동사
  * 복합 가능: "동/명" (동사이면서 명사)
- meaning: **반드시 빈 문자열("")로 둠** (학생이 직접 작성하도록)
- id는 1부터 순차적으로 부여
- 중요 어휘 선정 기준:
  * 수능/내신 빈출 어휘
  * 지문 이해에 핵심적인 단어
  * 학습 가치가 높은 어휘
  * 기본 단어(the, is, and 등)는 제외

**예시:**
{
  "meta": {
    "source_title": "AI 로봇과 일반 로봇의 차이"
  },
  "words": [
    {"id": 1, "word": "difference", "pos": "명", "meaning": ""},
    {"id": 2, "word": "ability", "pos": "명", "meaning": ""},
    {"id": 3, "word": "adapt", "pos": "동", "meaning": ""},
    {"id": 4, "word": "deterministic", "pos": "형", "meaning": ""},
    {"id": 5, "word": "circumstance", "pos": "명", "meaning": ""}
  ]
}


**type_07_구문 세부 규칙:**
- english: 원문 그대로, 필사 연습용이므로 절대 변형 금지
- korean: 문장의 자연스러운 한국어 해석
- grammar_explanation: 해당 문장의 주요 구문 특징을 1-2줄로 간단히 설명
  * 예: "be동사 + 형용사 보어의 기본 구조"
  * 예: "관계대명사 that이 이끄는 절이 activities를 수식"
  * 예: "if 조건절 + why 의문문의 복합 구조"
- id는 1부터 순차적으로 부여
- 모든 문장 포함 (필사 연습용이므로 생략 금지)

**예시:**
{
  "meta": {
    "source_title": "AI 로봇과 일반 로봇의 차이"
  },
  "sentences": [
    {
      "id": 1,
      "english": "The basic difference between an AI robot and a normal robot is the ability of the robot and its software to make decisions.",
      "korean": "AI 로봇과 일반 로봇의 기본적인 차이는 로봇과 그 소프트웨어가 결정을 내리는 능력이다.",
      "grammar_explanation": "주격 보어로 명사구(the ability ~)가 사용된 2형식 구조"
    },
    {
      "id": 2,
      "english": "An AI robot can do two things the normal robot cannot: make decisions and learn from experience.",
      "korean": "AI 로봇은 일반 로봇이 할 수 없는 두 가지를 할 수 있다: 결정을 내리고 경험에서 배우는 것.",
      "grammar_explanation": "관계대명사 생략 + 콜론(:) 뒤 동사원형 나열 구조"
    }
  ]
}


**다시 강조: type_02, type_03, type_04, type_05, type_07, type_09는 sentences 배열에 지문의 모든 문장이 포함되어야 합니다!**

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
      console.log('원본 텍스트 일부:', jsonText.substring(0, 500));

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
          type_03: jsonData.type_03_본문노트_의역?.sentences?.length || 0,
          type_04: jsonData.type_04_문장분석?.sentences?.length || 0,
        }
      });

      console.log(`✅ 지문 ${i+1} 완료 - 토큰: ${completion.usage.total_tokens}`);

      // JSON → HTML 변환
      const htmlResults = renderAllTypes(jsonData);

      // 결과 저장
      for (const [type, html] of Object.entries(htmlResults)) {
        allResults[`${type}_passage${i}`] = {
          type: type,
          title: type.replace(/_/g, ' '),
          content: html,
          passageNum: i
        };
      }
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