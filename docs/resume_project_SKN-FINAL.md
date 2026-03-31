# WorkFlow Agent (듀듀) — 포트폴리오/이력서용 프로젝트 요약

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | WorkFlow Agent (듀듀) |
| **기간** | 2026.02 ~ 2026.03 (약 7주) |
| **소속** | SK Networks AI Camp 21기 파이널 프로젝트 |
| **팀 규모** | 5명 (PM 1 + AI 2 + Backend 1 + Frontend 1) |
| **역할** | (본인 역할 기입) |
| **GitHub** | (레포지토리 URL) |

---

## 한 줄 소개

> LangGraph 기반 멀티 Agent 시스템으로, 사내 규정 판단 · 문서 처리 · 일정 관리를 자연어로 통합 자동화하는 프라이빗 AI 어시스턴트

---

## 프로젝트 배경 및 문제 정의

- 기업 내 규정이 방대해져 정확한 검색 · 판단 · 예외 대응이 어려움
- 회의록 작성, 문서 초안, 복수 앱을 오가는 일정 관리 등 비핵심 행정 업무에 과도한 리소스 소모
- 사내 데이터 보안 이슈로 외부 LLM API 직접 사용이 제한되는 환경

| 지표 | 수치 | 출처 |
|------|------|------|
| 핵심 업무 집중 시간 부족 | 68% | Microsoft Work Trend Index (2023) |
| 과도한 정보 탐색 소요 | 62% | 〃 |
| 커뮤니케이션 소모 비중 | 57% | 〃 |

---

## 솔루션

```
사용자 자연어 입력
    → Intent 분류 (KoELECTRA, F1 97.88%)
    → LangGraph Orchestrator (조건부 라우팅)
    → 전문 Agent 처리 (규정/문서/일정)
    → SSE 스트리밍 응답
```

| Agent | 기능 | 상세 |
|-------|------|------|
| **Judgment** | 규정 판단 | RAG 기반 다중 규정 교차 판단 + 근거 + 대안 제시 |
| **Document** | 문서 처리 | 생성(회의록/보고서/제안서) / 요약 / 검색 / QA |
| **Schedule** | 일정 관리 | 자연어 → 일정 등록·조회 + Google Workspace 4종 연동 |
| **Planner** | 복합 요청 분해 | 멀티스텝 요청을 단계별 계획으로 분해 + 병렬 처리 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **AI/ML** | LangGraph, Kanana-1.5-8B (LoRA), KoELECTRA, vLLM |
| **RAG** | Qdrant Cloud, BM25 + kiwipiepy, RRF, bge-reranker-v2-m3 |
| **Embedding** | jhgan/ko-sbert-nli (768차원) |
| **Backend** | FastAPI, PostgreSQL, SQLAlchemy, JWT, SSE, Redis |
| **Frontend** | React 18 (Vite), Zustand, TanStack Query, Tailwind, FullCalendar |
| **Infra** | AWS (EC2+S3+RDS), Docker, GitHub Actions CI/CD, RunPod A100 |
| **문서 파싱** | Docling, PaddleOCR, python-docx |

---

## 핵심 성과

