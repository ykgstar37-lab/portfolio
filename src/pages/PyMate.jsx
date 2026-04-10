import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import TechnicalDrawer from '../components/TechnicalDrawer';
import SectionDotNav from '../components/SectionDotNav';


const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const TECH_STACK = {
    'Backend': ['Python 3.12', 'Django 5.x', 'DRF', 'Flask', 'Gunicorn', 'SSE'],
    'AI & RAG': ['LangChain', 'LangGraph', 'OpenAI GPT-4o-mini', 'text-embedding-3-large', 'RAGAS', 'Tavily'],
    'Database': ['Qdrant', 'PostgreSQL'],
    'Infra': ['AWS EC2', 'AWS RDS', 'Docker', 'Nginx'],
    'Frontend': ['HTML/CSS/JS'],
};

const FEATURES = [
    {
        title: '학습할래용 (Chat)',
        desc: '대화형 학습 챗봇. 이전 질문 흐름을 반영한 연속 대화 지원. Memory Retriever로 맥락 유지. LangGraph 워크플로우 기반 실시간 스트리밍 Q&A.',
        icon: '01',
        color: 'from-[#e8609c] to-[#c74b82]'
    },
    {
        title: '퀴즈풀래용',
        desc: 'OX 퀴즈 기반 학습 검증. 즉각 피드백과 개념 보충 설명 제공. 북마크 기능으로 틀린 문제 재학습 지원.',
        icon: '02',
        color: 'from-[#d4578e] to-[#b8417a]'
    },
    {
        title: '코드풀래용',
        desc: 'AI 코드 리뷰 & 오류 분석. 문법/실행 오류 분석, 수정 코드 예시 제안, 실행 결과 예측 및 출력 예시 제공까지 원스톱 코드 학습 지원.',
        icon: '03',
        color: 'from-[#c74b82] to-[#a83a6d]'
    },
    {
        title: '스튜디오 (7가지)',
        desc: '개념 요약, 단계별 설명, 플래시카드, 퀴즈, 표로 정리, 다른 예시, 메모장 — 7가지 학습 도구로 체계적인 학습 지원.',
        icon: '04',
        color: 'from-[#b84178] to-[#9a3565]'
    },
    {
        title: '학습 기록 관리',
        desc: '북마크 & 히스토리로 학습 이력 관리. Django Auth 기반 회원가입/로그인, 개인화된 학습 경험 제공. 모바일 UI 대응.',
        icon: '05',
        color: 'from-[#a83a6d] to-[#8c2e5a]'
    },
];

const CONTRIBUTIONS = [
    { title: '임베딩 검색 품질 개선', desc: '768D→3072D 교체 → Context Precision 0.83→0.97 (+14.4%).', tag: 'Data' },
    { title: 'Quiz API 3종 확장', desc: '단일→객관식/O·X/단답형 3종 + AI 자동 생성 → 퀴즈 유형 1→3개.', tag: 'Backend' },
    { title: '오답 재학습 시스템', desc: 'QuizBookmark + Qdrant 연동 → 마이페이지 즉시 재학습 접근.', tag: 'Backend' },
    { title: '에러 포맷 통일', desc: 'Django 미들웨어로 전역 핸들링 → 에러 처리 단일 핸들러로 통합.', tag: 'Backend' },
    { title: '즉시 피드백 UI', desc: '별도 페이지 이동 제거 → 풀이→피드백→다음 문제 한 화면 완결.', tag: 'Frontend' },
    { title: 'Flask→Django 전환', desc: 'ORM·인증·정적파일 수동→프레임워크 기본 제공 활용, AWS 배포.', tag: 'Frontend' },
    { title: '502 에러 해결', desc: 'Nginx+Gunicorn 소켓 경로 수정 → 배포 완료, 장애 0건 운영.', tag: 'Infra' },
];

const CHALLENGES = [
    { title: '한국어 검색 정확도', problem: '한국어 쿼리의 벡터 검색 정확도 낮음', solution: '이중 쿼리(KO+EN) 동시 검색', result: 'Recall 0.75→0.85', icon: '1' },
    { title: 'LLM 할루시네이션', problem: '관련 없는 질문에 환각 응답 생성', solution: '관련도 3단계 라우팅 (>0.5 / 0.3~0.5 / <0.3)', result: '환각 차단 100%', icon: '2' },
    { title: '검색 순위 최적화', problem: '벡터 검색만으로 상위 문서 관련도 낮음', solution: 'cross-encoder 리랭킹 + BM25 하이브리드', result: 'Precision 0.83→0.97', icon: '3' },
    { title: 'Flask→Django 전환', problem: 'ORM·인증·정적파일 모두 수동 구성', solution: 'Django 5.x + DRF 기본 제공 활용', result: 'API 구조화 완료', icon: '4' },
    { title: '실시간 UX', problem: 'LLM 응답 수 초 소요, 화면 멈춤 오해', solution: 'SSE 토큰 단위 스트리밍', result: '첫 토큰 ~0.3초', icon: '5' },
    { title: '배포 502 에러', problem: 'AWS EC2에서 502 에러 발생', solution: 'Nginx+Gunicorn 소켓 경로 수정', result: '장애 0건 운영', icon: '6' },
];

