# SubFlow — 구독 관리 플랫폼 전체 개요

> 개인/팀 사이드 프로젝트
> 기간: 2026.03 ~ 2026.04 (진행중)

---

## 1. 프로젝트 소개

**SubFlow**는 흩어진 구독 서비스(Netflix, Spotify, YouTube Premium, ChatGPT Plus 등)를 한 곳에서 관리하고, 월별 지출을 분석하며, 결제일 알림과 절약 제안까지 받아볼 수 있는 **구독 관리 풀스택 플랫폼**입니다.

웹(React 19)과 모바일(React Native + Expo)을 모두 지원하며, 동일한 FastAPI 백엔드를 공유하는 멀티 클라이언트 구조입니다.

### 핵심 가치

| 가치 | 설명 |
|------|------|
| **가시성** | 흩어진 구독을 한 화면에 모아 월/연간 지출을 즉시 확인 |
| **인사이트** | 카테고리별/월별 지출 추이, 중복 구독 감지, 절약 제안 |
| **자동화** | 결제일 N일 전 알림, 환율 변동 알림, 무료체험 만료 D-day |

---

## 2. 시스템 아키텍처

```
┌──────────────────────────┬───────────────────────────┐
│  Web Frontend            │  Mobile App                │
│  React 19 + Vite         │  Expo + React Native       │
│  Zustand + Recharts      │  Expo Router + Zustand     │
│  Tailwind CSS            │  expo-linear-gradient      │
└──────────────┬───────────┴───────────────┬────────────┘
               │  REST API (Axios)         │
               │  JWT Bearer 인터셉터      │
               └──────────────┬────────────┘
                              ▼
              ┌───────────────────────────────┐
              │  FastAPI Backend              │
              │  Async SQLAlchemy 2.0         │
              │  Pydantic + JWT + bcrypt      │
              │  /api/v1 라우터 6종           │
              └───────────────┬───────────────┘
                              ▼
              ┌───────────────────────────────┐
              │  PostgreSQL 16 (Docker)       │
              │  Alembic 마이그레이션         │
              │  8 테이블                     │
              └───────────────────────────────┘
                              ▲
              ┌───────────────────────────────┐
              │  Frankfurter API (환율)       │
              └───────────────────────────────┘
```

---

## 3. 핵심 기능

| 기능 | 설명 |
|------|------|
| **구독 관리** | 30+ 카탈로그에서 추가 / 커스텀 구독 직접 입력 / 활성·일시정지·해지 상태 관리 |
| **대시보드** | Bento Grid + Glassmorphism UI, 월/연간 총 지출, 활성 구독 수, 다음 결제일 |
| **지출 분석** | 카테고리별 파이차트, 월별 추이 라인차트, 카테고리 색상 + 드릴다운 |
| **캘린더 / 타임라인** | 결제일 캘린더 뷰 ↔ 구독 변경 이력 타임라인 탭 전환 |
| **예산 관리** | 월 예산 설정 + 초과 시 경고 |
| **환율 추적** | 외화 구독 KRW 자동 변환 + 환율 변동 임계치 알림 |
| **중복 감지** | 같은 카테고리 내 겹치는 서비스(YouTube Music + Spotify 등) 탐지 |
| **절약 제안** | "광고형 요금제로 변경 시 월 N원 절약" 형태 추천 |
| **무료체험 추적** | trial 상태 구독 만료일 D-day 카운트다운 |
| **알림 설정** | 결제 N일 전 알림, 푸시/이메일 토글 |
| **다국어** | 한국어/영어 i18n (모바일) |

---

## 4. 기술 스택

### Web Frontend

| 구분 | 기술 |
|------|------|
| Framework | **React 19** + TypeScript 5.9 |
| Build | **Vite 8** |
| 상태관리 | **Zustand 5** (auth, subscriptions 등) |
| 라우팅 | React Router DOM 7 |
| HTTP | Axios 1.13 + JWT 인터셉터 + 401 자동 리다이렉트 |
| 차트 | **Recharts 3** (파이/라인 차트) |
| 스타일 | **Tailwind CSS 4** + Glassmorphism + Bento Grid |
| 아이콘 | Lucide React |
| 알림 UI | react-hot-toast |
| 날짜 | date-fns |

