# Project Development Logs

---

## 2026-03-26 — 서비스화 프로젝트 계획 수립

### 결정 사항

**기존 분석 프로젝트 2개를 실제 웹 서비스로 전환하기로 결정**

풀스택 역량 강화 목적. 분석만 한 게 아니라 서비스까지 만들 수 있다는 걸 보여주기 위함.

---

### 1순위: CryptoVol Dashboard (P학기 GARCH → 개인 프로젝트 확장)

- **원본**: P학기 팀 프로젝트 — 암호화폐 변동성 비교 분석 (GARCH 5개 모형)
- **서비스**: 실시간 암호화폐 변동성 예측 대시보드
- **포트폴리오 분류**: Personal (팀 프로젝트를 개인 프로젝트로 확장)
- **레포**: 별도 레포로 생성 (독립 풀스택 프로젝트)
- **데이터**: 실시간 BTC 데이터 (CoinGecko API 등)
- **배포**: 풀스택 (프론트 + 백엔드 + 배포)
- **스택**:
  - Frontend: React + Recharts
  - Backend: FastAPI + 스케줄러
  - DB: PostgreSQL (or SQLite for MVP)
- **핵심 기능**:
  - 5개 GARCH 모형 실시간 변동성 예측 비교
  - FNG 지수 + 거래량 시각화
  - "오늘 비트코인 위험도" 점수 (모형 기반)
  - 사용자가 날짜 범위 선택해서 백테스팅
- **포트폴리오 서브페이지**: 개인 프로젝트 카테고리, "팀 프로젝트(P학기)를 개인 프로젝트로 확장하여 실서비스 배포" 스토리

### 2순위: Seoul Culture Map (학술제 → 개인 프로젝트 확장)

- **원본**: 학술제 — 서울시 문화·여가시설 현황 분석 (R)
- **서비스**: 서울 문화시설 탐색 인터랙티브 맵
- **스택**: React + Leaflet, FastAPI + PostgreSQL/PostGIS
- **핵심 기능**: 6카테고리 지도 마커, 밀집도 히트맵, 위치 기반 추천
- **상태**: 개발 중 (2026-03-26 착수)
- **레포**: https://github.com/ykgstar37-lab/seoul-culture-map

---

### TODO

- [x] CryptoVol Dashboard 별도 레포 생성 (바탕 화면/personal/)
- [x] FastAPI 백엔드 셋업 (CoinGecko API + FNG 연동)
- [x] GARCH 5개 모형 서빙 모듈
- [x] React 프론트엔드 대시보드 (Recharts, Tailwind)
- [x] 사이드바 메뉴 + 한/영 토글 + API 디버그 로그
- [x] 매매 시그널 (FNG + 변동성 + 모멘텀 종합)
- [x] 모형 정확도 리더보드 (최근 30일)
- [x] 인터랙티브 백테스트 (날짜 선택 → 성능 비교)
- [x] README.md 작성
- [x] 배포 (Render + Vercel)
- [x] GitHub 레포 생성 및 push
- [x] 포트폴리오에 Personal 프로젝트로 서브페이지 추가

---

### Seoul Culture Map TODO
- [x] 별도 레포 생성 (바탕 화면/personal/seoul-culture-map)
- [x] GitHub 레포 생성 및 push (ykgstar37-lab/seoul-culture-map)
- [x] 학술제 CSV 데이터 마이그레이션
- [x] README.md / DEVLOG.md 작성
- [x] FastAPI 백엔드 셋업 (CSV → SQLite → API)
- [x] React + Leaflet 인터랙티브 맵
- [x] 6개 카테고리 필터 사이드바
- [x] 자치구별 통계 카드
- [x] 시설 목록 패널
- [x] 밀집도 히트맵 (leaflet.heat 토글)
- [x] 검색 기능
- [x] 배포 (Render + Vercel)
- [x] 포트폴리오에 Personal 프로젝트로 서브페이지 추가

### Seoul Culture Map — v0.2 발전 계획 (2026-03-26)

**현재 아쉬운 점:**
- 정적 CSV 데이터 (2023년), 시설 개폐업 반영 안 됨
- 자치구 단위 집계만, 개별 시설 위치(좌표) 없음
- 관광 목적 태그가 실제 필터링 미연결
- 다국어 미지원 (원본 주제: 외국인 관광객)
- 모바일 미대응

