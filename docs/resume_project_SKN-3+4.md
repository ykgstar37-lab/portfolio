# 이력서용 프로젝트 정리 — SKN21 최종 (3차 + 4차 통합)

## PyMate — Bootcamp AI RAG Tutor

### 프로젝트 개요
| 항목 | 내용 |
|------|------|
| **프로젝트명** | PyMate — Bootcamp AI RAG Tutor |
| **기간** | 3차 → 4차 프로젝트 연속 진행 |
| **팀 규모** | 6명 |
| **역할** | Backend & Frontend (Quiz API, 에러 미들웨어, UI 개발) |
| **한줄 소개** | 부트캠프 강의 자료 기반 RAG AI 학습 튜터 — MVP 설계부터 프로덕션 배포까지 |

---

### 프로젝트 설명

부트캠프 수강생을 위한 **RAG(Retrieval-Augmented Generation) 기반 AI 학습 튜터**를 설계·개발·배포했습니다.

**3차 프로젝트**에서 RAG 파이프라인 설계, 벡터 DB 구축, Flask MVP를 완성하고,
**4차 프로젝트**에서 Django 마이그레이션, 기능 확장(퀴즈·코드리뷰·스튜디오), AWS 프로덕션 배포까지 수행했습니다.

**해결한 문제:**
- 강의 외 시간에 수강생이 학습 질문에 즉각적인 답변을 받기 어려운 문제
- 일반 LLM의 할루시네이션 없이, 실제 강의 자료에 기반한 신뢰성 높은 답변 제공
- 다양한 학습 방식 지원 (Q&A, 퀴즈, 코드 리뷰, 개념 요약)

---

### 기술 스택

```
Backend:    Python 3.12 · Django 6.0 · DRF · Flask(3차)
AI/LLM:     LangChain · LangGraph · OpenAI GPT-4o-mini
Vector DB:  Qdrant · text-embedding-3-large (3072D)
Search:     이중 쿼리(KO+EN) · 하이브리드 검색 · BM25 · BAAI Reranker
DB:         PostgreSQL (AWS RDS)
Deploy:     AWS EC2 · Docker Compose · Nginx · Gunicorn
Eval:       RAGAS
Frontend:   HTML/CSS/JS · SSE 스트리밍
```

---

### 프로젝트 진행 과정

#### Phase 1: RAG 파이프라인 구축 및 MVP (3차)

- LangChain + LangGraph 기반 RAG 워크플로우 설계
- Jupyter Notebook(.ipynb) 강의 자료 파싱 → 청킹 → 임베딩 파이프라인 구축
- Python 공식 문서(RST) 벡터화 및 검색 시스템 구현
- Qdrant 벡터 DB에 데이터 적재 및 하이브리드 검색 구현
- 한국어-영어 이중 쿼리(Dual Query) 검색으로 크로스링구얼 정확도 향상
- 관련도 기반 3단계 라우팅으로 할루시네이션 방지
- Flask 웹 UI 프로토타입 개발

#### Phase 2: 프로덕션 확장 및 배포 (4차)

- Flask → Django 6.0 마이그레이션 (사용자 인증, ORM 활용)
- SSE(Server-Sent Events) 기반 실시간 스트리밍 응답
- 퀴즈 시스템 (객관식/O·X/단답형, AI 생성, 북마크)
- 코드 리뷰 기능 (에러 분석, 디버깅, 코드 제안)
- 스튜디오 학습 도구 (개념 요약, 플래시카드, 비교표)
- BAAI bge-reranker-v2-m3 리랭킹으로 검색 품질 강화
- Docker Compose 컨테이너화 + AWS EC2 프로덕션 배포
- PostgreSQL(RDS) 데이터 모델링

---

### 주요 기능

| 기능 | 설명 |
|------|------|
| **학습 챗봇** | RAG 기반 실시간 스트리밍 Q&A (강의 자료 + Python 문서) |
| **퀴즈** | AI 생성 퀴즈 (객관식/O·X/단답형), 즉시 피드백, 북마크 |
| **코드 리뷰** | 에러 분석, 디버깅 지원, 코드 제안 |
| **스튜디오** | 개념 요약, 플래시카드, 비교표, 대안 예제 |
| **사용자 관리** | 회원가입/로그인, 학습 히스토리, 북마크 |

---

### 핵심 성과 및 기여

**Backend — Quiz API 설계 및 구현**
- Django REST Framework 기반 퀴즈 API 설계 및 개발
- AI 생성 퀴즈 (객관식/O·X/단답형) 데이터 모델링 및 CRUD API 구현
- 퀴즈 북마크(QuizBookmark) 모델 설계 및 사용자별 학습 이력 관리 기능 구현
- Qdrant 'quizzes' 컬렉션 연동 — 카테고리별 퀴즈 조회 및 랜덤 샘플링 로직 개발

**Backend — 에러 핸들링 미들웨어**
- Django 커스텀 미들웨어 설계 및 구현으로 API 에러 응답 일관성 확보
- 예외 유형별 분기 처리 및 사용자 친화적 에러 메시지 반환

**Frontend — UI 개발 및 최적화**
- 퀴즈 인터페이스 구현 (문제 풀이, 즉시 피드백, 해설 표시, 북마크 UI)
- CSS/JS 최적화로 페이지 로딩 성능 및 반응형 레이아웃 개선
- Django 템플릿 기반 멀티 페이지 UI 스타일링 통일

**3차 프로젝트 기여**
- Flask 기반 프로토타입 UI 개발 참여
- 퀴즈 기초 기능 구현

---

### 기술적 도전과 해결

| 도전 | 해결 방법 | 결과 |
|------|-----------|------|
| 한국어 벡터 검색 정확도 | 이중 쿼리 (KO 원본 + EN 번역 동시 검색) | 크로스링구얼 검색 품질 향상 |
| LLM 할루시네이션 | 관련도 점수 기반 3단계 라우팅 | 불확실한 답변 자동 차단 |
| 검색 결과 순위 최적화 | BAAI Reranker + BM25 하이브리드 | 상위 검색 결과 정확도 개선 |
| MVP → 프로덕션 전환 | Flask → Django 마이그레이션 | 인증, ORM, 관리자 기능 확보 |
| 실시간 응답 UX | SSE 스트리밍 | 토큰 단위 실시간 답변 표시 |
| 안정적 배포 | Docker + EC2 + Nginx | 프로덕션 서비스 운영 |

---

### 아키텍처

```
[3차: MVP]
사용자 → Flask → LangGraph RAG → Qdrant

[4차: 프로덕션]
사용자 → Nginx → Django → LangGraph RAG Engine
                              ├── Dual Query Search (KO+EN)
                              ├── BAAI Reranker
                              └── GPT-4o-mini Analysis
                                    ↓
                              Qdrant (벡터 DB)
                              PostgreSQL (관계형 DB)
```

---

### 배운 점

- RAG 시스템의 검색 품질이 전체 서비스 품질을 좌우함을 체감
- 이중 쿼리, 리랭킹 등 검색 파이프라인 최적화의 중요성
- MVP에서 프로덕션으로의 전환 과정 (Flask → Django, 로컬 → AWS) 경험
- Docker 기반 컨테이너화와 클라우드 배포 실무 경험
- LangGraph를 활용한 복잡한 AI 워크플로우 설계 역량 확보
