# 이력서용 프로젝트 정리 — SubFlow

## SubFlow — 구독 관리 풀스택 플랫폼 (Web + Mobile)

### 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | SubFlow — 구독 관리 플랫폼 |
| **기간** | 2026.03 ~ 2026.04 (진행중) |
| **유형** | 개인/팀 사이드 프로젝트 |
| **역할** | 풀스택 개발 (React Web · React Native Mobile · FastAPI Backend) |
| **한줄 소개** | 흩어진 구독 서비스를 한 곳에서 관리하고 지출 분석·중복 감지·절약 제안까지 제공하는 **풀스택 구독 관리 플랫폼** (Web + Mobile) |
| **GitHub** | (레포지토리 URL) |

---

### 프로젝트 설명

Netflix · Spotify · ChatGPT Plus · YouTube Premium 등 점점 늘어나는 개인 구독 서비스를 한 곳에서 관리하고, 월 지출을 시각화하며 결제일 알림과 절약 제안을 받을 수 있는 **풀스택 구독 관리 서비스**를 직접 설계 · 구현했습니다.

**해결한 문제**
- 사용자가 자신이 매달 얼마를 어떤 서비스에 쓰고 있는지 파악하기 어려운 문제
- 비슷한 카테고리의 중복 구독(YouTube Music + Spotify 등)으로 인한 불필요한 지출
- 외화 구독의 환율 변동에 따른 실제 지출 변화 인지 부족
- 무료체험 만료일 누락으로 인한 의도치 않은 결제

**구현한 클라이언트**
- **Web**: React 19 + Vite + Tailwind 기반 반응형 SPA
- **Mobile**: Expo + React Native 기반 크로스플랫폼 앱
- **Backend**: 두 클라이언트가 공유하는 단일 FastAPI API

---

### 기술 스택

```
Web Frontend:  React 19 · TypeScript · Vite 8 · Zustand 5
               Recharts 3 · Tailwind CSS 4 · React Router 7
               Axios (JWT 인터셉터) · react-hot-toast · date-fns
Mobile:        Expo SDK 54 · React Native 0.81 · Expo Router
               Zustand + AsyncStorage · expo-linear-gradient
               react-native-svg · 자체 i18n (한/영)
Backend:       FastAPI (async) · SQLAlchemy 2.0 · Alembic
               PostgreSQL 16 · Pydantic v2 · JWT + bcrypt
External:      Frankfurter API (환율)
Infra:         Docker Compose · pytest
```

---

### 주요 기능

- **구독 관리** — 30+ 서비스 카탈로그 + 커스텀 구독, active/paused/cancelled/trial 상태 관리
- **대시보드** — Bento Grid + Glassmorphism UI, 월/연간 총 지출, 다음 결제일 요약
- **지출 분석** — 카테고리별 파이차트 + 월별 추이 라인차트, 카테고리 색상/드릴다운
- **캘린더 ↔ 타임라인** — 결제일 캘린더 뷰와 구독 변경 이력 타임라인 탭 전환
- **예산 관리** — 월 예산 설정 + 초과 경고
- **환율 추적** — 외화 구독 KRW 자동 변환 + 임계치 알림 (Frankfurter API)
- **중복 감지** — 같은 카테고리 내 겹치는 서비스 탐지 + 절약 제안
- **무료체험 추적** — trial 구독 만료 D-day 카운트다운
- **알림 설정** — 결제 N일 전 알림, 푸시/이메일 토글
- **인증** — JWT 발급 · 인터셉터 · 401 자동 리다이렉트 · AsyncStorage 영속화

---

### 핵심 성과 및 기여

**Frontend — React 19 웹 SPA**
- React 19 + Vite + TypeScript 기반 9개 페이지 SPA 단독 구축
- **Bento Grid + Glassmorphism** 디자인 시스템 적용한 대시보드 리뉴얼
- **Recharts** 기반 카테고리 파이차트 / 월별 지출 라인차트 / 추이 차트 구현
- 카테고리 색상 토큰 + **차트 드릴다운** 인터랙션 적용
- Zustand 5로 인증 · 구독 · 분석 상태 관리, Axios 인터셉터로 JWT 자동 부착 + **401 자동 리다이렉트** 구현
- Tailwind CSS 4 기반 반응형 + 빈 상태/에러 처리 일관화