| 영역 | 성과 |
|------|------|
| **Intent 분류** | KoELECTRA 파인튜닝 — Test F1 **97.88%**, Adversarial F1 **87.58%**, 추론 **7.9ms** |
| **파인튜닝** | 4개 모듈 LoRA 학습 완료 (판단/문서/Planner/Intent) |
| **체계적 실험** | 7단계 실험 (32-point Grid Search → Label Smoothing → 시나리오 검증) |
| **RAG** | BM25 + Vector + RRF 하이브리드 검색 + Cross-Encoder Reranker 구현 |
| **Google 연동** | Calendar + Tasks + Gmail + Sheets 4종 통합 OAuth |
| **시스템** | 12 테이블 DB + JWT 인증 + SSE 스트리밍 + 11 페이지 UI |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite + Zustand + TanStack Query)      │
│  11 Pages | SSE Streaming | FullCalendar | Card UI          │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API + SSE
┌──────────────────────▼──────────────────────────────────────┐
│  Backend (FastAPI)                                           │
│  JWT Auth | 12 API Routers | PostgreSQL 12 Tables | Redis   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  AI Engine                                                   │
│                                                              │
│  ┌─────────────┐    ┌──────────────────────────────────┐    │
│  │ Intent 분류  │───▶│ LangGraph Orchestrator            │    │
│  │ KoELECTRA   │    │ (StateGraph + 조건부 라우팅)       │    │
│  └─────────────┘    └──┬─────┬─────┬──────┬────────────┘    │
│                        │     │     │      │                  │
│                   Judgment Document Schedule General         │
│                   Agent    Agent   Agent    Agent             │
│                     │       │                                │
│              ┌──────▼───────▼──────────┐                     │
│              │ RAG Pipeline             │                     │
│              │ BM25 + Qdrant + RRF     │                     │
│              │ + Reranker              │                     │
│              └──────────┬──────────────┘                     │
│                         │                                    │
│              ┌──────────▼──────────────┐                     │
│              │ LLM Module               │                     │
│              │ GPT/Claude API ↔ vLLM   │                     │
│              │ + LoRA 핫스왑            │                     │
│              └─────────────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  External Services                                           │
│  Google Calendar | Tasks | Gmail | Sheets | RunPod A100     │
└──────────────────────────────────────────────────────────────┘
```

---

## 파인튜닝 상세

### 모델 선정

| 모델 | 종합 점수 | 비고 |
|------|----------|------|
| **Kanana-1.5-8B** | **0.652** | 최종 선정 |
| EXAONE-3.5-7.8B | 0.631 | — |
| Qwen3-8B | 0.618 | — |

### 학습 데이터

| 모듈 | 데이터 소스 | 증강 방법 | 학습 건수 | 포맷 |
|------|-----------|----------|----------|------|
| **판단 Agent** | 내부 Excel + 규정 DB | GPT-4o-mini | ~3,000건 | Chat SFT (JSON 판단) |
| **문서-생성** | AI Hub SN 582 (700건) | GPT-4o 합성 800건 | ~1,350건 | Chat SFT (JSON 문서) |
| **문서-QA** | AI Hub SN 569 MRC (300건) | GPT-4o QA 300건 | ~900건 | Chat SFT (JSON 답변) |
| **문서-요약** | AI Hub SN 582 (300건) | 요약문 직접 활용 | ~900건 | Chat SFT (분류/태그/요약) |
| **Planner** | 템플릿 자동 합성 | 7버전 약점 보강 | ~5,000건 | Chat SFT (JSON 계획) |
| **Intent** | Claude API 생성 | 경계쌍 600 + 적대적 463 | ~2,425건 | text/label |

### 학습 설정

| 항목 | 값 |
|------|-----|
| LoRA Rank | 16 |
| LoRA Alpha | 32 |
| 양자화 | 8-bit (BitsAndBytes) |
| Epoch | 3 |
| Batch Size | 4 |
| Learning Rate | 2e-4 |
| 학습 환경 | RunPod A100 40GB |
| Trainer | HuggingFace TRL SFTTrainer |

---

## RAG 파이프라인

| 구성요소 | 기술 | 상세 |
|---------|------|------|
| 벡터 DB | Qdrant Cloud | GCP, Cosine 유사도, 768차원 |
| 임베딩 | jhgan/ko-sbert-nli | 한국어 Sentence-BERT |
| 키워드 검색 | BM25 + kiwipiepy | 한국어 형태소 분석 |
| 융합 | RRF (k=60) | Reciprocal Rank Fusion |
| 리랭커 | bge-reranker-v2-m3 | Cross-Encoder |
| 청킹 | 조항/문단 단위 | max 400자, 불릿 서브분할 |
| 쿼리 정제 | 동의어 확장 + 구어→문어 | 39개 변환 패턴 |

### 검색 대상 데이터

| 데이터 | 건수 | 용도 |
|--------|------|------|
| 사내 규정 | 10개 문서 (492KB) | 판단 Agent 검색 |
| 업로드 문서 | 77건 (7종 카테고리) | 문서 검색/QA |

---

## 담당 역할별 상세 (본인 해당 부분 선택)

### PM + Intent + 오케스트레이션 (신지용)

- LangGraph StateGraph 기반 멀티 Agent 오케스트레이터 설계 및 구현
- KoELECTRA Intent 분류 모델 7단계 체계적 실험 (F1 97.88%)
- Planner Agent LoRA 파인튜닝 (v3→v7, 5,000건 데이터)
- 프로젝트 일정 관리 및 팀 조율

### AI Engineer — 판단 Agent + RAG (윤경은)

- Judgment Agent 설계 및 구현 (다중 규정 교차 판단 + 3중 보조장치)
- RAG 파이프라인 구축 (Qdrant + BM25 + RRF + Reranker)
- 판단 Agent LoRA 파인튜닝 (3,000건, GPT-4o-mini 증강)
- 쿼리 정제 모듈 (동의어 확장, 구어→문어 변환)

### AI Engineer — 문서 Agent (진승언)

- Document Agent 4개 기능 구현 (생성/요약/검색/QA)
- AI Hub 데이터 파이프라인 구축 (SN 582, 569)
- 문서 Agent LoRA 파인튜닝 (3개 서브태스크, 3,500건)
- 문서 파서 통합 (Docling + PaddleOCR + DOCX)
- 문서 템플릿 시스템 (회의록/보고서/제안서)

### Backend (안혜빈)

- FastAPI 백엔드 설계 및 구현 (12개 API 라우터)
- PostgreSQL 12 테이블 DB 설계 + Alembic 마이그레이션
- JWT 인증 + Google OAuth 2.0 소셜 로그인
- Google Workspace 4종 연동 (Calendar/Tasks/Gmail/Sheets)
- SSE 실시간 스트리밍 + Redis 캐시
- AWS EC2 배포 + GitHub Actions CI/CD

### Frontend (문지영)

- React 18 프론트엔드 전체 구현 (11 페이지)
- AI 챗봇 UI + Agent별 카드 컴포넌트 (JudgmentCard, DocumentCard 등)
- SSE 기반 실시간 스트리밍 응답 처리
- FullCalendar 일정 관리 UI
- Zustand + TanStack Query 상태관리
- 대시보드 + 관리자 페이지

---

## 기술적 도전 및 해결

| 도전 | 해결 |
|------|------|
| sLLM JSON 파싱 실패 | 시스템 프롬프트 최적화 + 출력 포맷 단순화 + 파싱 fallback 로직 |
| Intent 과신뢰 오분류 | Label Smoothing 0.1 적용 → 과신뢰 오분류 69% 감소 |
| RAG 검색 정밀도 | 하이브리드 검색 (BM25+Vector) + RRF 융합 + Cross-Encoder Reranker |
| 규정 교차 판단 정확도 | 다중 규정 cross_references 분석 + confidence 보정 로직 |
| 문서 파싱 다양성 | Docling(구조화 PDF) + PaddleOCR(스캔) + python-docx 통합 라우터 |
| LLM → sLLM 전환 | 공통 LLM 모듈 설계로 provider만 교체 (GPT/Claude/vLLM) |

---

## 개발 전략

```
LLM API 먼저 → sLLM은 나중에

1. LLM API(GPT/Claude)로 전체 기능 먼저 구현
2. 실제 동작 확인하면서 input/output 형태 확정
3. 확정된 형태에 맞춰 데이터 수집 + 파인튜닝
4. vLLM + LoRA로 sLLM 교체 (모듈만 교체)
```

> Agent 코드는 LLM 호출 인터페이스만 바꾸면 되는 구조로 설계하여,
> 파인튜닝 완료 후 코드 변경 없이 sLLM으로 전환 가능
