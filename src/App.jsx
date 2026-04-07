import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { SiNotion } from 'react-icons/si';
import { HiAcademicCap, HiDesktopComputer } from 'react-icons/hi';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import profileImg from './assets/profile.jpg';
import ScrollToTop from './components/ScrollToTop';
import thumbCrypto from './assets/thumb_crypto.png';
import thumbSeoul from './assets/thumb_seoul.png';
import thumbCryptoVol from './assets/cryptovol.gif';
import thumbSeoulCulture from './assets/seoulculture.gif';
import thumbPymate from './assets/pymate.gif';
import thumbWorkflow from './assets/workflow.gif';

import CryptoVolatility from './pages/CryptoVolatility';
import SeoulCulture from './pages/SeoulCulture';
import PyMate from './pages/PyMate';
import WorkFlowAgent from './pages/WorkFlowAgent';
import CryptoVolDashboard from './pages/CryptoVolDashboard';
import SeoulCultureMap from './pages/SeoulCultureMap';

/* ── Animation variants ── */
const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

/* ── 3D Tilt Card ── */
function TiltCard({ children, className = '', ...props }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

    const handleMouse = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const reset = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            onMouseMove={handleMouse} onMouseLeave={reset}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1200 }}
            className={className} {...props}
        >
            {children}
        </motion.div>
    );
}