### Mobile App

| 구분 | 기술 |
|------|------|
| Framework | **Expo SDK 54** + React Native 0.81 |
| 라우팅 | **Expo Router** (파일 기반) |
| 상태관리 | Zustand + AsyncStorage 영속화 |
| HTTP | Axios + JWT 인터셉터 |
| UI | expo-linear-gradient (GradientButton 시스템) |
| SVG | react-native-svg + svg-transformer |
| i18n | 자체 구현 (한/영) |

### Backend

| 구분 | 기술 |
|------|------|
| Framework | **FastAPI** (async) |
| ORM | SQLAlchemy 2.0 (async) |
| Migration | Alembic |
| DB | PostgreSQL 16 |
| 인증 | JWT + bcrypt (passlib) |
| 검증 | Pydantic v2 |
| External API | Frankfurter (환율) |
| Test | pytest (백엔드 테스트 30+) |

### Infra

| 구분 | 기술 |
|------|------|
| Container | Docker Compose (PostgreSQL) |
| Dev Tool | Vite, Expo CLI, uvicorn |

---

## 5. 데이터베이스 스키마

PostgreSQL 8 테이블 구조:

| 테이블 | 설명 |
|--------|------|
| **users** | 사용자 계정 (UUID, email, password) |
| **categories** | 카테고리 (영상/음악/클라우드/AI/생산성 등) |
| **services** | 서비스 카탈로그 (Netflix, Spotify, ChatGPT 등 30+) |
| **service_plans** | 서비스별 요금제 (Basic/Standard/Premium) |
| **plan_price_history** | 요금제 가격 변경 이력 |
| **subscriptions** | 사용자 활성 구독 (active/paused/cancelled/trial) |
| **payment_history** | 결제 이력 |
| **subscription_history** | 구독 변경 이력 (생성/플랜변경/해지) |
| **notification_settings** | 알림 설정 (N일 전, 월 예산) |

---

## 6. API 엔드포인트

모든 API는 `/api/v1` 프리픽스 사용:

| 라우터 | 주요 엔드포인트 | 설명 |
|--------|----------------|------|
| **Auth** | `POST /auth/register`, `POST /auth/login` | JWT 발급 |
| **Services** | `GET /services`, `GET /services/popular` | 카탈로그 조회 |
| **Subscriptions** | `GET /subscriptions`, `POST /subscriptions/from-catalog` | 구독 CRUD |
| **Categories** | `GET /categories` | 카테고리 목록 |
| **Analytics** | `GET /analytics/overview`, `GET /analytics/spending-trend` | 지출 분석 |
| **Notifications** | `GET /notifications/settings` | 알림 설정 |

---

## 7. 프로젝트 구조

```
SubFlow/
├── frontend/                     # React 19 웹
│   ├── src/
│   │   ├── api/                  # API 모듈 (auth, subscriptions, analytics 등)
│   │   ├── store/                # Zustand 스토어
│   │   ├── pages/                # 9개 페이지 (Dashboard, Subscriptions, Analytics 등)
│   │   ├── components/
│   │   │   ├── analytics/        # CategoryPieChart, MonthlySpendingChart 등
│   │   │   ├── dashboard/        # BudgetStatus, ExchangeRateAlert, TrialTracker 등
│   │   │   ├── calendar/
│   │   │   ├── subscription/
│   │   │   ├── service/
│   │   │   ├── auth/
│   │   │   ├── common/           # GradientButton 등
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── types/
│   └── package.json
├── mobile/                       # Expo + React Native
│   ├── app/
│   │   ├── (auth)/               # 로그인/회원가입
│   │   ├── (tabs)/               # 홈, 구독, 카탈로그, 분석, 캘린더, 설정
│   │   └── _layout.tsx
│   ├── src/
│   │   ├── components/
│   │   ├── i18n/                 # 다국어 (한/영)
│   │   ├── services/             # API 클라이언트
│   │   ├── store/
│   │   └── types/
│   └── package.json
├── backend/                      # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── core/                 # security.py(JWT), deps.py
│   │   ├── models/               # 8 ORM 모델
│   │   ├── schemas/              # Pydantic 스키마
│   │   ├── services/             # 비즈니스 로직
│   │   ├── routers/              # 6개 라우터
│   │   └── utils/
│   │       ├── seed_data.py      # 30+ 서비스 시드
│   │       └── exchange_rate.py  # 환율 API
│   ├── alembic/
│   └── requirements.txt
└── docker-compose.yml
```