const SEARCH_STEPS = [
    { step: '1', title: '이중 쿼리 검색', desc: '한국어 + 영어 동시 검색', detail: 'KO + EN' },
    { step: '2', title: '하이브리드 검색', desc: '벡터 + 키워드 + BM25', detail: 'Multi-signal' },
    { step: '3', title: '리랭킹', desc: 'cross-encoder/ms-marco-MiniLM-L6-v2', detail: 'Cross-encoder' },
    { step: '4', title: '관련도 라우팅', desc: '점수 기반 3단계 분기', detail: 'Score-based' },
];

const IMPROVEMENTS = [
    { category: '프레임워크', phase3: 'Flask', phase4: 'Django 5.x + DRF' },
    { category: '인증', phase3: '없음', phase4: 'Django Auth' },
    { category: '데이터베이스', phase3: 'Qdrant만', phase4: 'PostgreSQL + Qdrant' },
    { category: '검색', phase3: '벡터검색 + 이중쿼리', phase4: '+ BM25 + Cross-encoder Reranker' },
    { category: '기능', phase3: '챗봇 + 퀴즈 기초', phase4: '+ 코드리뷰 + 스튜디오 + 북마크' },
    { category: '응답 방식', phase3: '일반 응답', phase4: 'SSE 실시간 스트리밍' },
    { category: '배포', phase3: '로컬', phase4: 'AWS EC2 + Docker + Nginx' },
];

const RAGAS_METRICS = [
    { label: 'Context Precision', before: '0.8333', after: '0.9758', improvement: '+14.4%p', desc: '검색 결과 중 관련 문서 비율' },
    { label: 'Context Recall', before: '0.7044', after: '0.7944', improvement: '+12.7%p', desc: '필요 문서 중 실제 검색된 비율' },
    { label: 'Reranker 경량화', before: 'bge-reranker-v2-m3', after: 'ms-marco-MiniLM-L6-v2', improvement: '-1초', desc: 'cross-encoder로 교체하여 레이턴시 절감' },
];

const DB_SCHEMA = {
    postgresql: [
        { name: 'User', desc: '사용자 계정 정보' },
        { name: 'UserProfile', desc: '사용자 프로필 및 설정' },
        { name: 'ChatBookmark', desc: '대화 북마크 저장' },
        { name: 'QuizBookmark', desc: '퀴즈 북마크 저장' },
    ],
    qdrant: [
        { name: 'learning_ai', desc: '강의 자료 + Python 공식 문서 임베딩' },
        { name: 'quizzes', desc: '퀴즈 뱅크 벡터 컬렉션' },
    ],
};

const SECTIONS = [
    { id: 'goal', label: 'Goal' },
    { id: 'embedding-serving', label: 'Embedding Serving' },
    { id: 'rag-eval', label: 'RAG 성능 평가' },
    { id: 'contributions', label: 'My Contributions' },
    { id: 'challenges', label: 'Technical Challenges' },
    { id: 'demo', label: 'Demo', highlight: true },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
];