**우선순위 높은 기능 (v0.2):**
- [ ] 서울 공공데이터 API 연동 — 정적 CSV → 실시간 시설 데이터 갱신
- [ ] 개별 시설 마커 — 자치구 중심점 → 실제 시설 좌표 핀 표시
- [ ] AI 관광 코스 추천 — GPT 기반 맞춤 코스 (마스코트 팝업)

**추후 기능 (v0.3+):**
- [ ] 경로 최적화 — 선택 시설 간 최적 동선 (Kakao/Naver 길찾기 연동)
- [ ] 다국어 (EN/JP/ZH) — 원본 주제(외국인 관광) 살리기
- [ ] 자치구 비교 모드 — 2개 자치구 나란히 비교
- [ ] 즐겨찾기 + 나만의 코스 — 사용자 시설 저장 + 코스 생성
- [ ] 모바일 반응형

### 포트폴리오 구성 결정 (2026-03-26)
- **기존 CryptoVolatility (Team)** — P학기 팀 분석 프로젝트. 그대로 유지.
- **새 CryptoVol Dashboard (Personal)** — 개인 확장 서비스. 별도 카드 + 서브페이지.
- 서브페이지에서 "팀 프로젝트를 기반으로 개인 풀스택 서비스로 확장" 스토리 포함

---

## 2026-03-27 — 포트폴리오 리뷰 아쉬운 점

### 우선순위 높음
1. ~~**`/study` 라우트 미등록**~~ — **해결 (2026-03-27)**: FloatingNav에서 홈 `#research` anchor로 스크롤하도록 변경
2. ~~**FloatingNav 모바일 미지원**~~ — **해결 (2026-03-27)**: `onTouchStart` 추가하여 터치 기기에서 토글 가능
3. **개인 프로젝트 페이지(CryptoVolDashboard, SeoulCultureMap)에 스크린샷/데모 없음** — 풀스택 서비스인데 실제 UI 보여주는 이미지가 상세 페이지에 없음

### 우선순위 중간
4. ~~**App.jsx projects 배열 중복**~~ — **해결 (2026-03-28)**: `ALL_PROJECTS` 단일 배열로 통합, `DEV_PROJECTS`/`STAT_PROJECTS`는 filter로 파생
5. ~~**팀 프로젝트(SeoulCulture, CryptoVolatility)에 My Contributions 섹션 누락**~~ — **해결 (2026-03-28)**: 두 팀 프로젝트에 My Contributions 섹션 + SectionDotNav 항목 추가
6. ~~**CryptoVolatility MODEL_PARAMS R2 값 불일치**~~ — **해결 (2026-03-28)**: MODEL_PARAMS, RADAR_DATA R² 값을 실제 성능 테이블 수치와 일치시킴
7. ~~**Origin Story 카드 + 테이블 내용 중복**~~ — **해결 (2026-03-28)**: CryptoVolDashboard, SeoulCultureMap에서 중복 카드 제거, 테이블만 유지

### 우선순위 낮음
8. ~~**Study 카드 `cursor-pointer`인데 `onClick` 없음**~~ — **해결 (2026-03-27)**: `cursor-default`로 변경
9. ~~**Footer 'Research' anchor**~~ — **해결 (2026-03-27)**: 섹션 id를 `research`로 통일, Nav/FloatingNav도 모두 `#research`로 변경
10. ~~**PyMate Tech Stack**~~ — **해결 (2026-03-28)**: 플랫 배열 → 카테고리별 객체(Backend, AI & RAG, Database, Infra, Frontend)로 통일
11. ~~**"Book A Call" 표현**~~ — **해결 (2026-03-27)**: "Get In Touch"로 변경

---

## 2026-03-27 — 포트폴리오 구조 개선 피드백

### 추가하면 좋은 것
12. **개인 프로젝트 상세 페이지에 스크린샷/데모 영상 추가** — CryptoVolDashboard, SeoulCultureMap 페이지에 실제 UI 이미지가 없음. GIF가 카드에만 있고 상세 페이지 안에도 필요
13. ~~**About 섹션 자기소개 보강**~~ — **해결 (2026-03-28)**: 통계학과 + AI Camp + 풀스택 배경을 2문장으로 보강
14. ~~**프로젝트별 "배운 점/회고" 한 줄**~~ — **해결 (2026-03-28)**: 6개 서브페이지 모두 Retrospective 섹션 추가 (Tech Stack 아래)

