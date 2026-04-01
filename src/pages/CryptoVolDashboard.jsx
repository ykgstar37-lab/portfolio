import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import SectionDotNav from '../components/SectionDotNav';

import cvMain from '../assets/cryptovol/cryptovol-main.png';
import cvDarkmode from '../assets/cryptovol/cryptovol-darkmode.png';
import cvSignal from '../assets/cryptovol/cryptovol-signal.png';
import cvPortfolio from '../assets/cryptovol/cryptovol-portfolio.png';
import cvFng from '../assets/cryptovol/cryptovol-fng.png';
import cvAi from '../assets/cryptovol/cryptovol-ai.png';
import cvCoinEth from '../assets/cryptovol/coin-switch-eth.gif';
import cvCoinSol from '../assets/cryptovol/coin-switch-sol.gif';
import cvDarkAi from '../assets/cryptovol/dark-ai-briefing.gif';
import cvPortSim from '../assets/cryptovol/portfolio-sim.gif';

const SCREENSHOTS = [
    { src: cvMain, label: '실시간 멀티코인 변동성 예측', desc: 'CoinGecko API + Binance WebSocket으로 실시간 가격을 수신하고 5개 GARCH 모형으로 변동성을 예측하는 메인 대시보드' },
    { src: cvCoinEth, label: 'BTC → ETH 코인 전환', desc: '상단 탭 클릭으로 BTC에서 ETH로 실시간 전환. 가격, 거래량, FNG 게이지, 차트가 즉시 갱신되는 멀티코인 대시보드' },
    { src: cvCoinSol, label: 'ETH → SOL 코인 전환', desc: 'ETH에서 SOL로 코인 전환 시 대시보드 전체가 해당 코인 데이터로 실시간 업데이트. 3개 코인 자유 전환 지원' },
    { src: cvDarkmode, label: '다크모드 + 예측 정확도 트래커', desc: 'KO/EN 다국어, 다크/라이트 테마 전환. 모형별 60일 롤링 RMSE를 시계열로 추적하고 최근 30일 기준 가장 정확한 모형을 실시간 랭킹' },
    { src: cvSignal, label: '매매 시그널 + 적중률 추적', desc: 'FNG + GARCH 변동성 + 모멘텀을 결합한 BUY / SELL / NEUTRAL 시그널. 60일 적중률 히스토리를 시각화하여 신뢰도를 검증' },
    { src: cvPortfolio, label: '포트폴리오 시뮬레이터', desc: 'Monte Carlo 1,000 시나리오 시뮬레이션. VaR(95%/99%), Sharpe Ratio, 코인별 리스크 분해와 상관행렬을 제공' },
    { src: cvPortSim, label: '포트폴리오 시뮬레이션', desc: 'Monte Carlo 1,000 시나리오 시뮬레이션 실행 과정. 코인별 비중 설정 후 VaR, Sharpe Ratio, 리스크 분해 결과를 시각화' },
    { src: cvFng, label: 'FNG 게이지 + 모형 상세', desc: 'FNG 실시간 게이지와 추이 차트. GARCH 모형 수식과 파라미터 상세 설명 및 모형별 예측 정확도 비교' },
    { src: cvAi, label: 'AI 시장 브리핑', desc: 'GPT-4o-mini 기반 일일 시장 분석. 날씨 비유, FNG 해석, 변동성 상태, 행동 추천을 AI 마스코트 말풍선으로 전달' },
    { src: cvDarkAi, label: '다크모드 + AI 브리핑', desc: '다크/라이트 테마 전환 애니메이션과 AI 마스코트의 시장 브리핑 인터랙션. GPT-4o-mini가 실시간 시장 상황을 분석' },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const PRIMARY = '#2b4fcb';

const FEATURES = [
    {
        title: '실시간 멀티코인 변동성 예측',
        desc: 'BTC / ETH / SOL 3개 코인을 지원. CoinGecko API + Binance WebSocket으로 실시간 가격을 수신하고 5개 GARCH 모형으로 변동성을 예측.',
        icon: '01',
    },
    {
        title: '매매 시그널 + 적중률 추적',
        desc: 'FNG + GARCH 변동성 + 모멘텀을 결합한 BUY / SELL / NEUTRAL 시그널. 60일 적중률 히스토리를 시각화하여 신뢰도를 검증.',
        icon: '02',
    },
    {
        title: '포트폴리오 시뮬레이터',
        desc: 'Monte Carlo 1,000 시나리오 시뮬레이션. VaR(95%/99%), Sharpe Ratio, 코인별 리스크 분해와 상관행렬을 제공.',
        icon: '03',
    },
    {
        title: '예측 정확도 트래커 + 리더보드',
        desc: '모형별 60일 롤링 RMSE를 시계열로 추적. 최근 30일 기준 가장 정확한 모형을 실시간 랭킹.',
        icon: '04',
    },
    {
        title: 'AI 시장 브리핑',
        desc: 'GPT-4o-mini 기반 일일 시장 분석. 날씨 비유, FNG 해석, 변동성 상태, 행동 추천을 AI 마스코트 말풍선으로 전달.',
        icon: '05',
    },
    {
        title: '인터랙티브 백테스트',
        desc: '날짜 범위를 선택하여 MSE, RMSE, MAE, MAPE, R² 성능 지표를 모형별로 비교. 최적 구간/모형 탐색.',
        icon: '06',
    },
    {
        title: 'FNG 게이지 + Price Alert',
        desc: 'FNG 실시간 게이지와 추이 차트. 가격 상한/하한 알림 설정 시 WebSocket으로 모니터링하여 Toast 알림.',
        icon: '07',
    },
    {
        title: '다크모드 + 다국어 + 리포트',
        desc: 'KO/EN i18n, 다크/라이트 테마, 대시보드 현황 텍스트 리포트 다운로드, 하단 플로팅 독 바.',
        icon: '08',
    },
];

const GARCH_MODELS = [
    {
        name: 'GARCH(1,1)',
        formula: 'σ²ₜ = ω + α·ε²ₜ₋₁ + β·σ²ₜ₋₁',
        desc: '기본 변동성 클러스터링 모형. 과거 충격(α)과 과거 변동성(β)의 가중합으로 현재 변동성을 추정.',
    },
    {
        name: 'EGARCH',
        formula: 'ln(σ²ₜ) = ω + α·g(zₜ₋₁) + β·ln(σ²ₜ₋₁)',
        desc: '지수(Exponential) GARCH. 로그 변환으로 양수 제약 없이 비대칭 효과(레버리지)를 포착.',
    },
    {
        name: 'GJR-GARCH',
        formula: 'σ²ₜ = ω + (α + γ·I)·ε²ₜ₋₁ + β·σ²ₜ₋₁',
        desc: '음의 충격(하락)에 더 큰 변동성을 부여하는 비대칭 모형. γ > 0이면 레버리지 효과 존재.',
    },
    {
        name: 'TGARCH',
        formula: 'σₜ = ω + α·|εₜ₋₁| + γ·|εₜ₋₁|·I + β·σₜ₋₁',
        desc: 'Threshold GARCH. 조건부 표준편차를 직접 모델링하여 비대칭 충격 반응을 포착.',
    },
    {
        name: 'FIGARCH',
        formula: 'σ²ₜ = ω + [1 − (1−βL)⁻¹·φ(L)·(1−L)^d]·ε²ₜ',
        desc: 'Fractionally Integrated GARCH. 장기 기억(Long Memory) 특성을 반영하여 변동성의 느린 감쇠를 모델링.',
    },
];

const ORIGIN_COMPARISON = [
    { category: '형태', team: 'Python 분석 스크립트', personal: 'Fullstack 웹 서비스' },
    { category: '데이터', team: 'CSV 정적 데이터', personal: 'CoinGecko API 실시간' },
    { category: '모델', team: 'Jupyter 수동 실행', personal: 'API 자동 서빙' },
    { category: '결과물', team: 'matplotlib 정적 차트', personal: 'React 인터랙티브 대시보드' },
    { category: '배포', team: 'Local 실행', personal: 'Render + Vercel' },
];

const TECH_STACK = {
    'Backend': ['FastAPI', 'SQLAlchemy', 'SQLite', 'APScheduler', 'httpx', 'arch', 'pandas', 'numpy', 'scipy'],
    'Frontend': ['React 19', 'Vite 8', 'Tailwind CSS v4', 'Recharts'],
    'API & Data': ['CoinGecko API', 'Binance WebSocket', 'OpenAI API (GPT-4o-mini)'],
    'Infra': ['Render', 'Vercel'],
};

const SECTIONS = [
    { id: 'problem', label: 'Problem' },
    { id: 'origin', label: 'Origin Story' },
    { id: 'decisions', label: 'Technical Decisions' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'features', label: 'Key Features' },
    { id: 'garch', label: '5 GARCH Models' },
    { id: 'tech', label: 'Tech Stack' },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
    { id: 'screenshots', label: 'Screenshots', highlight: true },
];

function ScreenshotGallery() {
    const [selected, setSelected] = useState(null);

    return (
        <motion.div id="screenshots" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Screenshots</h2>
            <p className="text-gray-500 mb-8">대시보드 주요 화면 미리보기</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCREENSHOTS.map((shot, idx) => (
                    <motion.div
                        key={idx}
                        variants={fadeInUp}
                        className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        onClick={() => setSelected(idx)}
                    >
                        <div className="aspect-video overflow-hidden bg-gray-50">
                            <img src={shot.src} alt={shot.label} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </div>
                        <div className="p-4">
                            <p className="text-sm font-bold text-gray-900 mb-1">{shot.label}</p>
                            <p className="text-xs text-gray-500">{shot.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selected !== null && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            className="relative max-w-5xl w-full"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src={SCREENSHOTS[selected].src} alt={SCREENSHOTS[selected].label} className="w-full rounded-xl shadow-2xl" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl p-6">
                                <p className="text-white font-bold text-lg">{SCREENSHOTS[selected].label}</p>
                                <p className="text-white/70 text-sm">{SCREENSHOTS[selected].desc}</p>
                            </div>
                            {/* Close */}
                            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            {/* Prev / Next */}
                            {selected > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); setSelected(selected - 1); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                            )}
                            {selected < SCREENSHOTS.length - 1 && (
                                <button onClick={(e) => { e.stopPropagation(); setSelected(selected + 1); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function CryptoVolDashboard() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

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
                        <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full tracking-wider uppercase">Personal</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Extended from Team Project</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2026.03 —</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        <span style={{ color: PRIMARY }}>CryptoVol</span> Dashboard
                    </h1>
                    <p className="text-xl font-semibold mb-6 tracking-tight" style={{ color: PRIMARY }}>
                        실시간 멀티코인(BTC/ETH/SOL) 변동성 예측 대시보드
                    </p>
                    <p className="text-lg text-gray-500 font-medium max-w-3xl leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
                        P학기 팀 프로젝트(GARCH 변동성 분석)를 개인 프로젝트로 확장하여 실서비스 배포. Python 분석 스크립트를 FastAPI + React 풀스택 웹 서비스로 발전시키고, CoinGecko API + Binance WebSocket 실시간 데이터 연동, 5개 GARCH 모형 자동 서빙, Monte Carlo 포트폴리오 시뮬레이터, GPT-4o-mini AI 시장 브리핑, 매매 시그널 적중률 추적 등 인터랙티브 대시보드를 구현.
                    </p>
                    <div className="flex gap-3">
                        <a href="https://github.com/ykgstar37-lab/crypto-volatility-dashboard" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-full transition" style={{ backgroundColor: PRIMARY }}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                            GitHub
                        </a>
                    </div>
                </motion.div>

                {/* Problem & Motivation */}
                <motion.div id="problem" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Problem</h2>
                    <p className="text-gray-500 mb-8">해결하려는 문제</p>
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border-l-4 shadow-sm" style={{ borderColor: PRIMARY }}>
                        <p className="text-lg font-bold text-gray-900 mb-4">
                            "통계 분석 결과가 Jupyter Notebook 안에 갇혀 있으면, 실시간 의사결정에 활용할 수 없다"
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            P학기 팀 프로젝트에서 GARCH 모형으로 비트코인 변동성을 분석했지만, CSV를 다운로드하고 Jupyter에서 수동 실행해야만 결과를 볼 수 있었습니다. 시장은 24시간 움직이는데, 분석은 항상 과거 데이터에 머물러 있었습니다.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'AS-IS', title: '정적 분석', desc: 'CSV 다운로드 → Jupyter 수동 실행 → matplotlib 정적 차트. 실행할 때마다 수 분 소요, 실시간 대응 불가', color: 'bg-red-50 text-red-700 border-red-200' },
                                { label: 'Gap', title: '분석 ≠ 서비스', desc: 'Jupyter에서 동작하는 코드가 API로 서빙되려면 에러 핸들링, 캐싱, 동시 요청 처리 등 완전히 다른 설계가 필요', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                                { label: 'TO-BE', title: '실시간 서비스', desc: '브라우저에서 실시간 가격 수신, 자동 변동성 예측, 매매 시그널 생성까지 — 분석 결과가 곧 서비스', color: 'bg-green-50 text-green-700 border-green-200' },
                            ].map((item, idx) => (
                                <div key={idx} className={`p-5 rounded-xl border ${item.color}`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{item.label}</span>
                                    <p className="text-sm font-bold mt-2 mb-2">{item.title}</p>
                                    <p className="text-xs leading-relaxed opacity-80">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Origin Story */}
                <motion.div id="origin" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Origin Story</h2>
                    <p className="text-gray-500 mb-8">P학기 팀 프로젝트에서 개인 프로젝트로의 확장</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Team Project</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Extension</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ORIGIN_COMPARISON.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-semibold text-gray-700">{row.category}</td>
                                        <td className="py-3 px-4 text-gray-500">{row.team}</td>
                                        <td className="py-3 px-4 font-semibold" style={{ color: PRIMARY }}>{row.personal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Technical Decisions */}
                <motion.div id="decisions" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Technical Decisions</h2>
                    <p className="text-gray-500 mb-8">왜 이 기술을 선택했는가</p>
                    <div className="space-y-4">
                        {[
                            {
                                question: 'WebSocket 릴레이 서버를 왜 직접 구현했는가?',
                                answer: '프론트엔드에서 Binance에 직접 연결하면 CORS 차단과 API 키 노출 문제가 발생합니다. FastAPI WebSocket 엔드포인트가 Binance 스트림을 수신하고 Set 기반 클라이언트 추적으로 브라우저에 브로드캐스트하는 릴레이 구조를 설계했습니다.',
                                tag: '보안 + 아키텍처'
                            },
                            {
                                question: 'GARCH 모형을 매 요청마다 적합(fit)하지 않은 이유는?',
                                answer: 'arch 라이브러리의 적합은 수십~수백ms가 걸립니다. 인메모리 캐싱(5분 TTL)으로 반복 호출을 방지하고, 120일 윈도우로 입력을 제한하여 응답 속도를 확보했습니다. 개별 모형 실패 시 0.0을 반환하여 하나의 모형 실패가 전체 응답을 깨뜨리지 않도록 했습니다.',
                                tag: '성능 + 안정성'
                            },
                            {
                                question: '코인 전환 시 API 호출을 어떻게 최적화했는가?',
                                answer: 'BTC→ETH 전환 시 가격, 차트, 변동성, 시그널, 리더보드 등 전체 데이터가 갱신되어야 합니다. Promise.all로 API 호출을 병렬화하고, 5분 TTL 인메모리 캐시로 GARCH 재계산을 방지하여 체감 전환 속도를 확보했습니다.',
                                tag: '사용자 경험'
                            },
                            {
                                question: '5개 모형 중 "최적 모형"을 고정하지 않은 이유는?',
                                answer: '시장 구간마다 최적 모형이 달라집니다. 모형을 하나로 고정하는 대신, 60일 롤링 RMSE로 실시간 리더보드를 운영하고 백테스트로 구간별 최적 모형을 탐색할 수 있게 했습니다. 모형의 한계를 투명하게 보여주는 것도 설계라는 판단이었습니다.',
                                tag: '도메인 설계'
                            },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: PRIMARY }}>Q</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <p className="text-base font-bold text-gray-900">{item.question}</p>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY }}>{item.tag}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Overview Stats */}
                <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                    {[
                        { label: 'Models', value: '5', sub: 'GARCH / EGARCH / GJR / TGARCH / FIGARCH' },
                        { label: 'API Endpoints', value: '14', sub: '13 REST + 1 WebSocket' },
                        { label: 'Coins', value: '3', sub: 'BTC / ETH / SOL 멀티코인' },
                        { label: 'i18n', value: 'KO / EN', sub: '한국어·영어 다국어 지원' },
                    ].map((item, idx) => (
                        <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
                            <p className="text-xs font-medium text-gray-500">{item.sub}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Architecture */}
                <motion.div id="architecture" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Architecture</h2>
                    <p className="text-gray-500 mb-8">CoinGecko + Binance WebSocket 기반 실시간 멀티코인 변동성 예측 파이프라인</p>
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-3">
                        {/* Data Sources */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {[
                                { name: 'Binance WebSocket', desc: 'BTC/ETH/SOL ticks' },
                                { name: 'CoinGecko API', desc: '시세 데이터' },
                                { name: 'OpenAI API', desc: 'GPT-4o-mini' },
                            ].map((s, i) => (
                                <div key={i} className="flex-1 min-w-[120px] max-w-[180px] px-4 py-3 bg-gray-100 rounded-xl text-center">
                                    <p className="text-xs font-bold text-gray-700">{s.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* FastAPI Backend */}
                        <div className="flex justify-center">
                            <div className="px-6 py-4 bg-[#e27500] rounded-xl text-white text-center max-w-lg w-full">
                                <p className="text-sm font-bold">FastAPI Backend</p>
                                <p className="text-xs text-white/70 mt-1">14 Endpoints (13 REST + 1 WebSocket)</p>
                            </div>
                        </div>

                        {/* Backend Modules */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {[
                                { name: 'APScheduler', desc: '자동 수집' },
                                { name: 'GARCH (5)', desc: 'arch library' },
                                { name: 'Monte Carlo', desc: 'Portfolio Sim' },
                            ].map((m, i) => (
                                <div key={i} className="flex-1 min-w-[120px] max-w-[160px] px-4 py-3 bg-[#e27500]/10 border border-[#e27500]/30 rounded-xl text-center">
                                    <p className="text-xs font-bold text-[#c96600]">{m.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Storage */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {[
                                { name: 'SQLite', desc: '시세 DB' },
                                { name: 'Risk Score', desc: 'FNG+Vol+Mom' },
                                { name: 'VaR / Sharpe', desc: '상관행렬' },
                            ].map((m, i) => (
                                <div key={i} className="flex-1 min-w-[120px] max-w-[160px] px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                                    <p className="text-xs font-bold text-amber-700">{m.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* React Dashboard */}
                        <div className="flex justify-center">
                            <div className="px-6 py-5 bg-gray-900 rounded-xl text-white text-center max-w-lg w-full">
                                <p className="text-sm font-bold mb-2">React Dashboard (Vite + Tailwind)</p>
                                <div className="grid grid-cols-4 gap-2 text-[10px]">
                                    {['변동성차트', '매매시그널', '리더보드', '포트폴리오', '백테스트', 'FNG 게이지', 'AI 브리핑', '정확도추적'].map((f, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/10 rounded">{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-4 bg-gray-300"></div></div>

                        {/* Infra */}
                        <div className="flex justify-center gap-3">
                            <div className="px-4 py-2 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">Render (Backend)</div>
                            <div className="px-4 py-2 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">Vercel (Frontend)</div>
                        </div>
                    </div>
                </motion.div>

                {/* Key Features */}
                <motion.div id="features" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Key Features</h2>
                    <p className="text-gray-500 mb-8">8가지 핵심 기능</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((feature, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #1a3a9e)` }}>
                                        {feature.icon}
                                    </div>
                                    <p className="text-base font-bold text-gray-900">{feature.title}</p>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 5 GARCH Models */}
                <motion.div id="garch" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>5 GARCH Models</h2>
                    <p className="text-gray-500 mb-8">BTC / ETH / SOL 변동성 예측에 사용되는 5가지 GARCH 변형 모형</p>
                    <div className="space-y-4">
                        {GARCH_MODELS.map((model, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <div className="flex items-center gap-3 md:w-48 shrink-0">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: PRIMARY }}>
                                            {idx + 1}
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{model.name}</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg px-4 py-2 mb-3 inline-block">
                                            <code className="text-sm font-mono" style={{ color: PRIMARY }}>{model.formula}</code>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{model.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Tech Stack */}
                <motion.div id="tech" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Tech Stack</h2>
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
                </motion.div>

                {/* Retrospective */}
                <motion.div id="retrospective" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Retrospective</h2>
                    <p className="text-gray-500 mb-6">프로젝트를 마치며</p>
                    <div className="space-y-4">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: PRIMARY }}>핵심 인사이트</p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                P학기 팀 분석 프로젝트를 풀스택 서비스로 확장하면서, <span className="font-semibold text-gray-900">분석 코드와 서비스 코드의 설계 관점 차이</span>를 실감했습니다. Jupyter에서 동작하던 GARCH 모형을 API로 서빙하려면 에러 핸들링, 스케줄링, 캐싱 등 분석에서는 고려하지 않았던 요소들이 필요했고, 이 경험이 "분석할 수 있다"와 <span className="font-semibold text-gray-900">"서비스를 만들 수 있다"의 간극</span>을 이해하는 계기가 되었습니다.
                            </p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">01</span>
                                    <span><strong className="text-gray-900">WebSocket의 생명주기 관리</strong> — REST와 다른 사고방식. 연결 수립, 끊김 복구, 클라이언트 추적 등 상태 관리의 복잡성을 처음 경험</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">02</span>
                                    <span><strong className="text-gray-900">모형의 한계를 설계에 반영</strong> — 5개 모형이 동시에 틀리는 상황을 보며, "최적 모형 하나를 선택"하는 대신 "모형의 불확실성을 투명하게 보여주는 것"이 더 나은 설계라는 판단</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">03</span>
                                    <span><strong className="text-gray-900">프로덕션 품질의 기준</strong> — 테스트, CI/CD, 모니터링 등 로컬에서 잘 돌아가는 것과 서비스로서 안정적인 것의 차이를 체감</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>테스트 커버리지 부족 — GARCH 서빙 로직에 대한 단위 테스트를 작성하지 못함</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>CoinGecko 무료 API의 rate limit(30 req/min) 제약 — 유료 플랜 없이 캐싱으로 우회했지만, 데이터 신선도와의 트레이드오프가 존재</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>TypeScript 미도입 — 런타임 타입 에러가 간헐적으로 발생, 다음 프로젝트에서는 TS 도입 필요성을 체감</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Screenshots Gallery */}
                <ScreenshotGallery />

            </div>
            <ScrollToTop />
            <SectionDotNav sections={SECTIONS} />
            <FloatingNav />
        </div>
    );
}
