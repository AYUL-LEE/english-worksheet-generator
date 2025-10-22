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
    "문단구성": {
      "서론": "서론 내용 요약",
      "본론": "본론 내용 요약",
      "결론": "결론 내용 요약"
    },
    "문단요약": {
      "영문": "영문 요약 1-2문장",
      "한글": "한글 요약 1-2문장"
    },   
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
2. 핵심어휘는  20개의 단어로 선정해주세요. 난이도는 수능 난이도 단어로 해주세요. 

**다시 강조: type_03, type_09는 sentences 배열에 지문의 모든 문장이 포함되어야 합니다!**

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