/* ── Project Card with hover overlay ── */
const ProjectCard = React.memo(function ProjectCard({ project, navigate }) {
    return (
        <div
            className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500 ${project.link ? 'cursor-pointer' : ''}`}
            onClick={project.link ? () => navigate(project.link) : undefined}
        >
            {/* Thumbnail area */}
            <div className="relative aspect-[8/5] overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#eaeaea] to-[#ddd]">
                {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title}
                        className="w-full h-full object-cover" />
                ) : (
                    <div className="w-[85%] h-[85%] rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#333] flex items-center justify-center shadow-lg">
                        <span className="text-5xl sm:text-7xl font-bold text-white/10" style={{ fontFamily: "'Syne', sans-serif" }}>{project.id}</span>
                    </div>
                )}
            </div>

            {/* Mobile info (always visible) */}
            <div className="sm:hidden p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-900/10 text-gray-700 rounded-full uppercase tracking-widest">{project.badge || project.category}</span>
                    {project.date && <span className="text-[10px] text-gray-500 font-semibold">{project.date}</span>}
                    {project.award && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            {project.award}
                        </span>
                    )}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">{project.title}</h3>
                {project.overview ? (
                    <div className="space-y-1.5">
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{project.overview}</p>
                        {project.role && (
                            <p className="text-[10px] text-gray-400 line-clamp-1"><span className="font-bold text-[#e27500]">Role</span> {project.role}</p>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{project.description}</p>
                )}
            </div>

            {/* Desktop hover overlay */}
            <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:flex flex-col justify-end p-8">
                <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-900/10 text-gray-700 rounded-full uppercase tracking-widest">{project.badge || project.category}</span>
                        {project.date && <span className="text-[10px] text-gray-500 font-semibold">{project.date}</span>}
                        {project.award && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                {project.award}
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{project.title}</h3>
                    {project.overview ? (
                        <div className="mb-3 space-y-2">
                            <div>
                                <span className="text-[9px] font-bold text-[#e27500] uppercase tracking-widest">Overview</span>
                                <p className="text-gray-600 text-xs leading-relaxed mt-0.5 line-clamp-2">{project.overview}</p>
                            </div>
                            {project.role && (
                                <div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Role</span>
                                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5 line-clamp-1">{project.role}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tech.map(t => <span key={t} className="px-2.5 py-1 bg-gray-900/10 text-gray-600 text-[10px] font-bold rounded-md">{t}</span>)}
                    </div>
                    <div className="flex gap-3">
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-300 text-gray-500 hover:bg-[#e27500] hover:text-white hover:border-[#e27500] transition-all">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                <span className="text-[10px] font-bold">GitHub</span>
                            </a>
                        )}
                        {project.demo && (
                            <a href={project.demo} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#e27500] text-white hover:bg-[#c96600] transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H9M17 7v8" /></svg>
                                <span className="text-[10px] font-bold">Live Demo</span>
                            </a>
                        )}
                        {!project.demo && project.link && (
                            <span onClick={(e) => { e.stopPropagation(); navigate(project.link + '#' + (project.demoHash || 'demo')); }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#e27500] text-white hover:bg-[#c96600] transition-all cursor-pointer">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H9M17 7v8" /></svg>
                                <span className="text-[10px] font-bold">{project.demoHash === 'screenshots' ? 'Screenshots' : project.demoHash === 'presentation' ? 'Research' : 'Demo'}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

/* ── Shared project data (single source of truth) ── */
const ALL_PROJECTS = [
    { id: '01', title: 'CryptoVol Dashboard', category: 'Personal', domain: 'Dev', date: '2026.03 —', description: 'GARCH 적합 연산(수백ms) 지연 → 5분 TTL 캐싱 + 에러 격리로 5개 모형 안정 서빙(14 REST + 1 WS). WebSocket 릴레이로 API 키 노출 차단, 1개 모형 실패가 전체 장애로 번지지 않는 설계.', overview: '팀 분석 프로젝트의 GARCH 모형을 실시간 서빙 API로 확장한 개인 풀스택 프로젝트. 5개 변동성 예측 모형, 매매 시그널, 포트폴리오 시뮬레이터, AI 브리핑을 제공하는 대시보드.', role: 'API 서빙 아키텍처 설계, WebSocket 릴레이 구현, 캐싱 전략, 에러 격리 설계', tech: ['FastAPI', 'React', 'GARCH', 'Binance WS', 'OpenAI'], github: 'https://github.com/ykgstar37-lab/crypto-volatility-dashboard', link: '/projects/crypto-vol-dashboard', thumbnail: thumbCryptoVol, badge: 'Personal', demoHash: 'screenshots' },
    { id: '02', title: 'Seoul Culture Map', category: 'Personal', domain: 'Dev', date: '2026.03 —', description: '정적 분석 결과를 11개 API 엔드포인트로 서빙. 2,500+ 시설 데이터를 K-means 군집분석 + Leaflet 지도로 시각화하고, AI 코스 추천까지 연결한 풀스택 서비스.', overview: '서울시 2,500+ 문화시설 데이터를 군집분석하고, Agentic RAG 기반 AI 추천과 인터랙티브 지도를 결합한 풀스택 서비스.', role: 'RESTful API 설계(11개 엔드포인트), LangGraph Agentic RAG 파이프라인, K-means 군집분석, SSE 스트리밍', tech: ['FastAPI', 'React', 'Leaflet', 'scikit-learn', 'OpenAI'], github: 'https://github.com/ykgstar37-lab/seoul-culture-map', link: '/projects/seoul-culture-map', thumbnail: thumbSeoulCulture, badge: 'Personal', demoHash: 'screenshots' },
    { id: '03', title: 'WorkFlow Agent (듀드)', category: 'Team', domain: 'Dev', date: '2026.02 — 2026.03', description: 'GPT API 의존 → vLLM 프라이빗 서빙 전환으로 비용 제거 + 데이터 보안 확보. JSON 유효율 70%→97%, 판단 정확도 37%→85%. 공통 LLM 모듈로 provider 전환 설정 1줄.', overview: '사내 업무 자동화를 위한 LLM 에이전트 시스템. 규정 판단, 문서 처리, 일정 관리, 복합 요청 분해를 4개 전문 에이전트가 처리.', role: 'vLLM 서빙 인프라 구축, 4중 Guardrail 설계, 5-factor Confidence 보정, LoRA 파인튜닝 데이터 품질 실험', tech: ['LangGraph', 'Kanana-1.5-8B', 'FastAPI', 'React'], github: 'https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN21-FINAL-3TEAM', link: '/projects/workflow-agent', thumbnail: thumbWorkflow, badge: 'Team' },
    { id: '04', title: 'PyMate — Bootcamp AI RAG Tutor', category: 'Team', domain: 'Dev', date: '2026.01 — 2026.02', description: 'RAGAS로 병목을 "LLM"이 아닌 "embedding 품질"로 재정의. 768D→3,072D 교체로 Precision 0.83→0.97(+14.4%), Reranker 경량화로 레이턴시 -1초. Flask→Django 프로덕션 표준화.', overview: 'AI Camp 교육과정에 특화된 RAG 기반 AI 튜터. 교육 규정과 학습 자료를 검색하여 즉시 답변을 제공하는 챗봇 서비스.', role: 'RAG 파이프라인 설계(HyDE+BM25+Reranker), Flask→Django 마이그레이션, RAGAS 기반 정량 평가, AWS 배포', tech: ['Django', 'LangChain', 'Qdrant', 'AWS'], github: 'https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN21-4th-4Team', link: '/projects/pymate', thumbnail: thumbPymate, badge: 'Team' },
    { id: '05', title: '암호화폐 변동성 비교 및 분석: GARCH 모델 기반 예측', category: 'Team', domain: 'Data', date: '2023.12 — 2024.01', description: 'ADF·ARCH-LM 사전 검정으로 GARCH 적용 근거를 확보하고, 5개 모형을 AIC/BIC/R² 기준으로 비교. HAR-TGARCH-X가 R²=0.89로 최적 모형으로 선정.', overview: '암호화폐 시장의 변동성을 GARCH 계열 5개 모형으로 비교 분석한 팀 연구 프로젝트.', role: 'GARCH 모형 비교 분석, ADF·ARCH-LM 사전 검정, HAR-TGARCH-X 최적 모형 선정, 발표', tech: ['Python', 'GARCH', 'HAR'], github: 'https://github.com/ykgstar37-lab/crypto-volatility-dashboard', link: '/projects/crypto-volatility', thumbnail: thumbCrypto, badge: 'Team', demoHash: 'presentation' },
    { id: '06', title: '외국인에게 관광목적에 맞는 지역구 제안', category: 'Team', domain: 'Data', date: '2023.09 — 2023.11', award: '2nd Place', description: '25개 자치구 관광시설 데이터를 NbClust+Silhouette로 최적 k=3 결정, PCA 설명력 91.3% 달성. 군집별 관광 목적 매칭으로 학술제 2등상 수상.', overview: '서울시 25개 자치구 관광시설 데이터를 군집분석하여 외국인 관광객에게 목적에 맞는 지역구를 추천하는 연구 프로젝트.', role: '공공데이터 전처리, NbClust+Silhouette 군집분석, PCA 차원축소, 시각화 및 발표', tech: ['R', 'dplyr', '공공데이터'], github: 'https://github.com/ykgstar37-lab', link: '/projects/seoul-culture', thumbnail: thumbSeoul, badge: 'Team', demoHash: 'presentation' },
];
const DEV_PROJECTS = ALL_PROJECTS.filter(p => p.domain === 'Dev');
const STAT_PROJECTS = ALL_PROJECTS.filter(p => p.domain === 'Data');

/* ── All Projects Page ── */
function ProjectsPage() {
    const navigate = useNavigate();
    const [activeDomain, setActiveDomain] = React.useState('All');
    const [activeTab, setActiveTab] = React.useState('All');

    const filteredProjects = ALL_PROJECTS
        .filter(p => activeDomain === 'All' || p.domain === activeDomain)
        .filter(p => activeTab === 'All' || p.category === activeTab);

    React.useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="bg-[#fafafa] min-h-screen text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
                <motion.button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition mb-8 sm:mb-12 group" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Home
                </motion.button>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-10 sm:mb-16">
                    <p className="text-sm italic text-gray-400 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>/ Complete Portfolio</p>
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        All <span className="text-[#e27500]">Projects</span>
                    </h1>
                    <p className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base">All projects I've worked on, from personal side projects to team collaborations.</p>
                </motion.div>

                {/* Domain Filter */}
                <div className="flex gap-2 mb-3 sm:mb-4">
                    {['All', 'Dev', 'Data'].map(tab => (
                        <button key={tab} onClick={() => { setActiveDomain(tab); setActiveTab('All'); }}
                            className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 ${activeDomain === tab ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400'}`}
                        >{tab}</button>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 mb-8 sm:mb-10">
                    {['All', 'Personal', 'Team'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 ${activeTab === tab ? 'bg-[#e27500] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400'}`}
                        >{tab}</button>
                    ))}
                </div>

                <motion.div key={`${activeDomain}-${activeTab}`} initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {filteredProjects.map((project, index) => (
                        <motion.div key={project.id} variants={fadeUp} custom={index}>
                            <ProjectCard project={project} navigate={navigate} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

const PROBLEM_SOLVING_CASES = [
    {
        id: 'api-serving',
        num: '01',
        tag: 'CryptoVol Dashboard',
        tagColor: '#2b4fcb',
        title: '분석 모형을 실시간 서빙 API로 전환하며 모델 서빙 설계를 체득',
        problem: 'GARCH 변동성 예측 모형을 실시간 API로 서빙하려니, 모형 적합(fit) 연산이 수백ms — 동시 요청 시 추론 지연 발생. 모델 재계산 비용이 높아 서빙 안정성 확보가 핵심 과제.',
        solutions: [
            '5분 TTL 인메모리 캐싱 + 120일 윈도우 제한으로 GARCH 재계산 방지. 개별 모형 실패 시 0.0 반환으로 에러 격리',
            'FastAPI WebSocket 릴레이 서버 구현 — Set 기반 클라이언트 추적으로 Binance 스트림을 브라우저에 브로드캐스트',
            '코인 전환 시 Promise.all로 API 호출 병렬화하여 체감 전환 속도 확보',
        ],
        results: [
            { label: 'Endpoints', value: '14 REST + 1 WS' },
            { label: '에러 격리', value: '1개 실패 ≠ 전체 장애' },
            { label: '보안', value: 'API 키 노출 차단' },
        ],
        insight: '"모델을 만드는 것"과 "모델을 안정적으로 서빙하는 것"은 완전히 다른 설계 관점 — 캐싱, 에러 격리, 보안 아키텍처가 서빙 안정성의 핵심',
        keywords: ['#모델서빙', '#캐싱전략', '#추론최적화', '#에러격리'],
    },
    {
        id: 'migration',
        num: '02',
        tag: 'PyMate',
        tagColor: '#16a34a',
        title: 'Flask MVP → Django 프로덕션 전환과 인프라 구조 이해',
        problem: 'Flask MVP는 기능적으로 동작했지만, ORM 마이그레이션·정적 파일 서빙·관리자 페이지 등 프로덕션 기능을 모두 수동 구성해야 했음. AWS 배포 시 Nginx → Gunicorn → Flask 연결에서 반복적인 502 에러 발생.',
        solutions: [
            'Django 내장 기능(ORM migration, admin, collectstatic)으로 프로덕션 인프라 표준화',
            'RAG 임베딩 768D → 3072D 교체 + Qdrant 벡터 DB 재설계로 검색 품질 향상',
            'Nginx → Gunicorn → Django 서버 흐름 직접 구성, 소켓 바인딩 설정 문제 해결',
        ],
        results: [
            { label: 'Context Precision', value: '0.83 → 0.97' },
            { label: 'Context Recall', value: '0.70 → 0.79' },
            { label: '병목 재정의', value: 'LLM이 아닌 embedding' },
        ],
        insight: 'RAGAS로 검색·생성을 분리 측정하여 병목이 "LLM 답변 능력"이 아닌 "embedding 검색 품질"임을 특정 — 구조를 바꾸는 것이 기능 추가보다 서비스 품질에 큰 영향',
        keywords: ['#프레임워크마이그레이션', '#인프라설계', '#RAG품질', '#배포안정화'],
    },
    {
        id: 'guardrail',
        num: '03',
        tag: 'WorkFlow Agent',
        tagColor: '#e27500',
        title: 'vLLM 기반 sLLM 서빙과 출력 검증 시스템 설계',
        problem: 'Base 모델에 "인턴에게 AWS 접근 권한을 줘도 되나요?" 질의 시, "yes"(오답) + confidence 0.92(과신) + "제12조"(미존재 조항 환각) 반환. 기본 정확도 37.2%. LoRA v2에서 98건 추가 시 오히려 -3.2%p 하락 — 라벨 오염.',
        solutions: [
            '4중 Guardrail — 키워드 매칭(0~1.0), 조항 존재 검증(환각 플래그), 카테고리 제한, 일관성 모니터링(500건 FIFO 캐싱)',
            '5-factor Confidence 보정으로 과신 차단 (Hard Cap: RAG 품질 < 0.2 → max 0.4). 동일 쿼리에서 "conditional"(정답) + confidence 0.78(적절) + 실존 조항 2건 + 조건/대안 제시로 개선',
            'LoRA v3 — 19건만 약점(재량 표현 14 + 경계 케이스 5)을 정밀 타겟팅하여 회복',
        ],
        results: [
            { label: '판단 정확도', value: '37% → 85%' },
            { label: '환각 → 실존 근거', value: '미존재 조항 → 실존 2건' },
            { label: '외부 의존 제거', value: 'GPT → 프라이빗 sLLM' },
        ],
        insight: '같은 쿼리에서 Base는 오답+환각+과신, LoRA+Guardrail은 정답+실존근거+적절한 confidence. GPT 의존을 vLLM 프라이빗 서빙으로 전환하여 비용 제거 + 데이터 보안 확보',
        keywords: ['#vLLM서빙', '#LLM신뢰성', '#Guardrail', '#LoRA파인튜닝'],
    },
    {
        id: 'agentic-rag',
        num: '04',
        tag: 'Seoul Culture Map',
        tagColor: '#0ea5e9',
        title: 'LangGraph 기반 Agentic RAG 파이프라인으로 비용 85% 절감',
        problem: '2,500+ 시설 데이터에 대해 단일 LLM 호출로 추천·검색·일상대화를 모두 처리하면, 매 요청마다 전체 컨텍스트를 주입해야 하여 토큰 비용이 높고 응답 품질 제어가 어려움.',
        solutions: [
            'LangGraph 3-node 파이프라인 설계 — Intent Classification → Data Retrieval → Response Generation. 일상대화(chitchat)는 검색을 건너뛰어 불필요한 DB/벡터 검색 비용 제거',
            'ChromaDB + all-MiniLM-L6-v2 로컬 임베딩으로 시맨틱 검색 구현. API 비용 $0, 200건 단위 배치 처리로 메모리 최적화. DB 대비 10% 이내 차이면 재임베딩 스킵',
            'SSE 스트리밍으로 토큰 단위 실시간 응답 전달. 3-5초 대기 → 첫 토큰 ~500ms로 체감 응답 속도 개선',
        ],
        results: [
            { label: '요청당 비용', value: '~$0.003 (85%↓)' },
            { label: '임베딩 비용', value: '$0 (로컬)' },
            { label: '체감 응답', value: 'SSE 첫 토큰 ~500ms' },
        ],
        insight: 'LLM 파이프라인의 핵심은 "언제 LLM을 호출하지 않을지" 결정하는 것 — 의도 분류로 불필요한 검색을 건너뛰고, 검색 단계에서 LLM 없이 SQL+벡터만 사용하면 비용과 레이턴시를 동시에 절감',
        keywords: ['#AgenticRAG', '#LangGraph', '#벡터검색', '#비용최적화'],
    },
];

function ProblemSolvingSection() {
    const [openId, setOpenId] = React.useState(null);

    return (
        <section id="experience" className="py-16 sm:py-32 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10 sm:mb-16">
                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Experience</p>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Problem <span className="text-gray-300">Solving</span>
                    </h2>
                    <p className="text-gray-400 mt-3 sm:mt-4 text-sm sm:text-base max-w-2xl mx-auto" style={{ wordBreak: 'keep-all' }}>
                        프로젝트에서 마주한 기술적 문제를 어떻게 분석하고 해결했는지, 그 과정의 사고와 판단을 정리했습니다.
                    </p>
                </motion.div>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-4 sm:space-y-6">
                    {PROBLEM_SOLVING_CASES.map((c, idx) => {
                        const isOpen = openId === c.id;
                        return (
                            <motion.div key={c.id} variants={fadeUp} custom={idx}>
                                <div
                                    className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-gray-300 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}`}
                                >
                                    {/* Summary Card — always visible */}
                                    <button
                                        onClick={() => setOpenId(isOpen ? null : c.id)}
                                        className="w-full text-left p-5 sm:p-8 flex items-start gap-4 sm:gap-6 group"
                                    >
                                        <span className="text-2xl sm:text-4xl font-bold text-gray-200 shrink-0 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{c.num}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: c.tagColor }}>{c.tag}</span>
                                            </div>
                                            <h3 className="text-base sm:text-xl font-bold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors">{c.title}</h3>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {c.keywords.map(k => (
                                                    <span key={k} className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{k}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </button>

                                    {/* Detail — accordion */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 sm:px-8 pb-6 sm:pb-8 space-y-6">
                                                    <div className="h-px bg-gray-100" />

                                                    {/* Problem */}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Problem</p>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{c.problem}</p>
                                                    </div>

                                                    {/* Solution */}
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: c.tagColor }}>Solution</p>
                                                        <div className="space-y-3">
                                                            {c.solutions.map((s, i) => (
                                                                <div key={i} className="flex gap-3">
                                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5" style={{ backgroundColor: c.tagColor }}>{i + 1}</div>
                                                                    <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Results */}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-3">Result</p>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {c.results.map((r, i) => (
                                                                <div key={i} className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{r.label}</p>
                                                                    <p className="text-sm sm:text-base font-bold text-gray-900">{r.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Insight */}
                                                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border-l-3" style={{ borderLeftWidth: 3, borderLeftColor: c.tagColor }}>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Key Insight</p>
                                                        <p className="text-sm font-medium text-gray-800 leading-relaxed">{c.insight}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

function HomePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('All');
    const [activeStatTab, setActiveStatTab] = React.useState('All');
    const [showCopyTooltip, setShowCopyTooltip] = React.useState(false);
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('yge0307@gmail.com');
        setShowCopyTooltip(true);
        setTimeout(() => setShowCopyTooltip(false), 2000);
    };

    const socials = [
        { href: 'https://github.com/ykgstar37-lab', title: 'GitHub', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg> },
        { href: '#', title: 'Email', onClick: handleCopyEmail, icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
        { href: 'https://www.notion.so/Portfolio-2c6bec2d3d51809ca4f2c7b1150ce12d?source=copy_link', title: 'Notion', icon: <SiNotion className="w-5 h-5" /> },
        { href: 'https://www.linkedin.com/in/%EA%B2%BD%EC%9D%80-%EC%9C%A4-7218b73b1/', title: 'LinkedIn', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> },
    ];

    return (
        <div className="bg-[#fafafa] min-h-screen text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ═══ NAV ═══ */}
            <motion.header
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-100/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center h-14 sm:h-16">
                    <div className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>YGE.</div>
                    <nav className="hidden md:flex gap-10 text-[13px] font-semibold text-gray-500 uppercase tracking-widest">
                        {['about', 'projects', 'experience', 'contact'].map(s => (
                            <a key={s} href={`#${s}`} className="hover:text-black transition-colors duration-300">{s}</a>
                        ))}
                    </nav>
                    {/* Mobile nav */}
                    <nav className="flex md:hidden gap-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        {['about', 'projects', 'experience', 'contact'].map(s => (
                            <a key={s} href={`#${s}`} className="hover:text-black transition-colors duration-300">{s}</a>
                        ))}
                    </nav>
                </div>
            </motion.header>

            {/* ═══ HERO ═══ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16 bg-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(0,0,0,0.02)_0%,transparent_60%)] pointer-events-none"></div>
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-10 sm:gap-16 lg:gap-24">
                        {/* Left */}
                        <div className="lg:w-1/2 space-y-6 sm:space-y-8">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex gap-8 sm:gap-12">
                                {[{ v: '+8', l: 'Tech Stacks' }, { v: '100%', l: 'Commitment' }].map((s, i) => (
                                    <div key={i}>
                                        <p className="text-2xl sm:text-4xl font-light text-gray-300">{s.v}</p>
                                        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-1 tracking-wider uppercase">{s.l}</p>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="text-[4rem] sm:text-[6rem] lg:text-[9rem] font-extrabold tracking-tighter leading-[0.85] select-none"
                                style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #1a1a1a 0%, #444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            >
                                Hello
                            </motion.h1>

                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-base sm:text-xl text-gray-600 font-medium">
                                — I'm <span className="text-black font-bold">Yoon Gyeongeun</span>, an AI Engineer
                            </motion.p>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex gap-2.5 sm:gap-3">
                                {socials.map((s, i) => (
                                    <a key={i} href={s.href} target={s.href !== '#' ? '_blank' : undefined} rel="noopener noreferrer"
                                        onClick={s.onClick ? (e) => { e.preventDefault(); s.onClick(); } : undefined}
                                        className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-[#e27500] hover:text-white hover:border-[#e27500] transition-all duration-300 hover:scale-110"
                                        title={s.title}>
                                        {s.icon}
                                    </a>
                                ))}
                                {showCopyTooltip && (
                                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="self-center text-xs font-bold text-green-600 ml-2">Copied!</motion.span>
                                )}
                            </motion.div>

                            {/* Portfolio & GitHub links */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex flex-wrap gap-3">
                                <a href="https://yge-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e27500] hover:bg-[#c96600] text-white text-sm font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-md shadow-[#e27500]/20">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    Portfolio
                                </a>
                                <a href="https://github.com/ykgstar37-lab/portfolio" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold rounded-full transition-all duration-300 hover:scale-105">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    GitHub
                                </a>
                            </motion.div>

                            <motion.div
                                className="hidden sm:flex items-center gap-2 text-gray-400 cursor-pointer mt-20 hover:text-black transition"
                                animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                                onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                            >
                                <span className="text-xs font-semibold tracking-widest uppercase">Scroll</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </motion.div>
                        </div>

                        {/* Right — Profile Photo */}
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="lg:w-1/2 flex justify-center">
                            <div className="relative rounded-3xl overflow-hidden max-w-xs sm:max-w-md w-full group cursor-pointer">
                                <img src={profileImg} alt="Yoon Gyeongeun" className="w-full h-full object-cover block" />
                                {/* Hover overlay - hidden on mobile (no hover) */}
                                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 hidden sm:flex flex-col justify-end p-8">
                                    <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                                        <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-900/10 text-gray-700 rounded-full uppercase tracking-widest">AI Engineer</span>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Gyeongeun Yoon</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">Building reliable AI serving systems with ML infrastructure</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Python', 'vLLM', 'FastAPI', 'Docker'].map(t => <span key={t} className="px-2.5 py-1 bg-gray-900/10 text-gray-600 text-[10px] font-bold rounded-md">{t}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* ═══ ABOUT ═══ */}
            <section id="about" className="py-16 sm:py-32 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left */}
                        <motion.div variants={fadeUp} className="lg:col-span-6 space-y-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">About Me</p>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Building<br /><span className="text-gray-400">Reliable</span> AI Systems
                                </h2>
                            </div>

                            {/* PDF Page 1 스타일: 2단락 자기소개 */}
                            <div className="space-y-4">
                                <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    <span className="font-bold text-gray-900">신뢰할 수 있는 AI 시스템을 설계하고 서빙하는 엔지니어입니다.</span>{' '}
                                    3개 프로젝트에서 모델 서빙 아키텍처를 설계하여 GARCH 모형의 수백ms 연산을 5분 TTL 캐싱으로 해결하고, vLLM 기반 sLLM 프라이빗 서빙으로 GPT API 의존을 제거했으며, 4중 Guardrail 설계로 판단 정확도를 37%→85%로 개선한 경험이 있습니다.
                                </p>
                                <p className="text-gray-500 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    <span className="font-bold text-gray-800">데이터로 판단하고, 구조로 해결합니다.</span>{' '}
                                    RAGAS로 병목을 "LLM"이 아닌 "embedding 품질"로 재정의하여 Precision을 0.83→0.97로 개선하고, 공통 LLM 모듈 설계로 provider 전환을 1줄로 단순화했습니다. 팀 프로젝트에서 기술 문서화와 코드 리뷰를 주도하며, 함께 성장하는 개발 문화를 만들어갑니다.
                                </p>
                            </div>

                            {/* PDF Page 1 스타일: 카테고리별 Skills */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Skills</h3>
                                {[
                                    { category: 'AI / ML', techs: ['Python', 'vLLM', 'LangGraph', 'LangChain', 'GARCH'], primary: true },
                                    { category: 'Backend', techs: ['FastAPI', 'Django', 'PostgreSQL', 'Qdrant'], primary: true },
                                    { category: 'Infra / DevOps', techs: ['Docker', 'AWS', 'Nginx', 'React'], primary: false },
                                ].map((group) => (
                                    <div key={group.category} className="flex items-start gap-3">
                                        <span className="text-[10px] font-bold text-[#e27500] w-24 shrink-0 pt-1.5 tracking-wide">{group.category}</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {group.techs.map(tech => (
                                                <motion.span key={tech} whileHover={{ scale: 1.08, y: -2 }}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition ${group.primary ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >{tech}</motion.span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Center */}
                        <motion.div variants={fadeUp} custom={1} className="lg:col-span-3 space-y-3">
                            <TiltCard className="bg-gradient-to-br from-[#1a1a1a] to-[#333333] p-6 rounded-2xl text-white">
                                <p className="text-4xl font-light mb-1">100%</p>
                                <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Dedication to<br />Reliable AI Serving</p>
                            </TiltCard>

                            <TiltCard className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <HiAcademicCap className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-base font-bold">가천대학교</h3>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">응용통계학과</p>
                                <p className="text-sm text-gray-400 font-medium">경영학과(복수전공)</p>
                                <p className="text-[11px] text-gray-400 mt-3 font-semibold">2020. 03 ~ 2026. 08</p>
                            </TiltCard>

                            <TiltCard className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <HiDesktopComputer className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-bold">SK네트웍스 Family AI Camp</h3>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">SKN 21기</p>
                                <p className="text-[11px] text-gray-400 mt-3 font-semibold">2025. 09 ~ 2026. 03</p>
                            </TiltCard>
                        </motion.div>

                        {/* Right */}
                        <motion.div variants={fadeUp} custom={2} className="lg:col-span-3 space-y-6">
                            <div className="hidden sm:block rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                                <img src={profileImg} className="w-full h-auto grayscale-[30%] hover:grayscale-0 transition duration-500" alt="Portrait" />
                            </div>
                            <div className="flex sm:block gap-4">
                                {/* Mobile: photo left column */}
                                <div className="sm:hidden w-36 flex-shrink-0 self-center">
                                    <div className="w-36 rounded-xl overflow-hidden shadow-sm">
                                        <img src={profileImg} className="w-full h-auto" alt="Portrait" />
                                    </div>
                                </div>
                                {/* Right column (or full width on desktop) */}
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wider uppercase">Core Strength</h3>
                                    {['Model Serving & Optimization', 'LLM/RAG System Design', 'Problem Solving', 'Statistical Thinking'].map((item, i) => (
                                        <motion.div key={i} whileHover={{ x: 4 }} className="flex items-center gap-3 py-2.5 cursor-default">
                                            <div className="w-6 h-6 rounded-full bg-[#e27500] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#e27500]/30">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══ AI & DEVELOPMENT ═══ */}
            <section id="projects" className="py-16 sm:py-32 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10 sm:mb-16">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">AI & Development</p>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Dev <span className="text-gray-300">Projects</span>
                        </h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex justify-center gap-2 mb-8 sm:mb-10">
                        {['All', 'Personal', 'Team'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 ${activeTab === tab ? 'bg-[#e27500] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400'}`}
                            >{tab}</button>
                        ))}
                    </motion.div>

                    <motion.div key={activeTab} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {(activeTab === 'All' ? DEV_PROJECTS : DEV_PROJECTS.filter(p => p.category === activeTab)).slice(0, 4).map((project, index) => (
                            <motion.div key={project.id} variants={fadeUp} custom={index}>
                                <ProjectCard project={project} navigate={navigate} />
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-8 sm:mt-12 text-center">
                        <button onClick={() => navigate('/projects')}
                            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full text-sm font-bold tracking-wider border border-gray-300 text-gray-600 hover:bg-[#e27500] hover:text-white hover:border-[#e27500] transition-all duration-300">
                            View All Projects <span className="text-base leading-none">&raquo;</span>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* ═══ STATISTICAL ANALYSIS ═══ */}
            <section className="py-16 sm:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10 sm:mb-16">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Statistics & Analysis</p>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Data <span className="text-gray-300">Research</span>
                        </h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex justify-center gap-2 mb-8 sm:mb-10">
                        {['All', 'Personal', 'Team'].map(tab => (
                            <button key={tab} onClick={() => setActiveStatTab(tab)}
                                className={`px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 ${activeStatTab === tab ? 'bg-[#e27500] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400'}`}
                            >{tab}</button>
                        ))}
                    </motion.div>

                    <motion.div key={activeStatTab} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {(activeStatTab === 'All' ? STAT_PROJECTS : STAT_PROJECTS.filter(p => p.category === activeStatTab)).map((project, index) => (
                            <motion.div key={project.id} variants={fadeUp} custom={index}>
                                <ProjectCard project={project} navigate={navigate} />
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-8 sm:mt-12 text-center">
                        <button onClick={() => navigate('/projects')}
                            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full text-sm font-bold tracking-wider border border-gray-300 text-gray-600 hover:bg-[#e27500] hover:text-white hover:border-[#e27500] transition-all duration-300">
                            View All Projects <span className="text-base leading-none">&raquo;</span>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* ═══ RESEARCH ═══ (hidden until blog posts are ready) */}
            <section id="research" className="hidden py-16 sm:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-10 sm:mb-16">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Study / Research</p>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Tech <span className="text-gray-300">Insights</span>
                        </h2>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { tag: 'TRANSFORMER', time: '10 min', title: 'Attention Is All You Need: 리서치 및 아키텍처 분석', color: 'from-[#333333] to-[#555]' },
                            { tag: 'DEVELOPMENT', time: '7 min', title: 'Django REST Framework 최적화 및 인증 시스템 구축', color: 'from-[#1a1a1a] to-[#444]' },
                            { tag: 'AI CAMP', time: '5 min', title: 'SK 네트웍스 Family AI Camp: 실전 인공지능 프로젝트 회고', color: 'from-[#222] to-[#333]' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp} custom={idx} className="group cursor-default">
                                <TiltCard className={`aspect-[4/3] bg-gradient-to-br ${item.color} rounded-3xl mb-4 sm:mb-6 relative overflow-hidden flex items-end p-5 sm:p-8`}>
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,white_0%,transparent_60%)]"></div>
                                    <span className="text-white/30 text-5xl sm:text-7xl font-bold absolute top-4 sm:top-6 right-6 sm:right-8" style={{ fontFamily: "'Syne', sans-serif" }}>0{idx + 1}</span>
                                    <span className="text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">{item.tag}</span>
                                </TiltCard>
                                <p className="text-[11px] font-bold text-gray-400 mb-2">{item.time} read</p>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors">{item.title}</h3>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══ PROBLEM SOLVING ═══ */}
            <ProblemSolvingSection />

            {/* ═══ CTA ═══ */}
            <section className="py-20 sm:py-40 bg-[#0a0a0a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_60%)]"></div>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10">
                    <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Every great idea shines brighter, <span className="text-gray-500">together.</span>
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto">
                        I'm confident in what we can create — let's team up and turn your vision into something we're both proud of.
                    </p>
                    <a href="mailto:yge0307@gmail.com"
                        className="inline-flex items-center gap-3 text-base sm:text-lg font-bold border-b-2 border-white pb-2 hover:text-gray-400 hover:border-gray-400 transition-all group">
                        Get In Touch
                        <svg className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-10 10M17 7H7M17 7v10" /></svg>
                    </a>
                </motion.div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer id="contact" className="bg-[#0a0a0a] text-white py-12 sm:py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 sm:gap-12">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            {['Home', 'About', 'Projects', 'Experience'].map((l, i) => (
                                <a key={i} href={i === 0 ? '#' : `#${l.toLowerCase()}`} className="hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/5">{l}</a>
                            ))}
                            <a href="https://blog.naver.com/yooonstar" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/5">Blog</a>
                        </div>
                        <div className="cursor-pointer" onClick={handleCopyEmail}>
                            <p className="text-3xl sm:text-4xl md:text-7xl font-light tracking-tighter hover:text-gray-500 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                                hello@yge
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-12 sm:mt-20 pt-8 border-t border-white/5 text-xs text-gray-600">
                        <p>Yoon Gyeongeun</p>
                        <div className="flex gap-3 sm:gap-4">
                            {socials.map((s, i) => (
                                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" onClick={s.onClick ? (e) => { e.preventDefault(); s.onClick(); } : undefined}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
            <ScrollToTop />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/crypto-volatility" element={<CryptoVolatility />} />
                <Route path="/projects/seoul-culture" element={<SeoulCulture />} />
                <Route path="/projects/pymate" element={<PyMate />} />
                <Route path="/projects/workflow-agent" element={<WorkFlowAgent />} />
                <Route path="/projects/crypto-vol-dashboard" element={<CryptoVolDashboard />} />
                <Route path="/projects/seoul-culture-map" element={<SeoulCultureMap />} />
            </Routes>
        </BrowserRouter>
    );
}