**Mobile — React Native (Expo) 앱**
- Expo SDK 54 + Expo Router 파일 기반 라우팅으로 크로스플랫폼 앱 구축
- 탭 6개(홈/구독/카탈로그/분석/캘린더/설정) + 인증 스택 분리
- **GradientButton** 공통 컴포넌트 시스템으로 Web/Mobile UI 톤 통일
- AsyncStorage로 Zustand 상태 영속화, react-native-svg로 차트 직접 구현
- 한국어/영어 i18n 지원

**Backend — FastAPI 비동기 API**
- FastAPI + Async SQLAlchemy 2.0으로 6개 라우터 / `/api/v1` 구조 설계
- PostgreSQL **8 테이블** 정규화 설계 + **Alembic 마이그레이션** + 가격 이력 추적 테이블
- JWT(bcrypt) 인증 + Pydantic v2 검증 + 의존성 주입(현재 유저)
- Frankfurter 환율 API 연동 → 외화 구독 KRW 변환 유틸 모듈 구현
- 30+ 서비스 카탈로그 시드 데이터 스크립트 작성
- pytest 백엔드 테스트 **30+** 작성 + analytics 버그 수정

---

### 기술적 도전과 해결

| 도전 | 해결 | 결과 |
|------|------|------|
| 서로 다른 화폐의 구독을 한 화면에 표시 | Frankfurter API 연동 + KRW 변환 유틸 + 임계치 알림 | 환율 변동까지 반영한 실 지출 가시화 |
| 카테고리별 분석 차트의 색상 일관성 부재 | 카테고리 → 색상 토큰 매핑 + Recharts 색상 일관 적용 | 파이차트/라인차트 시각 통일 + 드릴다운 |
| Web과 Mobile 클라이언트 UI 일관성 | GradientButton 등 공통 컴포넌트 시스템 / 동일 DTO | 디자인 톤 일치 + 클라이언트별 최적화 유지 |
| JWT 만료 후 사용자 혼란 | Axios 인터셉터에 401 캐치 → 로그인 페이지 자동 리다이렉트 | UX 끊김 제거 |
| 구독 가격 변동 추적 | plan_price_history 테이블 + 변경 이력 라우터 | 과거 가격 vs 현재 가격 비교 가능 |
| 중복 구독 탐지 | 카테고리 단위 그룹핑 + 동일 카테고리 내 다중 활성 구독 검출 | "YouTube Music + Spotify 동시 구독" 같은 케이스 자동 알림 |
| 대시보드 정보 과밀 | Bento Grid 레이아웃 + Glassmorphism으로 시각 계층 분리 | 한 화면에서 다수 위젯의 인지 부담 감소 |

---

### 아키텍처

```
┌──────────────────────┬────────────────────────┐
│  Web (React 19)      │  Mobile (RN + Expo)    │
│  Vite · Zustand      │  Expo Router · Zustand │
│  Recharts · Tailwind │  expo-linear-gradient  │
└──────────┬───────────┴────────────┬───────────┘
           │  Axios + JWT 인터셉터  │
           │  401 자동 리다이렉트   │
           └────────────┬───────────┘
                        ▼
        ┌───────────────────────────────┐
        │  FastAPI (async)              │
        │  /api/v1 — Auth · Services    │
        │  Subscriptions · Analytics    │
        │  Categories · Notifications   │
        └───────────────┬───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │  PostgreSQL 16 · 8 테이블     │
        │  Alembic · Docker Compose     │
        └───────────────────────────────┘
                        ▲
                        │ 환율
        ┌───────────────────────────────┐
        │  Frankfurter API              │
        └───────────────────────────────┘
```

---

### 프로젝트에서 얻은 것

- **React 19 + Vite + TypeScript** 환경에서 상태관리(Zustand) · 라우팅 · 차트(Recharts)까지 풀스택 SPA 설계 경험
- **React Native(Expo)** 와 **React Web** 의 코드 공유/분리 기준에 대한 실전 감각 (DTO/i18n/디자인 토큰 공유, UI 라이브러리 분리)
- **FastAPI + Async SQLAlchemy 2.0** 비동기 ORM 패턴, Alembic 마이그레이션, Pydantic v2 검증 흐름
- 외부 API(환율) 연동, JWT 인터셉터, 알림 도메인 등 **실제 서비스 운영에 필요한 사이드 기능** 까지 직접 설계
- Bento Grid + Glassmorphism 등 **트렌드 디자인 시스템** 의 직접 구현 경험
