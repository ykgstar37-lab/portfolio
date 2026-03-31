import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { SiNotion } from 'react-icons/si';
import { HiAcademicCap, HiDesktopComputer } from 'react-icons/hi';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import profileImg from './assets/profile.jpg';
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
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{project.description}</p>
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
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>
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
                            <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#e27500] text-white transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H9M17 7v8" /></svg>
                                <span className="text-[10px] font-bold">Detail</span>
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
    { id: '01', title: 'CryptoVol Dashboard', category: 'Personal', domain: 'Dev', date: '2026.03 —', description: 'P학기 GARCH 팀 프로젝트를 확장한 실시간 멀티코인(BTC/ETH/SOL) 변동성 예측 풀스택 대시보드. 5개 GARCH 모형, Monte Carlo 포트폴리오 시뮬레이터, AI 시장 브리핑, 매매 시그널 적중률 추적, 인터랙티브 백테스트 포함.', tech: ['FastAPI', 'React', 'GARCH', 'Binance WS', 'OpenAI'], github: 'https://github.com/ykgstar37-lab/crypto-volatility-dashboard', link: '/projects/crypto-vol-dashboard', thumbnail: thumbCryptoVol, badge: 'Personal' },
    { id: '02', title: 'Seoul Culture Map', category: 'Personal', domain: 'Dev', date: '2026.03 —', description: '학술제 팀 프로젝트(서울시 문화시설 분석)를 확장한 인터랙티브 문화시설 탐색 맵. Leaflet 지도 위 2,500+ 시설 탐색, K-means 군집분석, 관광 목적별 AI 코스 추천 포함.', tech: ['FastAPI', 'React', 'Leaflet', 'scikit-learn', 'OpenAI'], github: 'https://github.com/ykgstar37-lab/seoul-culture-map', link: '/projects/seoul-culture-map', thumbnail: thumbSeoulCulture, badge: 'Personal' },
    { id: '03', title: 'WorkFlow Agent (듀듀)', category: 'Team', domain: 'Dev', date: '2026.02 — 2026.03', description: 'LangGraph 기반 멀티 Agent 시스템으로, 사내 규정 판단·문서 처리·일정 관리를 자연어로 통합 자동화하는 프라이빗 AI 어시스턴트', tech: ['LangGraph', 'Kanana-1.5-8B', 'FastAPI', 'React'], github: 'https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN21-FINAL-3TEAM', link: '/projects/workflow-agent', thumbnail: thumbWorkflow, badge: 'Team' },
    { id: '04', title: 'PyMate — Bootcamp AI RAG Tutor', category: 'Team', domain: 'Dev', date: '2026.01 — 2026.02', description: '부트캠프 강의 자료와 Python 공식 문서 기반 RAG AI 학습 튜터. Flask MVP에서 Django 프로덕션까지 확장하고 AWS에 배포했습니다.', tech: ['Django', 'LangChain', 'Qdrant', 'AWS'], github: 'https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN21-4th-4Team', link: '/projects/pymate', thumbnail: thumbPymate, badge: 'Team' },
    { id: '05', title: '암호화폐 변동성 비교 및 분석: GARCH 모델 기반 예측', category: 'Team', domain: 'Data', date: '2023.12 — 2024.01', description: 'GARCH, TGARCH, HAR-GARCH, HAR-TGARCH, HAR-TGARCH-X 5개 모형을 비교하여 비트코인 변동성 최적 예측 모형을 탐색했습니다.', tech: ['Python', 'GARCH', 'HAR'], github: 'https://github.com/ykgstar37-lab/crypto-volatility-dashboard', link: '/projects/crypto-volatility', thumbnail: thumbCrypto, badge: 'Team' },
    { id: '06', title: '외국인에게 관광목적에 맞는 지역구 제안', category: 'Team', domain: 'Data', date: '2023.09 — 2023.11', award: '2nd Place', description: '서울특별시 25개 자치구의 관광 시설 현황을 조사·분석하고 군집분석을 통해 관광 목적에 맞는 지역구를 제안했습니다.', tech: ['R', 'dplyr', '공공데이터'], github: 'https://github.com/ykgstar37-lab', link: '/projects/seoul-culture', thumbnail: thumbSeoul, badge: 'Team' },
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
        title: '분석 코드를 실시간 API로 전환하며 서비스 관점의 설계를 체득',
        problem: 'Jupyter에서 수동 실행하던 GARCH 변동성 예측 모형을 API로 서빙하려니, 적합(fit) 연산이 수백ms — 동시 요청 시 응답 지연 발생. 프론트엔드에서 Binance WebSocket 직접 연결 시 CORS 차단과 API 키 노출 문제.',
        solutions: [
            '5분 TTL 인메모리 캐싱 + 120일 윈도우 제한으로 GARCH 재계산 방지. 개별 모형 실패 시 0.0 반환으로 에러 격리',
            'FastAPI WebSocket 릴레이 서버 구현 — Set 기반 클라이언트 추적으로 Binance 스트림을 브라우저에 브로드캐스트',
            '코인 전환 시 Promise.all로 API 호출 병렬화하여 체감 전환 속도 확보',
        ],
        results: [
            { label: 'Endpoints', value: '14 REST + 1 WS' },
            { label: 'Coins', value: 'BTC / ETH / SOL' },
            { label: 'Deploy', value: 'Render + Vercel' },
        ],
        insight: '"분석할 수 있다"와 "API로 서빙할 수 있다"는 완전히 다른 설계 관점이 필요하다는 것을 체감',
        keywords: ['#캐싱전략', '#WebSocket', '#실시간시스템', '#에러격리'],
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
            { label: 'Infra', value: 'AWS 배포 안정화' },
        ],
        insight: '"기능을 더 만드는 것"보다 "구조를 바꾸는 것"이 서비스 품질에 더 큰 영향을 준다는 판단 기준을 획득',
        keywords: ['#프레임워크마이그레이션', '#인프라설계', '#RAG품질', '#배포안정화'],
    },
    {
        id: 'guardrail',
        num: '03',
        tag: 'WorkFlow Agent',
        tagColor: '#e27500',
        title: 'LLM 출력을 맹신하지 않는 서버 검증 시스템 설계',
        problem: 'sLLM(Kanana-1.5-8B)이 confidence 0.95를 출력해도 존재하지 않는 조항을 인용(환각)하거나 오답을 반환. 기본 판단 정확도 37.2%. LoRA v2에서 98건 추가 보강 시 오히려 -3.2%p 하락 — 라벨 오염.',
        solutions: [
            '4중 Guardrail — 키워드 매칭(0~1.0), 조항 존재 검증(환각 플래그), 카테고리 제한, 일관성 모니터링(500건 FIFO 캐싱)',
            '5-factor Confidence 보정 공식으로 LLM 과신 보정 (Hard Cap: RAG 품질 < 0.2 → max 0.4)',
            'LoRA v3 — 19건만 약점(재량 표현 14 + 경계 케이스 5)을 정밀 타겟팅하여 회복',
        ],
        results: [
            { label: '판단 정확도', value: '37% → 85%' },
            { label: 'JSON 유효율', value: '70% → 97%' },
            { label: 'RAG MRR', value: '0.63 → 0.95' },
        ],
        insight: '"데이터 양 < 데이터 질" — 98건 무작위 추가보다 19건 정밀 타겟팅이 효과적. LLM 서비스에서 서버 단 검증이 핵심',
        keywords: ['#LLM신뢰성', '#Guardrail', '#데이터품질', '#파인튜닝'],
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
                                — I'm <span className="text-black font-bold">Yoon Gyeongeun</span>, a Server Developer
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
                                        <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-900/10 text-gray-700 rounded-full uppercase tracking-widest">Server Developer</span>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Gyeongeun Yoon</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">Building reliable server systems with statistical thinking</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Python', 'FastAPI', 'PostgreSQL', 'Redis'].map(t => <span key={t} className="px-2.5 py-1 bg-gray-900/10 text-gray-600 text-[10px] font-bold rounded-md">{t}</span>)}
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
                        <motion.div variants={fadeUp} className="lg:col-span-5 space-y-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">About Me</p>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                    Building<br /><span className="text-gray-400">Reliable</span> Servers
                                </h2>
                            </div>
                            <p className="text-gray-500 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                응용통계학과에서 가설 검정, 회귀분석, 시계열 분석 등 데이터 기반 의사결정의 기초를 다지고, AI Camp에서 현직자분들과 LLM·RAG 기반 실전 프로젝트를 경험하며 서버 개발자로 성장했습니다. 통계 모형(GARCH, K-means)을 직접 API로 서빙한 경험이 있어, 모형의 불확실성을 이해하고 이를 서버 설계(캐싱, 에러 격리, 검증 시스템)로 보완할 수 있습니다.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'SQLAlchemy', 'React'].map(tech => (
                                    <motion.span key={tech} whileHover={{ scale: 1.08, y: -2 }}
                                        className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition ${['Python', 'FastAPI', 'PostgreSQL', 'Redis'].includes(tech) ? 'bg-[#e27500] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >{tech}</motion.span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Center */}
                        <motion.div variants={fadeUp} custom={1} className="lg:col-span-4 space-y-4">
                            <TiltCard className="bg-gradient-to-br from-[#1a1a1a] to-[#333333] p-8 rounded-3xl text-white">
                                <p className="text-5xl font-light mb-2">100%</p>
                                <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Dedication to<br />Stable Systems</p>
                            </TiltCard>

                            <TiltCard className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <HiAcademicCap className="w-6 h-6 text-gray-400" />
                                    <h3 className="text-lg font-bold">가천대학교</h3>
                                </div>
                                <p className="text-gray-700 font-medium">응용통계학과</p>
                                <p className="text-gray-400 font-medium">경영학과(복수전공)</p>
                                <p className="text-xs text-gray-400 mt-4 font-semibold">2020. 03 ~ 2026. 08</p>
                            </TiltCard>

                            <TiltCard className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <HiDesktopComputer className="w-6 h-6 text-gray-400" />
                                    <h3 className="text-lg font-bold">SK네트웍스 Family AI Camp</h3>
                                </div>
                                <p className="text-gray-700 font-medium">SKN 21기</p>
                                <p className="text-xs text-gray-400 mt-4 font-semibold">2025. 09 ~ 2026. 03</p>
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
                                    {['Problem Solving', 'API & Server Design', 'Data Pipeline', 'Statistical Thinking'].map((item, i) => (
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
