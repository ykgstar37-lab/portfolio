# PROJECT SUMMARY — SKN21 4차 프로젝트

## 프로젝트명
**PyMate — Bootcamp AI RAG Tutor (4차: 프로덕션 확장)**

## 한줄 요약
부트캠프 강의 자료와 Python 공식 문서 기반 RAG AI 학습 튜터를 Django로 마이그레이션하고, 퀴즈·코드리뷰·스튜디오 기능을 확장하여 AWS EC2에 배포한 프로젝트

---

## 배경 및 목적

3차 프로젝트에서 Flask 기반 RAG 챗봇 MVP를 완성한 뒤, 4차 프로젝트에서는 **프로덕션 수준의 확장**을 목표로 했습니다:

1. **Django 마이그레이션** — 사용자 인증, ORM, 관리자 기능 등 확장성 확보
2. **기능 고도화** — 퀴즈 시스템, 코드 리뷰, 스튜디오 학습 도구 추가
3. **검색 품질 향상** — 리랭킹(BAAI bge-reranker-v2-m3), BM25 하이브리드 검색 강화
4. **클라우드 배포** — AWS EC2 + Docker + Nginx 프로덕션 환경 구축

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Backend | Python 3.12, Django 6.0, Django REST Framework |
| AI/LLM | LangChain, LangGraph, OpenAI GPT-4o-mini |
| 벡터 DB | Qdrant, text-embedding-3-large (3072차원) |
| 검색 | 이중 쿼리(KO+EN), 하이브리드 검색, BM25, BAAI Reranker |
| DB | PostgreSQL (AWS RDS) |
| 배포 | AWS EC2 (t3.medium), Docker Compose, Nginx, Gunicorn |
| Frontend | HTML/CSS/JS, SSE 스트리밍, marked.js, highlight.js |
| 평가 | RAGAS |

---

## 주요 기능

### 1. 학습 챗봇 (Chat)
- RAG 기반 실시간 스트리밍 응답 (SSE)
- 강의 자료 + Python 공식 문서에서 검색 후 답변
- 대화 히스토리 유지 (LangGraph MemorySaver)
- 후속 질문 자동 추천
- 출처 표시

### 2. 퀴즈 (Quiz)
- AI가 강의 자료 기반으로 퀴즈 생성
- 객관식, O/X, 단답형 지원
- 즉시 피드백 및 해설 제공
- 북마크 기능

### 3. 코드 리뷰 (Code)
- 에러 분석 및 디버깅 지원
- 단계별 에러 설명
- 코드 개선 제안 및 출력 예측

### 4. 스튜디오 (Studio)
- 개념 요약
- 단계별 설명
- 플래시카드
- 비교표
- 대안 예제

### 5. 사용자 관리
- 회원가입/로그인 (Django Auth)
- 채팅·퀴즈 히스토리 관리
- 북마크 시스템
- 학습 통계

---

## 시스템 아키텍처

```
사용자 → Nginx (80/443) → Django (8000) → RAG (LangGraph)
                                              ├── Dual Query Search (KO+EN)
                                              ├── Reranking (BAAI)
                                              └── LLM Analysis (GPT-4o-mini)
                                                    ↓
                                              Qdrant (6333)
                                              PostgreSQL (RDS)
```

---

## 3차 대비 개선 사항

| 항목 | 3차 (MVP) | 4차 (프로덕션) |
|------|-----------|----------------|
| 프레임워크 | Flask | Django 6.0 + DRF |
| 사용자 인증 | 없음 | Django Auth (회원가입/로그인) |
| DB | 없음 (Qdrant만) | PostgreSQL (RDS) + Qdrant |
| 검색 | 벡터 검색 + 이중 쿼리 | + BM25 + BAAI Reranker |
| 기능 | 챗봇 + 퀴즈(기초) | + 코드 리뷰 + 스튜디오 + 북마크 |
| 응답 | 일반 응답 | SSE 실시간 스트리밍 |
| 배포 | 로컬 실행 | AWS EC2 + Docker + Nginx |
| UI | 단일 페이지 | 다중 페이지 (채팅/퀴즈/코드/스튜디오) |

---

## 팀 구성

| 이름 | 역할 | 담당 업무 |
|------|------|-----------|
| 김가람 | AI Core | RAG 파이프라인, 데이터 전처리, Qdrant, 프롬프트 엔지니어링 |
| 최자슈아주원 | Backend Lead | Django 아키텍처, Chat API (SSE), UI 통합 |
| 신지용 | DevOps | AWS EC2, Docker, Nginx, 배포 자동화 |
| 윤경은 | Backend & Frontend | Quiz API, 에러 미들웨어, CSS/JS |
| 안혜빈 | AI Core | RAG 파이프라인, 전처리, Qdrant, 프롬프트 |
| 정세연 | UI Design | 디자인 시스템, UX/UI 설계 |

---

## 배포 환경

- **서버:** AWS EC2 t3.medium (2 vCPU, 4GB RAM, Ubuntu 24.04)
- **컨테이너:** Docker Compose (Qdrant + Django + Nginx)
- **DB:** PostgreSQL on AWS RDS
- **웹서버:** Nginx (리버스 프록시) + Gunicorn (WSGI, 4 workers)
- **월 비용:** ~$33

---

## 핵심 기술적 도전과 해결

| 도전 | 해결 방법 |
|------|-----------|
| 한국어 검색 정확도 저하 | 이중 쿼리 (한국어 원본 + 영어 번역 동시 검색) |
| LLM 할루시네이션 | 관련도 임계치 기반 3단계 라우팅 |
| 검색 결과 품질 | BAAI Reranker + BM25 하이브리드 검색 |
| 코드 설명 정확성 | 코드-마크다운 컨텍스트 쌍 유지 |
| 실시간 응답 체감 | SSE 스트리밍 구현 |
| 스케일링 | Docker 컨테이너화 + AWS 배포 |
