# WorkFlow Agent (듀듀) — 프로젝트 전체 개요

> SK Networks AI Camp 21기 | 파이널 프로젝트 | 3팀
> 기간: 2026.02 ~ 2026.03

---

## 1. 프로젝트 소개

**듀듀(DUDE)**는 LangGraph 기반 멀티 Agent 업무 자동화 시스템입니다.
사내 규정 판단, 문서 처리, 일정 관리를 자연어로 통합 처리하며, sLLM 파인튜닝을 통해 기업 보안 환경에서 운영 가능한 프라이빗 AI 어시스턴트입니다.

### 핵심 가치

| 가치 | 설명 |
|------|------|
| **보안** | 사내 데이터 외부 유출 차단을 위한 프라이빗 sLLM 운영 |
| **정밀** | RAG 기반 근거 중심 규정 교차 판단 |
| **통합** | Google Workspace 4종 (Calendar, Tasks, Gmail, Sheets) 연동 |

---

## 2. 팀 구성

| 이름 | 역할 | 담당 |
|------|------|------|
| 신지용 | **PM** | Intent 분류 + Planner + 오케스트레이터 |
| 윤경은 | AI Engineer | 판단 Agent + RAG 파이프라인 |
| 진승언 | AI Engineer | 문서 Agent + 파서 + 템플릿 |
| 안혜빈 | Backend | FastAPI + DB + 인증 + Google Services |
| 문지영 | Frontend | React UI 전체 |

**멘토**: 최민수

---

## 3. 시스템 아키텍처

```
사용자 입력
    ↓
Intent 분류 (KoELECTRA, F1 97.88%)
    ↓
LangGraph Orchestrator (StateGraph)
    ↓ (조건부 라우팅)
    ├── Judgment Agent  → RAG(규정) → sLLM → JSON 판단 결과
    ├── Document Agent  → 생성/요약/검색/QA → sLLM → 문서 처리
    ├── Schedule Agent  → Google Calendar/Tasks 연동
    └── General Agent   → 일반 대화
    ↓
SSE 스트리밍 응답 → React UI
```

---

## 4. 핵심 기능

| 기능 | 설명 | 예시 |
|------|------|------|
| **규정 판단** | 다중 규정 교차 판단 + 근거 + 대안 제시 | "인턴에게 AWS 접근 줘도 돼?" |
| **문서 생성** | 템플릿 기반 초안 생성 (회의록/보고서/제안서) | "이번 회의 회의록 작성해줘" |
| **문서 요약** | 회사 포맷으로 분류/태그/요약 자동 생성 | "이 계약서 요약해줘" |
| **문서 검색/QA** | RAG 하이브리드 검색 + 근거 기반 답변 | "출장비 관련 규정 찾아줘" |
| **일정 관리** | 자연어 → 일정 자동 등록/조회 | "내일 오후 2시 회의 잡아줘" |

---

## 5. 기술 스택

### AI / ML

| 구분 | 기술 | 상세 |
|------|------|------|
| Agent Framework | **LangGraph** | StateGraph 기반 멀티 Agent 오케스트레이션 |
| Base sLLM | **Kanana-1.5-8B-Instruct** | 벤치마크 3모델 비교 후 선정 |
| Fine-tuning | **LoRA (PEFT)** + 8-bit 양자화 | 판단/문서/Planner 3개 LoRA 어댑터 |
| Intent 분류 | **KoELECTRA-base-v3** | 8개 카테고리, Test F1 97.88% |
| 모델 서빙 | **vLLM** | OpenAI 호환 API + LoRA 핫스왑 |
| Vector DB | **Qdrant Cloud** | Cosine 유사도, 768차원 |
| Embedding | **jhgan/ko-sbert-nli** | 한국어 Sentence-BERT |
| Reranker | **BAAI/bge-reranker-v2-m3** | Cross-Encoder 재정렬 |
| 키워드 검색 | **BM25 + kiwipiepy** | 한국어 형태소 분석 기반 |
| 문서 파싱 | **Docling + PaddleOCR** | PDF 구조화 + 스캔 OCR |

### Backend

| 구분 | 기술 |
|------|------|
| Framework | FastAPI + SSE (StreamingResponse) |
| Database | PostgreSQL (12 테이블) |
| ORM | SQLAlchemy + Alembic |
| 인증 | JWT + Google OAuth 2.0 |
| 캐시 | Redis |
| 암호화 | AES-256 |

