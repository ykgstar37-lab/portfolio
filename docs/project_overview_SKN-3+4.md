# PyMate - Bootcamp AI RAG Tutor 프로젝트 종합 개요

## 프로젝트 소개

**PyMate**는 부트캠프 수강생을 위한 **RAG(Retrieval-Augmented Generation) 기반 AI 학습 튜터**입니다.
부트캠프 강의 자료와 Python 공식 문서를 지식 소스로 활용하여, 수강생의 학습 질문에 신뢰성 높은 답변을 제공합니다.

- **팀명:** 4Team (SKN21)
- **팀원:** 김가람, 최자슈아주원, 윤경은, 안혜빈, 정세연, 신지용 (6명)
- **기간:** 3차 프로젝트 → 4차 프로젝트 (연속 진행)

---

## 프로젝트 진행 흐름 (3차 → 4차)

### 3차 프로젝트 — RAG 파이프라인 구축 및 MVP

> **핵심 목표:** LLM 기반 RAG 시스템 설계 및 Flask 웹앱 프로토타입

| 항목 | 내용 |
|------|------|
| **프레임워크** | Flask |
| **RAG 엔진** | LangChain + LangGraph |
| **벡터 DB** | Qdrant (Docker) |
| **LLM** | OpenAI GPT-4o-mini |
| **임베딩** | text-embedding-3-large (3072차원) |
| **주요 기능** | 학습 Q&A 챗봇, 퀴즈 기초 기능 |

**3차 프로젝트 핵심 성과:**
- Jupyter Notebook(.ipynb) 강의 자료 파싱 및 벡터 DB 적재 파이프라인 구축
- Python 공식 문서(RST) 임베딩 및 검색 시스템 구현
- 한국어-영어 이중 쿼리(Dual Query) 하이브리드 검색 설계
- 관련도 기반 라우팅 (점수 > 0.5: 직접 답변, 0.3~0.5: 웹 검색 보충, < 0.3: 데이터 없음)
- LangGraph 워크플로우 (search → context → relevance check → analyst/web_search/no_data)
- Flask 기반 UI (다크/라이트 모드, 마크다운 렌더링, 코드 하이라이팅)

---

### 4차 프로젝트 — 프로덕션 확장 및 배포

> **핵심 목표:** Django 마이그레이션, 기능 확장, AWS 배포

| 항목 | 내용 |
|------|------|
| **프레임워크** | Django 6.0 + DRF |
| **데이터베이스** | PostgreSQL (AWS RDS) |
| **배포** | AWS EC2 + Docker + Nginx + Gunicorn |
| **신규 기능** | 코드 리뷰, 스튜디오, 북마크, 사용자 인증 |

**4차 프로젝트 핵심 성과:**
- Flask → Django 전환 (사용자 인증, ORM, 관리자 기능 등 확장성 확보)
- SSE(Server-Sent Events) 기반 실시간 스트리밍 응답
- 퀴즈 시스템 고도화 (객관식/O·X/단답형, 북마크)
- 코드 리뷰 기능 (에러 분석, 디버깅, 코드 제안)
- 스튜디오 기능 (개념 요약, 단계별 설명, 플래시카드, 비교표)
- BAAI bge-reranker-v2-m3 리랭킹 도입
- Docker Compose 기반 컨테이너화 (Qdrant + Django + Nginx)
- AWS EC2 (t3.medium) 프로덕션 배포

---

## 시스템 아키텍처

```
사용자 브라우저
    ↓ HTTP/HTTPS
Nginx (리버스 프록시, 80/443)
    ↓
Django Backend (8000)
    ├── Chat API (SSE 스트리밍)
    ├── Quiz API
    ├── Code Review API
    └── 사용자 인증
    ↓
RAG 시스템 (LangGraph)
    ├── Search Agent (이중 쿼리: KO + EN)
    ├── Reranking (bge-reranker-v2-m3)
    └── Analyst Agent (GPT-4o-mini)
    ↓
Qdrant 벡터 DB (6333)
    ├── learning_ai (강의 + Python 문서)
    └── quizzes (퀴즈 메타데이터)
```

