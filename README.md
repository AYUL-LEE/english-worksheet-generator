# 평택 베리타스학원 — 영어 내신 대비 학습지 생성기

## 실행 방법
```
node server.js
```
→ http://localhost:3000

---

## 현재 구현된 기능

### 분석서 유형 (지문별 1장씩)
| 코드 | 이름 | 내용 |
|------|------|------|
| 01 | 본문노트 | 번호 본문 + 논리흐름 + 웹툰 이미지 |
| 03 | 문장해석 | 영어-한국어 문장별 대조 + 단어노트 |
| 08 | 핵심어휘 | 동의어/반의어 포함 20단어 테이블 |
| 09 | 한줄해석 | 문장별 영어 + 쓰기 칸 |

### 워크북 유형 (전체 지문 합산, 한 장에)
| 코드 | 이름 | 내용 |
|------|------|------|
| WB1 | 어법선택 | 지문에 [A/B] 선택지 삽입 |
| WB2 | 어법수정 | 지문에 틀린 단어 표시 후 고쳐쓰기 |
| WB3 | 어휘선택 | 지문에 [맞는어휘/틀린어휘] 선택지 삽입 |
| WB4 | 순서배열 | 문장 순서 섞기 (A-B-C 레이블) |

### 테스트
| 코드 | 이름 | 내용 |
|------|------|------|
| 단어 | 단어테스트 | 핵심어휘 단어장 (뜻 빈칸) |

### 페이지 출력 순서
```
본문노트(지문1) → 본문노트(지문2) →
문장해석(지문1) → 문장해석(지문2) →
핵심어휘(지문1) → 핵심어휘(지문2) →
단어테스트(전지문) →
한줄해석(지문1) → 한줄해석(지문2) →
어법선택(전지문) → 어법수정(전지문) →
어휘선택(전지문) → 순서배열(전지문)
```

---

## 개발 로드맵

### Phase 1 — DB 연동 + History 저장 ⭐ 최우선

**목표:** 생성한 학습지를 저장하고 재사용

#### DB 선택: **Supabase** (Vercel 배포 중이므로)

> ⚠️ **Vercel은 서버리스 환경** → 파일시스템이 읽기 전용 → SQLite 사용 불가
> `/tmp`는 쓸 수 있지만 요청 끝나면 삭제됨 → 영구 저장 불가

| DB | 무료 한도 | Vercel 연동 | 비고 |
|----|-----------|-------------|------|
| **Supabase** ✅ | 500MB, 무제한 요청 | 공식 통합 | **최추천** |
| Neon | 0.5GB | Vercel 공식 파트너 | PostgreSQL |
| Turso | 8GB | 직접 연결 | SQLite 문법 |
| MongoDB Atlas | 512MB | 직접 연결 | JSON 친화적 |
| ~~SQLite~~ | — | ❌ 사용 불가 | Vercel 파일시스템 제한 |

**Supabase 선택 이유:**
- `npm install @supabase/supabase-js` 하나로 끝
- 웹 대시보드에서 DB 직접 조회/편집 가능
- REST API 자동 생성 → 드라이버 없이 `fetch`로 쿼리
- 환경변수 `SUPABASE_URL` + `SUPABASE_ANON_KEY` 만 추가하면 Vercel 연동 완료
- 나중에 로그인 기능 추가 시 Supabase Auth도 무료

#### DB 스키마 설계