### Frontend

| 구분 | 기술 |
|------|------|
| Framework | React 18 (Vite) |
| 상태관리 | Zustand + TanStack Query |
| 스트리밍 | EventSource (SSE) |
| 스타일 | Tailwind CSS + Lucide Icons |
| 캘린더 | FullCalendar |

### Infra

| 구분 | 기술 |
|------|------|
| Cloud | AWS (EC2 + S3 + RDS) |
| GPU (학습) | RunPod (A100 40GB) |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 6. 파인튜닝 현황

### 6-1. Intent 분류 (KoELECTRA)

| 항목 | 수치 |
|------|------|
| 모델 | koelectra-base-v3 + Label Smoothing 0.1 |
| 학습 데이터 | 2,425건 (8 intent × GPT-4o + Claude 생성) |
| Test F1 | **97.88%** |
| Adversarial F1 | **87.58%** |
| 추론 속도 | 7.9ms (GPU) |
| 실험 | 7단계 체계적 실험 (Baseline → Grid Search → Label Smoothing → 시나리오 검증) |

### 6-2. 판단 Agent (LoRA v1)

| 항목 | 상세 |
|------|------|
| 베이스 모델 | Kanana-1.5-8B-Instruct |
| 데이터 소스 | 내부 Excel (1,000건) + 규정 DB |
| 증강 | GPT-4o-mini (7개 규정별 500건 추가) |
| 학습 데이터 | ~3,000건 (Chat SFT 포맷) |
| 출력 | JSON (result/confidence/reasoning/regulations) |

### 6-3. 문서 Agent (LoRA v2) — 3개 서브태스크

| 서브태스크 | 데이터 소스 | 증강 | 학습 건수 |
|-----------|-----------|------|----------|
| 생성 (generate) | AI Hub SN 582 (700건) | GPT-4o 합성 800건, 필드풀 3계층 | ~1,350건 |
| QA | AI Hub SN 569 MRC (300건) | GPT-4o QA 생성 300건 | ~900건 |
| 요약 (summary) | AI Hub SN 582 (300건) | 요약문 직접 활용 | ~900건 |

### 6-4. Planner (LoRA v3)

| 항목 | 상세 |
|------|------|
| 베이스 모델 | Kanana-1.5-8B-Instruct |
| 데이터 소스 | 템플릿 기반 자동 합성 (synthesize_planner.py) |
| 증강 | 7개 버전 반복 (v3→v7), 약점 보강 |
| 학습 데이터 | ~5,000건 (Chat SFT 포맷) |
| 출력 | JSON (plan: step_id/intent/query/depends_on) |

---

## 7. RAG 파이프라인

### 데이터 적재

```
규정 문서 (9개 TXT + 1개 PDF) + 업로드 문서 (77건)
    ↓
문서 파싱 (Docling / RegulationParser / DocxParser / OCR)
    ↓
청킹 (조항/문단 단위, max 400자, 불릿 서브분할)
    ↓
임베딩 (jhgan/ko-sbert-nli, 768차원)
    ↓
Qdrant Cloud 적재 (Cosine, 메타데이터: source/doc_type/scope)
```

### 검색 흐름

```
사용자 질문
    ↓
쿼리 정제 (형태소 분석 + 동의어 확장 + 구어→문어 변환)
    ↓
BM25 검색 (Top 15) + 벡터 검색 (Top 15)
    ↓
RRF 융합 (k=60) → 태그 부스팅 → 다양성 필터 → 점수 정규화
    ↓
Reranker (bge-reranker-v2-m3) → Top K 결과
```

### RAG 적용 범위

| Agent/기능 | RAG 사용 | 검색 대상 |
|-----------|---------|----------|
| Judgment | O | 사내 규정 (source="regulations") |
| doc_search / doc_qa | O | 업로드 문서 (source="documents") |
| doc_generate / doc_summary | X | 사용자 입력/대상 문서 직접 제공 |
| Schedule / General | X | — |

---

## 8. 데이터 현황

### 학습 데이터 (총 ~226MB)

| 모듈 | 크기 | 건수 | 포맷 |
|------|------|------|------|
| 판단 Agent (v1_judgment) | 110MB | ~3,000건 | Chat JSONL |
| 문서 Agent (v2_generate/qa/summary) | 40MB | ~3,500건 | Chat JSONL |
| Planner (v7_planner) | 3.8MB | ~5,000건 | Chat JSONL |
| 의도분류 (intent_multilabel) | 1.1MB | ~3,000건 | text/label JSONL |