### 빼거나 줄이면 좋은 것
15. ~~**Origin Story 카드 + 테이블 중복 제거**~~ — **해결 (2026-03-28)**: 테이블만 남기고 카드 제거
16. ~~**ASCII 아키텍처 다이어그램**~~ — **해결 (2026-03-28)**: PyMate, WorkFlowAgent의 ASCII art를 React flow 컴포넌트로 대체
17. ~~**Tech Stack 반복 나열**~~ — **해결 (2026-03-28)**: 6개 페이지 모두 카테고리별 객체 형식으로 통일 (CryptoVolatility, SeoulCulture도 변환)

### 개선하면 좋은 것
18. ~~**프로젝트 순서 변경**~~ — **해결 (2026-03-28)**: ALL_PROJECTS에서 Personal(CryptoVol Dashboard, Seoul Culture Map)을 앞으로 배치
19. **모바일 반응형 점검** — 전체 레이아웃 모바일 대응 확인 필요. 포트폴리오는 모바일 비율 높음
20. **pymate.gif 리사이즈** — 2650x1590으로 너무 큼. 400x250 수준으로 리사이즈하여 로딩 속도 개선
21. **hover overlay + 카드 클릭 동선 정리** — 데스크탑에서 overlay가 카드 클릭 영역을 가려서 혼란. 모바일에서는 hover 없어서 문제 없지만 데스크탑 UX 개선 필요

---

## 2026-03-28 — 스크린샷 갤러리 + SectionDotNav + 서브페이지 보강

### 완료

- **SectionDotNav 공통 컴포넌트** 생성 (`src/components/SectionDotNav.jsx`)
  - 오른쪽 고정 텍스트 인덱스 네비게이션 (xl 이상 표시)
  - IntersectionObserver로 현재 섹션 자동 하이라이트 + 클릭 시 스무스 스크롤
  - 처음엔 점(dot) 방식 → 텍스트 라벨 방식으로 변경 (가독성)
  - **6개 서브페이지 모두 적용**: CryptoVolDashboard, CryptoVolatility, PyMate, SeoulCulture, SeoulCultureMap, WorkFlowAgent