---

## 8. 주요 화면 구성

### Web (9개 페이지)

| 페이지 | 핵심 컴포넌트 |
|--------|--------------|
| Dashboard | Bento Grid 레이아웃, 요약 카드, BudgetStatus, ExchangeRateAlert, OverlapWarning, SavingsSuggestions, TrialTracker |
| Subscriptions | 활성/일시정지/해지 탭, 상태 변경 |
| Services | 카탈로그 그리드, 카테고리 필터 |
| Analytics | CategoryPieChart, MonthlySpendingChart, SpendingTrendChart, SummaryCards |
| Calendar | 월간 결제일 뷰 |
| Timeline | 구독 변경 이력 타임라인 |
| Settings | 알림/예산/환율 알림 |
| Login / Register | JWT 인증 |

### Mobile (탭 기반)

| 탭 | 설명 |
|----|------|
| 홈 | 구독 카드 페이저, 지출 비중, 환율 변동 알림 |
| 구독 관리 | 활성/일시정지/해지 |
| 서비스 카탈로그 | 카탈로그/커스텀 추가 |
| 지출 분석 | 카테고리/월별 차트, 절약 인사이트, 예산 |
| 캘린더/타임라인 | 결제일 ↔ 변경 이력 탭 |
| 설정 | 알림/언어/환율 |

---

## 9. 디자인 시스템

| 요소 | 적용 |
|------|------|
| **레이아웃** | Bento Grid (대시보드 카드 모듈) |
| **컬러** | 카테고리별 일관된 색상 토큰 (영상/음악/AI 등) |
| **버튼** | GradientButton 공통 시스템 (web/mobile 통일) |
| **유리감** | Glassmorphism (반투명 + 블러) |
| **차트** | Recharts(웹) / SVG 직접 그리기(모바일) — 카테고리 색상 일관 |

---

## 10. 핵심 성과

| 영역 | 성과 |
|------|------|
| **풀스택** | Web + Mobile + Backend 단독 구축 (React 19 / RN / FastAPI) |
| **멀티 클라이언트** | 동일 백엔드를 웹/모바일 클라이언트가 공유 (DTO 통일) |
| **DB 설계** | 8 테이블 정규화 + Alembic 마이그레이션 + 가격 이력 추적 |
| **UI/UX** | Bento Grid + Glassmorphism + 카테고리 색상/드릴다운 적용 |
| **인증 흐름** | JWT 인터셉터 + 401 자동 리다이렉트 + AsyncStorage 영속화 |
| **데이터 시각화** | Recharts 기반 파이/라인 차트, 카테고리별 색상 일치 |
| **외부 연동** | Frankfurter 환율 API, 외화 구독 KRW 자동 변환 |
| **테스트** | 백엔드 pytest 30+, 에러/반응형/빈 상태 처리 |

---

## 11. 개발 진행 흐름

```
2026.03.26  Initial commit — FastAPI + React 골격
2026.03.27  카탈로그/서브스크립션/분석 라우터 구현
2026.03.31  대시보드 다가오는 결제 + 서비스 로고
2026.04.01  Phase 6: 에러 처리 + 반응형 + 빈 상태
2026.04.02  UI 전면 리뉴얼 — Bento Grid + Glassmorphism
2026.04.03  모바일(React Native + Expo) 앱 구축 시작
2026.04.08  데이터 매핑 정리 + GradientButton 시스템
2026.04.11  설정 화면 개편 + 통화/알림 통합
2026.04.29  분석 시각화 개선 + 카테고리 색상/드릴다운
            + 401 자동 리다이렉트
```
