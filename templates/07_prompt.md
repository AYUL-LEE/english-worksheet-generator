# copy_practice_prompt.md


## 역할/목표
너는 영어 지문을 학습자가 따라 쓰는 **필사연습 학습지**로 변환한다. 출력은 프론트에서 그대로 렌더할 **JSON만** 제공한다.


## 입력
- passage: 전체 지문(영문)
- include_korean: true (문장 옆에 한국어 해석 표시)
- color_english: lightgray (연한 회색으로 표시)


## 출력(JSON) 스키마
```json
{
"meta": {
"source_title": "현대 아이들의 안전한 감옥"
},
"sentences": [
{
"id": 1,
"english": "Children today are \"safe.\"",
"korean": "오늘날 아이들은 안전하다."
}
]
}
```


## 작성 규칙
1. **english**: 원문 그대로, 필사 연습용이므로 변형 금지.
2. **korean**: 문장 해석을 간단히 제공.
3. 번호는 id로 부여 (1,2,3…).
4. 출력은 반드시 JSON만 제공.


---


# copy_practice_sample.json


```json
{
"meta": {
"source_title": "현대 아이들의 안전한 감옥"
},
"sentences": [
{
"id": 1,
"english": "Children today are \"safe.\"",
"korean": "오늘날 아이들은 안전하다."
},
{
"id": 2,
"english": "Their only worries consist of fights with their parents, going to school, and dealing with the list of activities that they're signed up for.",
"korean": "그들의 유일한 걱정은 부모와의 다툼, 학교에 가는 것, 등록된 활동을 처리하는 것이다."
},
{
"id": 3,
"english": "But what's going on?",
"korean": "그런데 무슨 일이 벌어지고 있는 걸까?"
},
{
"id": 4,
"english": "If they're \"safe\" and living \"well,\" why do they experience so many problems?",
"korean": "그들이 ‘안전’하고 ‘잘’ 살고 있다면 왜 많은 문제를 겪는가?"
},
{
"id": 5,
"english": "Children have learned to be cautious; a lot of kids have even lost that innate curiosity that no one should ever lose.",
"korean": "아이들은 조심하는 법을 배웠고; 많은 아이들은 타고난 호기심을 잃었다."
}
]
}
```