### RAG 문서 데이터

| 데이터 | 건수 | 설명 |
|--------|------|------|
| 규정 문서 | 10개 (492KB) | 인사/급여/보안/윤리/출장/교육/복리후생/징계/개인정보 + 통합 PDF |
| 시드 문서 | 30건 | 회의록 10 + 보고서 10 + 제안서 10 (스크립트 자동 생성) |
| 추가 문서 | ~38건 | 다양한 소스 적재 |
| 사용자 업로드 | 가변 | UI에서 PDF/DOCX 업로드 |

### 평가 데이터

| 데이터 | 건수 | 설명 |
|--------|------|------|
| 벤치마크 테스트셋 | 87건 | judgment 정확도 평가 |
| 모델 비교 결과 | 3개 모델 | EXAONE-3.5 / Kanana-1.5 / Qwen3 |

---

## 9. 핵심 성과

| 영역 | 성과 |
|------|------|
| **Intent 분류** | KoELECTRA — Test F1 97.88%, Adversarial F1 87.58%, 추론 7.9ms |
| **파인튜닝** | 4개 모듈 LoRA 학습 (판단/문서/Planner/Intent), 7단계 체계적 실험 |
| **RAG** | BM25 + Vector + RRF 하이브리드 검색 + Cross-Encoder Reranker |
| **Google 연동** | Calendar + Tasks + Gmail + Sheets 4종 통합 OAuth |
| **Backend** | 12 테이블 DB + JWT 인증 + SSE 실시간 스트리밍 |
| **Frontend** | 11 페이지 + 챗봇 카드 UI + FullCalendar 일정 관리 |
| **Infra** | AWS EC2 배포 + GitHub Actions CI/CD + RunPod A100 학습 |

---

## 10. 프로젝트 구조

```
SKN21-FINAL-3TEAM/
├── ai/                          # AI/ML 모듈
│   ├── agents/                  # LangGraph Agent (judgment, document, schedule)
│   ├── llm/                     # LLM 공통 모듈 (factory, providers, prompts)
│   ├── rag/                     # RAG 파이프라인 (Qdrant, BM25, Reranker)
│   ├── templates/               # 문서 템플릿 (회의록, 보고서, 제안서)
│   ├── document_parser/         # 문서 파싱 (Docling, PaddleOCR, DOCX)
│   ├── skills/                  # 문서 생성 스킬
│   ├── finetuning/              # LoRA 학습 스크립트 + 데이터 전처리
│   └── serving/                 # vLLM 클라이언트
├── backend/                     # FastAPI 백엔드
│   ├── app/api/v1/              # REST API (12개 라우터)
│   ├── app/models/              # ORM 모델 (12 테이블)
│   ├── app/services/            # 비즈니스 로직 + Google Services
│   └── app/schemas/             # Pydantic 스키마
├── frontend/src/                # React 프론트엔드
│   ├── components/              # UI 컴포넌트 (chat, dashboard, documents 등)
│   ├── pages/                   # 11개 페이지
│   ├── store/                   # Zustand 상태관리
│   └── hooks/                   # Custom Hooks (useAuth, useSSE 등)
├── data/                        # 데이터
│   ├── training/                # 파인튜닝 학습 데이터 (226MB)
│   ├── regulations/             # 규정 문서 (RAG 원본)
│   └── evaluation/              # 평가 데이터 + 벤치마크 결과
└── scripts/                     # 유틸리티 스크립트
    ├── judgment/                # 판단 데이터 전처리
    ├── ingest/                  # RAG 문서 적재
    └── seed/                    # 시드 데이터 생성
```

---

## 11. 개발 전략

```
1단계  설계 · 환경 세팅                           ✅ 완료
2단계  LLM API(GPT/Claude)로 전체 기능 구현        ✅ 완료
3단계  Agent 개발 — LLM API 기반 동작 확인          ✅ 완료
4단계  파인튜닝 (Intent + 판단/문서/Planner)        ✅ 완료
5단계  sLLM(vLLM) 교체 + 통합 테스트               ✅ 완료
6단계  배포 및 마무리                              ✅ 완료
```

> **전략**: LLM API로 기능을 먼저 완성 → input/output 형태 확정 → 데이터 수집 → sLLM 교체
> Agent 코드는 LLM 호출 인터페이스만 바꾸면 되는 구조 (공통 모듈)
