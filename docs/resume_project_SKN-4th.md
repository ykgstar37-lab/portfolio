# 이력서용 프로젝트 정리 — SKN21 4차 프로젝트

## PyMate — Bootcamp AI RAG Tutor (4차 확장)

### 프로젝트 개요
| 항목 | 내용 |
|------|------|
| **프로젝트명** | PyMate — Bootcamp AI RAG Tutor |
| **기간** | 4차 프로젝트 (3차 프로젝트 연장) |
| **팀 규모** | 6명 |
| **역할** | Backend & Frontend (Quiz API, 에러 미들웨어, UI 개발) |
| **한줄 소개** | 부트캠프 강의 자료 기반 RAG AI 학습 튜터 — Django 마이그레이션, 기능 확장, AWS 배포 |

---

### 프로젝트 설명

부트캠프 수강생의 학습을 돕는 **RAG 기반 AI 튜터 웹 서비스**를 개발했습니다.
3차 프로젝트에서 구축한 RAG 파이프라인을 기반으로, 4차에서는 **Django 마이그레이션**, **기능 확장**, **AWS 프로덕션 배포**를 수행했습니다.

**해결한 문제:**
- 수강생이 강의 외 시간에 학습 질문에 대한 즉각적인 답변을 받기 어려운 문제
- 일반 LLM의 할루시네이션 없이, 실제 강의 자료에 기반한 신뢰성 높은 답변 제공

---

### 기술 스택

```
Backend:    Python 3.12 · Django 6.0 · Django REST Framework
AI/LLM:     LangChain · LangGraph · OpenAI GPT-4o-mini
Vector DB:  Qdrant · text-embedding-3-large (3072D)
Search:     이중 쿼리(KO+EN) · 하이브리드 검색 · BM25 · BAAI Reranker
DB:         PostgreSQL (AWS RDS)
Deploy:     AWS EC2 · Docker Compose · Nginx · Gunicorn
Frontend:   HTML/CSS/JS · SSE 스트리밍
```

---

### 주요 기능

- **학습 챗봇**: 강의 자료 + Python 공식 문서 기반 RAG Q&A, SSE 실시간 스트리밍
- **퀴즈 시스템**: AI 생성 퀴즈 (객관식/O·X/단답형), 즉시 피드백, 북마크
- **코드 리뷰**: 에러 분석, 디버깅 지원, 코드 제안
- **스튜디오**: 개념 요약, 플래시카드, 비교표 등 학습 보조 도구
- **사용자 관리**: 회원가입/로그인, 학습 히스토리, 북마크

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

---

### 기술적 도전과 해결

| 도전 | 해결 | 결과 |
|------|------|------|
| 한국어 질문의 벡터 검색 정확도 저하 | 한국어 원본 + 영어 번역 이중 쿼리 동시 검색 | 크로스링구얼 검색 정확도 향상 |
| LLM 할루시네이션 리스크 | 관련도 점수 기반 3단계 라우팅 | 신뢰할 수 없는 답변 방지 |
| 검색 결과 순위 최적화 | BAAI Reranker + BM25 하이브리드 검색 | 상위 결과 정확도 개선 |
| 실시간 응답 UX | SSE 스트리밍 구현 | 토큰 단위 실시간 응답 표시 |
| 프로덕션 배포 | Docker Compose + AWS EC2 + Nginx | 안정적 서비스 운영 |

---

### 아키텍처

```
사용자 → Nginx → Django → LangGraph RAG Engine
                              ├── Dual Query Search (KO+EN)
                              ├── BAAI Reranker
                              └── GPT-4o-mini Analysis
                                    ↓
                              Qdrant (벡터 DB)
                              PostgreSQL (관계형 DB)
```