```sql
-- 학교 테이블
CREATE TABLE schools (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,       -- "평택 베리타스학원"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 학습지 세트 (생성 1회 = 1개 row)
CREATE TABLE worksheets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id   INTEGER REFERENCES schools(id),
  seq_num     INTEGER NOT NULL,  -- 자동 증가 번호 (001, 002 ...)
  page_title  TEXT NOT NULL,     -- "리얼고 1학년 26년 1학기 중간고사 대비"
  passage_count INTEGER,
  selected_types TEXT,           -- JSON으로 저장 {"type01":true, ...}
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 개별 지문 JSON 데이터
CREATE TABLE passages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  worksheet_id INTEGER REFERENCES worksheets(id) ON DELETE CASCADE,
  passage_idx  INTEGER,          -- 0, 1, 2 ... (몇 번째 지문)
  korean_title TEXT,
  english_title TEXT,
  json_data    TEXT NOT NULL,    -- GPT 응답 JSON 전체 저장
  webtoon_url  TEXT,             -- DALL-E 이미지 URL
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 구현할 API
```
POST /api/generate-worksheet    → 기존 (생성 후 DB 저장 추가)
GET  /api/history               → 전체 history 목록
GET  /api/history/:id           → 특정 학습지 상세 (JSON 포함)
DELETE /api/history/:id         → 삭제
GET  /api/schools               → 학교 목록
POST /api/schools               → 학교 추가
```

---

### Phase 2 — History에서 PDF 재다운로드 (GPT 없이)

**목표:** 이미 생성한 학습지를 DB에서 불러와서 유형 선택 → PDF 즉시 다운로드

#### 플로우
```
History 목록 → 학습지 선택 →
유형 체크박스 선택 (어떤 유형만 뽑을지) →
"PDF 다운로드" 클릭 →
서버에서 DB JSON → templateRenderer → HTML → PDF 변환
```

#### 구현 포인트
- `/api/history/:id/render` — DB의 JSON을 가져와서 templateRenderer로 HTML 생성
- 프론트에서 체크박스로 원하는 유형만 선택 가능
- GPT API 호출 없음 → 비용 0, 속도 빠름
- 웹툰 이미지 URL이 만료됐을 경우 placeholder 이미지 대체 처리 필요

---

### Phase 3 — 학교별 History 관리 UI

**목표:** 학교/반 단위로 학습지를 분류하고 관리

#### UI 기능 목록
- [ ] 좌측 사이드바: 학교 목록 (학교 추가/삭제)
- [ ] 학교 선택 시 해당 학교 학습지 목록 표시
- [ ] 목록 컬럼: `번호 | 제목 | 지문수 | 생성일 | 다운로드 | 삭제`
- [ ] 개별 삭제 + 다중 선택 삭제
- [ ] 검색/필터 (날짜, 제목 키워드)
- [ ] 학습지 클릭 시 상세 미리보기 (iframe)

#### 학습지 번호 자동 생성
```
학교ID + seq_num 조합으로 고유 키
예: BV-001, BV-002, BV-003 ...
```

---

### Phase 4 — 추가 기능 (미래)

- [ ] **이미지 저장**: DALL-E URL은 1시간 후 만료 → 생성 시 이미지 파일로 로컬 저장
- [ ] **지문 편집**: DB에 저장된 JSON 수동 수정 UI
- [ ] **인쇄 미리보기**: 프린트 전 A4 레이아웃 확인 팝업
- [ ] **유형별 개별 PDF**: 본문노트만, 워크북만 따로 다운로드
- [ ] **웹 배포**: Supabase + Vercel/Railway로 클라우드 이전
- [ ] **학생별 관리**: 학생 이름 입력 → 개인별 이름 인쇄

---

## 파일 구조

```
english-worksheet-generator/
├── server.js                  # Express 서버 (포트 3000)
├── api/
│   └── generate-worksheet.js  # GPT + DALL-E 호출, HTML 생성
├── utils/
│   └── templateRenderer.js    # 모든 HTML 템플릿 렌더링 함수
├── public/
│   ├── index.html             # 메인 UI
│   └── script.js              # 프론트엔드 로직
├── db/                        # (Phase 1에서 생성)
│   ├── schema.sql             # DB 스키마
│   └── database.js            # SQLite 연결 모듈
└── README.md
```

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 서버 | Node.js + Express |
| AI | OpenAI GPT-4o-mini (텍스트) + DALL-E 3 (이미지) |
| DB | SQLite (better-sqlite3) → 추후 Supabase |
| 프론트 | Vanilla JS (프레임워크 없음) |
| 인쇄 | CSS @page A4, 브라우저 Print to PDF |