## 기술 스택 요약

| 분류 | 기술 |
|------|------|
| **Backend** | Python 3.12, Django 6.0, DRF, Flask(3차) |
| **AI/LLM** | LangChain, LangGraph, OpenAI GPT-4o-mini |
| **벡터 DB** | Qdrant, text-embedding-3-large |
| **검색** | 하이브리드 검색, BM25, BAAI Reranker |
| **DB** | PostgreSQL (RDS) |
| **배포** | AWS EC2, Docker, Nginx, Gunicorn |
| **평가** | RAGAS |
| **Frontend** | HTML/CSS/JS, SSE, marked.js, highlight.js |

---

## 데이터 파이프라인

```
Raw Data (.ipynb, RST)
  → 전처리 (이미지/URL/HTML/LaTeX 제거)
  → 헤더 기반 컨텍스트 주입
  → 청킹 (마크다운 1200자 / 코드 1000자)
  → 임베딩 (text-embedding-3-large, 3072차원)
  → Qdrant 저장 (메타데이터: source, filename, week, topic)
```

## 검색 전략

1. **이중 쿼리 검색**: 한국어 원본 + 영어 번역으로 동시 검색
2. **하이브리드 검색**: 벡터 유사도 + 키워드 매칭 + BM25
3. **리랭킹**: BAAI bge-reranker-v2-m3 교차 인코더
4. **관련도 라우팅**: 점수 기반 3단계 분기 (직접 답변 / 웹 검색 보충 / 데이터 없음)

---

## 주요 기능 (최종)

| 기능 | 설명 |
|------|------|
| **학습 챗봇** | RAG 기반 실시간 스트리밍 Q&A |
| **퀴즈** | 객관식/O·X/단답형, AI 생성, 북마크 |
| **코드 리뷰** | 에러 분석, 디버깅 지원, 출력 예측 |
| **스튜디오** | 개념 요약, 플래시카드, 비교표, 대안 예제 |
| **북마크** | 중요 Q&A 및 퀴즈 저장 |
| **사용자 인증** | 회원가입, 로그인, 개인 학습 이력 관리 |

---

## 프로젝트 구조 (4차 최종)

```
SKN21-4th-4Team/
├── django_app/
│   ├── config/          # Django 설정 (settings, urls, wsgi)
│   ├── backend/
│   │   ├── accounts/    # 사용자 인증
│   │   ├── chat/        # 채팅 API (SSE)
│   │   ├── quiz/        # 퀴즈 API
│   │   └── code/        # 코드 리뷰 API
│   └── frontend/
│       ├── templates/   # HTML 템플릿
│       └── static/      # CSS, JS, 이미지
├── src/                 # RAG 코어 로직
│   ├── agent/           # LangGraph 워크플로우
│   ├── ingestion/       # 데이터 파이프라인
│   ├── retrievals/      # 검색 & 리랭킹
│   ├── schema/          # 상태 정의
│   └── utils/           # 설정, 유틸리티
├── deploy/              # 배포 (Dockerfile, docker-compose, nginx)
├── notebooks/           # 전처리 노트북
└── docs/                # 문서
```

---

## 팀원 역할

| 이름 | 역할 | 담당 |
|------|------|------|
| 김가람 | AI Core | RAG 파이프라인, 데이터 전처리, Qdrant, 프롬프트 엔지니어링 |
| 최자슈아주원 | Backend Lead | Django 아키텍처, Chat API (SSE), UI 통합 |
| 신지용 | DevOps | AWS EC2, Docker, Nginx, CI/CD |
| 윤경은 | Backend & Frontend | Quiz API, 미들웨어, CSS/JS |
| 안혜빈 | AI Core | RAG 파이프라인, 전처리, Qdrant, 프롬프트 |
| 정세연 | UI Design | 디자인 시스템, UX/UI |