const DRAWER_TABS = [
    { label: 'About', content: (
        <div className="space-y-6">
            {/* Gradient hero card */}
            <div className="bg-[#e8609c] rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>PyMate</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-4" style={{ wordBreak: 'keep-all' }}>
                    부트캠프 학습 데이터를 검색·평가 가능한 구조로 바꾼 RAG 기반 ML 서비스. Flask MVP에서 검색 품질 병목을 발견하고 Django로 전환,
                    임베딩 3072D 교체로 Context Precision 0.83→0.97을 달성했으며, 3단계 라우팅으로 잘못된 생성 응답을 서빙 레이어에서 차단했습니다.
                </p>
                <div className="flex flex-wrap gap-2">
                    {['Django', 'LangGraph', 'Qdrant', 'RAGAS', 'SSE', 'AWS EC2'].map(t => (
                        <span key={t} className="text-[10px] font-bold px-2 py-1 bg-white/15 rounded-full">{t}</span>
                    ))}
                </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Precision', value: '0.9758', sub: '+14.4%p 향상' },
                    { label: 'Recall', value: '0.7944', sub: '+12.7%p 향상' },
                    { label: '환각 차단', value: '100%', sub: '3단계 라우팅' },
                    { label: '임베딩', value: '3,072D', sub: '768D에서 4x' },
                    { label: 'Reranker', value: '-1초', sub: 'BAAI→MiniLM' },
                    { label: '기능', value: '7가지', sub: '채팅+퀴즈+코드+스튜디오' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-lg font-bold text-[#e8609c]">{item.value}</p>
                        <p className="text-[10px] text-gray-500">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* What Makes This Special */}
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What Makes This Special</p>
                <div className="space-y-2">
                    {[
                        '768D→3072D 임베딩 교체만으로 Context Precision +14.4%p — LLM 성능이 아니라 검색 품질이 답변 품질을 결정한다는 것을 RAGAS로 증명',
                        'Reranker를 BAAI→cross-encoder/MiniLM-L6-v2로 교체 — 정확도 유지하면서 레이턴시 1초 감소',
                        '관련도 <0.3이면 "모르겠다"고 답하는 정직한 AI — 환각 차단율 100%, 사용자에게 거짓 정보 전달 0건',
                        'Flask의 수동 인프라 한계(ORM, 인증, 정적파일 모두 수동)를 Django 전환으로 해결 → AWS EC2 프로덕션 배포',
                        '한국어 벡터 검색 한계를 이중 쿼리(KO+EN) 전략으로 돌파 — 동일 질문을 한/영 동시 검색하여 Recall +12.7%p',
                        '기본 채팅 → 퀴즈(3종) + 코드 리뷰 + 스튜디오(7가지 학습 도구) → 총 7가지 기능으로 확장',
                    ].map((text, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-[#e8609c] mt-0.5 flex-shrink-0">*</span>
                            <span style={{ wordBreak: 'keep-all' }}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )},
    { label: 'Overview', content: (
        <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: '팀 구성', value: '5명', sub: 'SKN21 4Team' },
                    { label: '역할', value: 'BE & FE', sub: 'Quiz API, 미들웨어, UI' },
                    { label: '임베딩 차원', value: '3,072D', sub: 'text-embedding-3-large' },
                    { label: '프레임워크 전환', value: 'Flask → Django', sub: '3차 MVP → 4차 프로덕션' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
                        <p className="text-xs font-medium text-gray-500">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* Phase 1 (3차) */}
            <div id="phase1" className="mb-8">
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Phase 1 — 3차 프로젝트 (MVP)</h3>
                <p className="text-gray-500 mb-6">Flask 기반 RAG 챗봇 프로토타입 구축</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#e8609c]/10 flex items-center justify-center text-sm font-bold text-[#e8609c]">01</div>
                            <div>
                                <p className="text-base font-bold text-gray-900">Flask MVP</p>
                                <p className="text-xs font-bold text-gray-400">빠른 프로토타이핑</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">Flask 경량 프레임워크로 RAG 챗봇 MVP를 신속하게 구현. LangGraph 기반 워크플로우 파이프라인 구축.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#e8609c]/10 flex items-center justify-center text-sm font-bold text-[#e8609c]">02</div>
                            <div>
                                <p className="text-base font-bold text-gray-900">Qdrant 벡터 DB</p>
                                <p className="text-xs font-bold text-gray-400">벡터 검색 엔진</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">강의 자료(.ipynb)와 Python RST 문서를 청킹 후 3072차원 임베딩으로 Qdrant에 저장. 이중 쿼리 벡터 검색 구현.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#e8609c]/10 flex items-center justify-center text-sm font-bold text-[#e8609c]">03</div>
                            <div>
                                <p className="text-base font-bold text-gray-900">기초 퀴즈</p>
                                <p className="text-xs font-bold text-gray-400">학습 검증 기능</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">GPT-4o-mini를 활용한 기초 퀴즈 생성 기능. 학습한 내용을 바로 테스트할 수 있는 인터랙티브 인터페이스.</p>
                    </div>
                </div>
            </div>

            {/* Phase 2 (4차) */}
            <div id="phase2" className="mb-8">
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Phase 2 — 4차 프로젝트 (프로덕션)</h3>
                <p className="text-gray-500 mb-6">Django 마이그레이션 및 기능 확장, AWS 배포</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#e8609c]/10 flex items-center justify-center text-sm font-bold text-[#e8609c]">01</div>
                            <div>
                                <p className="text-base font-bold text-gray-900">Django 6.0 + DRF</p>
                                <p className="text-xs font-bold text-gray-400">프로덕션 프레임워크</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">Django REST Framework로 구조화된 API 체계 구축. Django Auth 기반 사용자 인증 및 학습 이력 관리 시스템 추가.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#e8609c]/10 flex items-center justify-center text-sm font-bold text-[#e8609c]">02</div>
                            <div>
                                <p className="text-base font-bold text-gray-900">고도화된 검색</p>
                                <p className="text-xs font-bold text-gray-400">하이브리드 + 리랭킹</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">BM25 키워드 검색 추가, cross-encoder/ms-marco-MiniLM-L6-v2로 리랭킹. 관련도 점수 기반 3단계 라우팅으로 할루시네이션 방지.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#e8609c]/10 flex items-center justify-center text-sm font-bold text-[#e8609c]">03</div>
                            <div>
                                <p className="text-base font-bold text-gray-900">AWS 배포</p>
                                <p className="text-xs font-bold text-gray-400">EC2 + Docker + Nginx</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">Docker 컨테이너화, Nginx 리버스 프록시, Gunicorn WSGI 서버. AWS RDS(PostgreSQL) 연동으로 안정적 데이터 관리.</p>
                    </div>
                </div>
            </div>

            {/* 3차 vs 4차 Comparison Table */}
            <div id="comparison" className="mt-8">
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>3차 vs 4차 개선 사항</h3>
                <p className="text-gray-500 mb-6">MVP에서 프로덕션까지의 기술적 진화</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 font-bold text-gray-700">카테고리</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">3차 (MVP)</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">4차 (프로덕션)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {IMPROVEMENTS.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0">
                                        <td className="px-5 py-3 font-semibold text-gray-900">{row.category}</td>
                                        <td className="px-4 py-3 text-gray-500">{row.phase3}</td>
                                        <td className="px-4 py-3 font-medium text-[#e8609c]">{row.phase4}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )},
    { label: 'Architecture', content: (
        <div className="space-y-8">
            {/* RAG Workflow Flowchart Image */}
            <div>
                <p className="text-xs font-bold text-[#c74b82] uppercase tracking-wider mb-3">RAG Workflow Flowchart</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <img src="/pymate-rag-workflow.png" alt="RAG Workflow Flowchart — Search Node 내부 9-Stage Hybrid Pipeline" className="w-full h-auto" />
                </div>
            </div>

            {/* System Architecture */}
            <div>
                <p className="text-xs font-bold text-[#c74b82] uppercase tracking-wider mb-3">System Architecture</p>
            </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-3">
            {/* User → Nginx → Django */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="px-5 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 text-center">사용자 (Browser)</div>
                <div className="text-gray-300 font-bold">→</div>
                <div className="px-5 py-3 bg-[#e8609c]/10 border border-[#e8609c]/30 rounded-xl text-sm font-bold text-[#c74b82] text-center">Nginx (Proxy)</div>
                <div className="text-gray-300 font-bold">→</div>
                <div className="px-5 py-3 bg-[#e8609c] rounded-xl text-sm font-bold text-white text-center">Django + DRF</div>
            </div>
            <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

            {/* Django Internal Modules */}
            <div className="flex justify-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[140px] max-w-[200px] px-4 py-3 bg-[#e8609c]/10 border border-[#e8609c]/30 rounded-xl text-center">
                    <p className="text-xs font-bold text-[#c74b82]">Auth System</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Django Auth</p>
                </div>
                <div className="flex-1 min-w-[140px] max-w-[200px] px-4 py-3 bg-[#e8609c]/10 border border-[#e8609c]/30 rounded-xl text-center">
                    <p className="text-xs font-bold text-[#c74b82]">Quiz / Review</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Studio API</p>
                </div>
            </div>
            <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

            {/* RAG Engine */}
            <div className="flex justify-center">
                <div className="px-6 py-5 bg-gray-900 rounded-xl text-white text-center max-w-lg w-full">
                    <p className="text-sm font-bold mb-2">LangGraph RAG Engine</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-white/70 flex-wrap">
                        <span className="px-2 py-1 bg-white/10 rounded">Dual Query (KO+EN)</span>
                        <span className="text-white/30">→</span>
                        <span className="px-2 py-1 bg-white/10 rounded">Hybrid Search</span>
                        <span className="text-white/30">→</span>
                        <span className="px-2 py-1 bg-white/10 rounded">BAAI Reranker</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-3 text-[10px]">
                        <span className="px-2 py-1 bg-[#e8609c] text-white rounded font-bold">&gt;0.5 Direct</span>
                        <span className="px-2 py-1 bg-white/15 text-white/70 rounded">0.3~0.5 Web</span>
                        <span className="px-2 py-1 bg-white/10 text-white/50 rounded">&lt;0.3 No Data</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

            {/* Databases */}
            <div className="flex justify-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[140px] max-w-[200px] px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-purple-700">Qdrant</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Vector DB</p>
                </div>
                <div className="flex-1 min-w-[140px] max-w-[200px] px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-blue-700">PostgreSQL</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">AWS RDS</p>
                </div>
            </div>
        </div>
        </div>
    )},
    { label: 'Search Strategy', content: (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {SEARCH_STEPS.map((item, idx) => (
                    <div key={idx} className={`relative bg-[#e8609c] p-5 rounded-2xl text-white overflow-hidden cursor-default`} style={{ opacity: 1 - idx * 0.1 }}>
                        <div className="absolute top-2 right-3 text-white/15 text-4xl font-bold">{item.step}</div>
                        <h3 className="text-base font-bold mb-1 relative z-10">{item.title}</h3>
                        <p className="text-[11px] text-white/60 mb-3 relative z-10">{item.desc}</p>
                        <code className="text-[10px] text-white/80 bg-white/10 px-2 py-1 rounded block">{item.detail}</code>
                    </div>
                ))}
            </div>

            {/* Data Pipeline */}
            <div id="pipeline" className="mt-8">
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Data Pipeline</h3>
                <p className="text-gray-500 mb-6">원시 데이터에서 벡터 DB까지의 전처리 흐름</p>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                        {[
                            { label: 'Raw Data', sub: '.ipynb, RST' },
                            null,
                            { label: '전처리', sub: '텍스트 추출' },
                            null,
                            { label: '컨텍스트 주입', sub: '헤더 기반' },
                            null,
                            { label: '청킹', sub: 'MD 1200자 / Code 1000자' },
                            null,
                            { label: '임베딩', sub: '3072차원' },
                            null,
                            { label: 'Qdrant', sub: '벡터 저장' },
                        ].map((item, idx) =>
                            item === null ? (
                                <svg key={idx} className="w-5 h-5 text-[#e8609c] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            ) : (
                                <div key={idx} className="bg-gray-50 px-4 py-3 rounded-xl text-center min-w-[100px]">
                                    <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{item.sub}</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* DB Schema */}
            <div id="schema" className="mt-8">
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>DB Schema</h3>
                <p className="text-gray-500 mb-6">PostgreSQL 관계형 DB와 Qdrant 벡터 DB의 이중 데이터 구조</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#336791]"></div>
                                <h3 className="text-sm font-bold text-gray-700">PostgreSQL (AWS RDS)</h3>
                            </div>
                        </div>
                        <div className="p-4">
                            {DB_SCHEMA.postgresql.map((table, idx) => (
                                <div key={idx} className={`flex items-center gap-3 py-2.5 ${idx < DB_SCHEMA.postgresql.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <code className="text-xs font-mono font-bold text-[#e8609c] bg-pink-50 px-2 py-0.5 rounded">{table.name}</code>
                                    <p className="text-sm text-gray-500">{table.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#dc382c]"></div>
                                <h3 className="text-sm font-bold text-gray-700">Qdrant (Vector DB)</h3>
                            </div>
                        </div>
                        <div className="p-4">
                            {DB_SCHEMA.qdrant.map((collection, idx) => (
                                <div key={idx} className={`flex items-center gap-3 py-2.5 ${idx < DB_SCHEMA.qdrant.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <code className="text-xs font-mono font-bold text-[#dc382c] bg-red-50 px-2 py-0.5 rounded">{collection.name}</code>
                                    <p className="text-sm text-gray-500">{collection.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div id="features" className="mt-8">
                <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Key Features</h3>
                <p className="text-gray-500 mb-6">PyMate의 핵심 기능들</p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {FEATURES.map((feature, idx) => (
                        <div key={idx} className={`relative bg-[#e8609c] p-5 rounded-2xl text-white overflow-hidden cursor-default`}>
                            <div className="absolute top-2 right-3 text-white/15 text-4xl font-bold">{feature.icon}</div>
                            <h3 className="text-base font-bold mb-1 relative z-10">{feature.title}</h3>
                            <p className="text-[11px] text-white/60 mb-3 relative z-10 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )},
    { label: 'Tech Stack', content: (
        <div className="space-y-6">
            {Object.entries(TECH_STACK).map(([category, items]) => (
                <div key={category}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{category}</p>
                    <div className="flex flex-wrap gap-3">
                        {items.map(item => (
                            <span key={item} className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 shadow-sm">{item}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )},
];

export default function PyMate() {
    const navigate = useNavigate();
    useEffect(() => { const hash = window.location.hash; if (hash) { setTimeout(() => { const el = document.querySelector(hash); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 500); } else { window.scrollTo(0, 0); } }, []);

    return (
        <div className="bg-gradient-to-b from-white to-[#f9f9f9] min-h-screen text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* Back */}
                <motion.button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition mb-12 group" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    All Projects
                </motion.button>

                {/* Hero */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-20">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-[10px] font-bold px-3 py-1 bg-pink-50 text-pink-800 rounded-full tracking-wider uppercase">SKN21</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Team — 4Team (5명)</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">3차 → 4차 연속 진행</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        <span className="text-[#e8609c]">PyMate</span> — Bootcamp AI RAG Tutor
                    </h1>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
                        부트캠프 학생들의 강의 이해도 검증 도구가 없는 문제를 해결하기 위해 검색 품질과 응답 신뢰도를 함께 관리하는 RAG 학습 튜터를 개발. Flask MVP에서 병목을 찾은 뒤 Django로 전환하고, 임베딩 3072D 교체로 Context Precision 0.83→0.97을 달성했습니다. 또한 3단계 관련도 라우팅으로 환각 응답을 생성 단계가 아니라 시스템 단계에서 차단했습니다.
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                        <a href="https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN21_3rd_4Team" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            3차 GitHub
                        </a>
                        <a href="https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN21-4th-4Team" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8609c] text-white text-sm font-medium rounded-full hover:bg-[#c74b82] transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            4차 GitHub
                        </a>
                        <button onClick={() => { const el = document.getElementById('demo'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e27500] text-white text-sm font-medium rounded-full hover:bg-[#c96600] transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Demo
                        </button>
                    </div>
                </motion.div>

                {/* PDF-style Overview / Role / Skills */}
                <motion.div id="overview" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-[#e8609c] uppercase tracking-widest mb-2">Overview</p>
                                <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    AI Camp 교육과정에 특화된 RAG 기반 AI 튜터. 교육 규정과 학습 자료(Python 공식 문서, 강의 자료)를 하이브리드 검색하여 학생 질문에 즉시 답변을 제공합니다. RAGAS로 검색 품질을 정량 평가하고, embedding 교체로 Precision 0.83→0.97 달성.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
                                <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    RAG 파이프라인 설계(HyDE + BM25 + Reranker), Flask→Django 프로덕션 마이그레이션, RAGAS 기반 정량 평가 체계 구축, 임베딩 모델 교체(768D→3072D), AWS(Nginx+Gunicorn) 배포.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Django', 'LangChain', 'Qdrant', 'AWS', 'Nginx', 'RAGAS', 'HyDE', 'bge-reranker'].map(t => (
                                        <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Goal */}
                <motion.div id="goal" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Goal</h2>
                    <p className="text-gray-500 mb-6">이 프로젝트가 해결하려는 문제와 목표</p>
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border-l-4 border-[#e8609c] shadow-sm space-y-4">
                        <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                            <strong className="text-gray-900">문제:</strong> 부트캠프 학생들이 강의 내용을 스스로 검증할 도구가 없고, RAG 챗봇의 검색 품질이 낮아 엉뚱한 답변을 반환.
                        </p>
                        <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                            <strong className="text-gray-900">목표:</strong> 강의 자료 + Python 공식 문서 기반 RAG 튜터로 정확한 학습 지원. 검색 품질(Context Precision)을 0.97 이상으로 끌어올리고, 환각 응답을 원천 차단.
                        </p>
                    </div>
                </motion.div>

                {/* Embedding Serving Optimization */}
                <motion.div id="embedding-serving" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Embedding Serving Optimization</h2>
                    <p className="text-gray-500 mb-8">embedding 모형 선택과 Reranker 교체가 서빙 품질에 미친 영향</p>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">문제를 어떻게 정의했는가</p>
                        <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                            처음에는 RAG 품질이 낮은 원인을 "LLM의 답변 생성 능력"이라고 생각했습니다. 하지만 RAGAS 프레임워크로 검색 단계(Context Precision/Recall)와 생성 단계를 분리 측정한 결과,
                            <strong> 병목은 LLM이 아니라 embedding 검색 품질</strong>에 있다는 것을 발견했습니다. 이후 문제를 "embedding 모형 서빙 최적화"로 재정의하고, 차원 교체와 Reranker 경량화에 집중했습니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Embedding 차원 교체', title: '768D → 3,072D', desc: 'text-embedding-3-large로 교체. Qdrant 벡터 DB 전체 재설계 필요했지만, 이것만으로 Context Precision이 0.83→0.97 (+14.4%) 향상. 서빙할 모형 선택이 곧 성능.', color: 'border-[#e8609c]' },
                            { label: 'Reranker 경량화', title: 'BAAI → cross-encoder (-1초)', desc: 'bge-reranker-v2-m3에서 cross-encoder/ms-marco-MiniLM-L6-v2로 교체. 정확도를 유지하면서 레이턴시 1초 감소. 서빙 성능 트레이드오프 판단.', color: 'border-[#d4578e]' },
                            { label: '이중 쿼리 전략', title: 'KO + EN 동시 검색', desc: '한국어 embedding의 검색 정확도 한계를 영어 번역 쿼리로 보완. 동일 질문을 한국어+영어로 동시에 검색하여 recall 향상.', color: 'border-[#c74b82]' },
                            { label: 'Relevance 3단계 라우팅', title: '환각 방지 서빙 설계', desc: 'score >0.5 → 직접 답변, 0.3~0.5 → 웹 검색 보강, <0.3 → "데이터 없음" 응답. LLM이 부정확한 컨텍스트로 답변하는 것을 서버에서 차단.', color: 'border-[#b84178]' },
                        ].map((item, idx) => (
                            <motion.div key={idx} whileHover={{ y: -4 }} className={`bg-white p-5 rounded-2xl border-l-4 ${item.color} shadow-sm cursor-default`}>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed" style={{ wordBreak: 'keep-all' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* RAG 성능 평가 (RAGAS) */}
                <motion.div id="rag-eval" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>RAG 성능 평가</h2>
                    <p className="text-gray-500 mb-8">RAGAS 프레임워크 기반 검색 품질 측정 및 리랭커 최적화 결과</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {RAGAS_METRICS.map((metric, idx) => (
                            <motion.div key={idx} whileHover={{ y: -6 }} className="relative bg-white p-7 rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-default group">
                                <div className="absolute top-4 right-5 text-gray-100 text-6xl font-bold transition-colors group-hover:text-[#e8609c]/10">{String(idx + 1).padStart(2, '0')}</div>
                                <p className="text-xs font-bold text-[#c74b82] uppercase tracking-wider mb-1">{metric.label}</p>
                                <p className="text-[11px] text-gray-400 mb-5">{metric.desc}</p>
                                <div className="flex items-end gap-4 mb-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 mb-1">Before</p>
                                        <p className="text-base font-mono text-gray-400 line-through decoration-red-300">{metric.before}</p>
                                    </div>
                                    <svg className="w-6 h-6 text-[#e8609c]/40 flex-shrink-0 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <div>
                                        <p className="text-[10px] text-gray-400 mb-1">After</p>
                                        <p className="text-2xl font-bold font-mono text-gray-900">{metric.after}</p>
                                    </div>
                                </div>
                                <span className="inline-block text-xs font-bold bg-[#e8609c] text-white px-4 py-1.5 rounded-full">{metric.improvement}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* 정량 Before→After 도표 */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8 mb-8">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">지표</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-red-400 uppercase tracking-wider">3차 (Before)</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-emerald-500 uppercase tracking-wider">4차 (After)</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">개선</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { metric: 'Context Precision', before: '0.8333', after: '0.9758', improvement: '+14.4%p' },
                                    { metric: 'Context Recall', before: '0.7044', after: '0.7944', improvement: '+12.7%p' },
                                    { metric: '임베딩 차원', before: '768D', after: '3,072D', improvement: '4x 확장' },
                                    { metric: 'Reranker 레이턴시', before: 'BAAI (느림)', after: 'MiniLM-L6-v2', improvement: '-1초' },
                                    { metric: '환각 응답', before: '발생', after: '3단계 라우팅', improvement: '차단 100%' },
                                    { metric: '프레임워크', before: 'Flask (수동)', after: 'Django + DRF', improvement: '인프라 자동화' },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                                        <td className="px-5 py-3 font-semibold text-gray-900">{row.metric}</td>
                                        <td className="px-4 py-3 text-center text-red-400 font-mono">{row.before}</td>
                                        <td className="px-4 py-3 text-center text-emerald-600 font-bold font-mono">{row.after}</td>
                                        <td className="px-4 py-3 text-center"><span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">{row.improvement}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 768D vs 3072D 검색 결과 비교 */}
                    <div className="mt-8">
                        <p className="text-xs font-bold text-[#e8609c] uppercase tracking-wider mb-2">768D vs 3072D 검색 결과 비교</p>
                        <p className="text-sm text-gray-500 mb-4" style={{ wordBreak: 'keep-all' }}>질문: <span className="font-medium text-gray-700">"Python 리스트 컴프리헨션에서 조건문은 어떻게 쓰나요?"</span></p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">768D (Before) — Context Precision 0.83</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2"><span className="text-red-400 font-bold w-8">1위</span><span className="text-gray-600">"파일 입출력 기초"</span><span className="text-red-400 text-xs">관련 없음</span></div>
                                    <div className="flex items-center gap-2"><span className="text-red-400 font-bold w-8">2위</span><span className="text-gray-600">"변수와 자료형"</span><span className="text-red-400 text-xs">관련 없음</span></div>
                                    <div className="flex items-center gap-2"><span className="text-amber-500 font-bold w-8">3위</span><span className="text-gray-600">"반복문 기초"</span><span className="text-amber-500 text-xs">간접 관련</span></div>
                                </div>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">3072D (After) — Context Precision 0.97</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2"><span className="text-emerald-600 font-bold w-8">1위</span><span className="text-gray-600">"리스트 컴프리헨션 심화"</span><span className="text-emerald-500 text-xs">정확</span></div>
                                    <div className="flex items-center gap-2"><span className="text-emerald-600 font-bold w-8">2위</span><span className="text-gray-600">"for문과 조건 표현식"</span><span className="text-emerald-500 text-xs">정확</span></div>
                                    <div className="flex items-center gap-2"><span className="text-emerald-600 font-bold w-8">3위</span><span className="text-gray-600">"리스트/딕셔너리 컴프리헨션"</span><span className="text-emerald-500 text-xs">정확</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* My Contributions */}
                <motion.div id="contributions" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>My Contributions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CONTRIBUTIONS.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#e8609c] text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{idx + 1}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.tag === 'Backend' ? 'bg-pink-50 text-pink-700' : item.tag === 'Data' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>{item.tag}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Technical Challenges */}
                <motion.div id="challenges" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Technical Challenges</h2>
                    <p className="text-gray-500 mb-8">프로젝트에서 직면한 기술적 도전과 해결 방법</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CHALLENGES.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">{item.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <div className="mb-2">
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Problem</span>
                                            <p className="text-sm text-gray-500 mt-0.5">{item.problem}</p>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-[10px] font-bold text-[#e8609c] uppercase tracking-wider">Solution</span>
                                            <p className="text-sm text-gray-500 mt-0.5">{item.solution}</p>
                                        </div>
                                        <div className="mt-2 inline-block px-3 py-1.5 bg-emerald-50 rounded-lg">
                                            <span className="text-xs font-bold text-emerald-700">{item.result}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* TechnicalDrawer — replaces all CollapsibleSections */}
                <TechnicalDrawer accentColor="#e8609c" tabs={DRAWER_TABS} />

                {/* Demo Video */}
                <motion.div id="demo" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Demo</h2>
                    <p className="text-gray-500 mb-8">시연 영상</p>
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-black" style={{ aspectRatio: '16/9' }}>
                        <iframe
                            src="https://drive.google.com/file/d/19KFOQ6v96QwSp7D-P9iMM6ebjXQHxQpn/preview"
                            className="w-full h-full"
                            allow="autoplay"
                            allowFullScreen
                        />
                    </div>

                    <h3 className="text-xl font-bold mt-8 mb-4">Feature Details</h3>
                    <p className="text-gray-500 mb-6 text-sm">시연영상에서 확인할 수 있는 주요 기능 상세</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { num: '01', title: '학습할래용 — RAG 대화형 학습', desc: '강의 자료(.ipynb)와 Python 공식 문서에서 RAG 검색 후 답변 생성. SSE 스트리밍으로 토큰 단위 실시간 응답. 이중 쿼리(KO+EN) 전략으로 한국어 검색 정확도 향상. Relevance score 3단계 라우팅으로 환각 방지.' },
                            { num: '02', title: '퀴즈풀래용 — AI 퀴즈 생성 + 학습 검증', desc: 'AI가 강의 내용 기반으로 OX 퀴즈를 자동 생성. 즉각 피드백과 개념 보충 설명 제공. 틀린 문제 북마크 → 마이페이지에서 재학습. 정답률 통계와 학습 진행도 대시보드.' },
                            { num: '03', title: '스튜디오 — 7가지 학습 도구', desc: '개념 요약 · 단계별 설명 · 플래시카드 · 퀴즈 · 비교표 · 다른 예시 · 메모장 — 7가지 도구로 하나의 강의 내용을 다각도로 학습. AI가 강의 내용 기반으로 각 도구의 콘텐츠를 자동 생성.' },
                            { num: '04', title: '코드풀래용 — AI 코드 리뷰', desc: 'Python 코드를 입력하면 문법/실행 오류 분석, 수정 코드 예시 제안, 실행 결과 예측 및 출력 예시까지 원스톱 제공. 코드 블록 하이라이팅 + 복사 기능.' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-2xl font-bold text-gray-200" style={{ fontFamily: "'Syne', sans-serif" }}>{item.num}</span>
                                    <h3 className="text-base font-bold">{item.title}</h3>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed" style={{ wordBreak: 'keep-all' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Retrospective */}
                <motion.div id="retrospective" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Retrospective</h2>
                    <p className="text-gray-500 mb-6">프로젝트를 마치며</p>
                    <div className="space-y-4">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">핵심 인사이트</p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">01</span><span><strong className="text-gray-900">프레임워크 전환의 판단 기준</strong> — Flask MVP에서 Django로 전환한 건 "기능이 부족해서"가 아니라, ORM 마이그레이션, 관리자 페이지, 정적 파일 서빙 등 프로덕션에 필요한 인프라가 Flask에서는 모두 수동 구성이었기 때문.</span></li>
                                <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">02</span><span><strong className="text-gray-900">RAG 품질은 임베딩 차원이 결정</strong> — 768D에서 3072D로 교체한 것만으로 Context Precision이 0.8333 → 0.9758로 향상. 모델 자체보다 검색 품질이 답변 품질을 좌우.</span></li>
                                <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">03</span><span><strong className="text-gray-900">Nginx → Gunicorn → Django 서버 흐름</strong> — 로컬에서 잘 동작하던 코드가 AWS에서 502를 반환하는 경험을 통해, 요청이 처리되는 전체 흐름을 이해하는 것이 배포의 핵심.</span></li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2"><span className="text-red-400 text-xs font-bold mt-0.5 w-12 shrink-0">높음</span><span>모니터링/로깅 부족 — 프로덕션에서 어떤 질문이 실패하는지 추적하는 체계가 없어 개선 방향 설정 불가</span></li>
                                <li className="flex items-start gap-2"><span className="text-amber-500 text-xs font-bold mt-0.5 w-12 shrink-0">중간</span><span>Reranker 도입 후 응답 +1초 증가 — 정확도 vs 속도 트레이드오프를 사용자 관점에서 검증 필요</span></li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 text-xs font-bold mt-0.5 w-12 shrink-0">낮음</span><span>사용자 피드백 수집 미구현 — RLHF 파이프라인으로 RAG 품질 지속 개선 가능했을 것</span></li>
                            </ul>
                        </div>
                        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                            <p className="text-sm text-gray-600 leading-relaxed italic" style={{ wordBreak: 'keep-all' }}>
                                "RAG 품질이 낮은 건 LLM 때문"이라는 가정을 RAGAS로 검증해보니, 병목은 LLM이 아니라 embedding 검색 품질이었습니다. 문제를 올바르게 정의하는 것이 해결의 시작이라는 것을 배운 프로젝트였습니다.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
            <ScrollToTop />
            <SectionDotNav sections={SECTIONS} />
            <FloatingNav />
        </div>
    );
}
