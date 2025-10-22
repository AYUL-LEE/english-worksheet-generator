**출력 형식(JSON)**

```json
{
"meta": {
"source_title": "현대 아이들의 안전한 감옥",
"labels_ko": ["주어","동사","목적어","보어","전치사구","관계사절","접속사","의문사","조동사","동명사","분사","담화표지"]
},
"sentences": [
{
"id": 1,
"english": "Children today are \"safe.\"",
"korean": "오늘날 아이들은 \"안전하다\".",
"tokens": [
{"text":"Children today","label_ko":"주어","underline":true},
{"text":"are","label_ko":"동사","underline":true,"red_highlight":true},
{"text":"\"safe\"","label_ko":"보어","underline":true,"red_highlight":true}
],
"points": [
{"type":"vocab","headword":"safe","explain_ko":"안전한","synonyms":["secure"],"antonyms":["dangerous"]},
{"type":"grammar","title":"be 동사 + 보어","explain_ko":"주어의 상태를 서술하는 기본 형식"}
]
}
]
}
```


**세부 규칙**
1. **라벨은 전부 한국어**: 주어/동사/목적어/보어/전치사구/관계사절/접속사/의문사/조동사/동명사/분사/담화표지.
2. **밑줄 표시는 토큰 단위**: `underline:true`를 주면 해당 단어·구에만 밑줄. 라벨은 `label_ko`에 기입.
3. **문법 하이라이트(빨간 굵게)**: `"red_highlight": true`. (예: 현재완료 have+pp, 수동태 be+pp, 관계사절 that…, 동명사/분사 등)
4. **담화표지**: `"is_discourse_marker": true` 추가. (프론트에서 `.dm` 스타일로 연보라 처리)
5. **문장별 포인트(points)**:
- vocab: `headword` 굵게 표시, 유의어/반의어 포함.
- grammar: `title` + `explain_ko`.
- "출제포인트"라는 단어는 넣지 않는다. 각 문장 박스 하단에 ①②③으로 렌더.
6. **중복 표기 금지**: 문장 상단에 "현재완료/조건절" 같은 라벨은 쓰지 않는다.
7. **정확도**: 문장 단위 잘못 분리 금지, 모호할 땐 최소 단위만 밑줄.