- ~~**개인 프로젝트 페이지에 스크린샷/데모 없음 (#3, #12)**~~ — **해결**:
  - **CryptoVolDashboard**: 6개 스크린샷 갤러리 추가 (Main, Dark Mode, Signal, Portfolio, FNG, AI Briefing) + Lightbox (좌우 탐색)
  - **SeoulCultureMap**: 6개 스크린샷 갤러리 추가 (Culture Map, Analytics, Course, Favorites, Subway, AI 코스 추천) + Lightbox

- **SeoulCultureMap 서브페이지 보강**:
  - Overview Stats 4개 → 8개 (API Endpoints, Subway Lines, Clusters, Categories 추가)
  - **API Endpoints 섹션 신규** — 11개 엔드포인트 테이블 (GET/POST 메서드 뱃지)
  - **K-means Clustering 섹션 신규** — 5개 군집 상세 (소속 자치구 + 문화시설 특성)

- **Seoul Culture Map TODO 업데이트**:
  - [x] 배포 (Render + Vercel)
  - [x] 포트폴리오에 Personal 프로젝트로 서브페이지 추가

---

## 2026-03-28 — 코드 품질 개선 + 모바일 반응형 + SectionDotNav 스타일링

### 완료

- **#4 App.jsx projects 배열 중복 제거** — `ALL_PROJECTS` 단일 배열로 통합, `DEV_PROJECTS`/`STAT_PROJECTS`는 filter로 파생
- **#5 팀 프로젝트 My Contributions 추가** — SeoulCulture, CryptoVolatility 두 팀 프로젝트에 My Contributions 섹션 + SectionDotNav 항목 추가
- **#6 CryptoVolatility R² 값 불일치 수정** — MODEL_PARAMS, RADAR_DATA R² 값을 실제 성능 테이블 수치와 일치시킴
- **#15 Origin Story 카드+테이블 중복 제거** — CryptoVolDashboard, SeoulCultureMap에서 중복 카드 제거, 테이블만 유지
- **#18 프로젝트 순서 변경** — Personal(CryptoVol Dashboard, Seoul Culture Map)을 앞으로 배치
- **#13 About 자기소개 보강** — 통계학과 + AI Camp + 풀스택 배경 2문장으로 보강
- **#16 ASCII 아키텍처 → flow 컴포넌트 대체** — PyMate, WorkFlowAgent의 ASCII art를 React flow 컴포넌트로 대체

- **모바일 반응형 전면 개선**:
  - App.jsx: Nav 모바일 축약 메뉴, Hero 텍스트/패딩 반응형, ProjectCard 모바일 info 표시 (hover 대신)
  - 전역 패딩 `px-8 → px-4 sm:px-8`, 섹션 `py-32 → py-16 sm:py-32`
  - 모든 제목 중간 브레이크포인트 추가 (`text-3xl → text-2xl sm:text-3xl` 등, 70+곳)
  - 6개 서브페이지 컨테이너 패딩/타이틀 모바일 대응
  - FloatingNav 버튼/패딩/텍스트 모바일 축소
  - About 섹션: 모바일에서 프로필 사진을 Core Strength 왼쪽에 원본 비율로 배치
  - Hero 프로필 사진 overlay 모바일 숨김, Scroll 버튼 모바일 숨김
  - `overflow-x: hidden` 글로벌 추가

- **SectionDotNav 스타일링 변경**:
  - 기본색 `#2b4fcb`(파란색) → `#444`(어두운 그레이)로 변경
  - `highlight: true` 항목은 항상 주황색(`#e27500`) 텍스트 표시
  - CryptoVolatility: Presentation Slides, Research Paper (이름 변경) 주황색
  - CryptoVolDashboard, SeoulCultureMap: Screenshots 주황색
  - SeoulCulture: Presentation Slides 주황색

---

## 2026-03-29 — CryptoVol / CultureMap 스크린샷 GIF 추가 + 순서 정리

### 완료

- **CryptoVolDashboard GIF 4개 추가**:
  - `coin-switch-eth.gif` — BTC → ETH 코인 전환 데모
  - `coin-switch-sol.gif` — ETH → SOL 코인 전환 데모
  - `dark-ai-briefing.gif` — 다크모드 전환 + AI 브리핑 인터랙션
  - `portfolio-sim.gif` — Monte Carlo 포트폴리오 시뮬레이션 실행 과정
  - 스크린샷 6장 → 10장 (정적 6 + GIF 4)

- **SeoulCultureMap GIF 4개 (기존)** — 이전 세션에서 추가됨:
  - `culturemap-explore.gif`, `culturemap-analytics-modes.gif`, `culturemap-course-ai.gif`, `culturemap-subway.gif`

- **스크린샷 순서 재배치 (양쪽 모두)**:
  - 관련 정적 스크린샷 바로 뒤에 해당 GIF 배치 (정적 → 동적 데모 흐름)
  - CryptoVol: 메인 → 코인전환 GIF 2개 → 다크모드 → 시그널 → 포트폴리오 → 시뮬 GIF → FNG → AI → AI GIF
  - CultureMap: 메인 → 탐색 GIF → Analytics → 분석 GIF → Course → AI → AI GIF → Favorites → 지하철 → 지하철 GIF

---

### TODO — 다음 작업

#### WorkFlowAgent 스크린샷 갤러리
`src/assets/workflowagent/` 폴더에 스크린샷 추가 후 갤러리 구현:
- [ ] 채팅 인터페이스 (Agent 대화 예시)
- [ ] 문서 처리 결과 (생성된 회의록/보고서)
- [ ] 일정 관리 (Google Calendar 연동)
- [ ] Intent 분류 성능 시각화

#### PyMate 스크린샷 갤러리
`src/assets/pymate/` 폴더에 스크린샷 추가 후 갤러리 구현:
- [ ] 학습할래용 채팅 UI
- [ ] 퀴즈풀래용 인터페이스
- [ ] 코드풀래용 AI 코드 리뷰 결과
- [ ] 스튜디오 7가지 학습 도구
- [ ] 학습 기록 관리 (북마크/히스토리)
