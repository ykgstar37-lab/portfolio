import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import TechnicalDrawer from '../components/TechnicalDrawer';
import SectionDotNav from '../components/SectionDotNav';
import ProjectFlowSection from '../components/ProjectFlowSection';

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
    { src: cvMain, label: '실시간 멀티코인 변동성 예측', desc: 'CoinGecko API + Binance WebSocket으로 실시간 가격을 수신하고 6개 GARCH 모형으로 변동성을 예측하는 메인 대시보드' },
    { src: cvCoinEth, label: 'BTC → ETH 코인 전환', desc: '상단 탭 클릭으로 BTC에서 ETH로 실시간 전환. 가격, 거래량, FNG 게이지, 차트가 즉시 갱신되는 멀티코인 대시보드' },
    { src: cvCoinSol, label: 'ETH → SOL 코인 전환', desc: 'ETH에서 SOL로 코인 전환 시 대시보드 전체가 해당 코인 데이터로 실시간 업데이트. 3개 코인 자유 전환 지원' },
    { src: cvDarkmode, label: '다크모드 + 예측 정확도 트래커', desc: 'KO/EN 다국어, 다크/라이트 테마 전환. 모형별 60일 롤링 RMSE를 시계열로 추적하고 최근 30일 기준 가장 정확한 모형을 실시간 랭킹' },
    { src: cvSignal, label: '매매 시그널 + 적중률 추적', desc: 'FNG + GARCH 변동성 + 모멘텀을 결합한 BUY / SELL / NEUTRAL 시그널. 60일 적중률 히스토리를 시각화하여 신뢰도를 검증' },
    { src: cvPortfolio, label: '포트폴리오 시뮬레이터', desc: 'Monte Carlo 10,000 시나리오 시뮬레이션. VaR(95%/99%), Sharpe Ratio, 코인별 리스크 분해와 상관행렬을 제공' },
    { src: cvPortSim, label: '포트폴리오 시뮬레이션', desc: 'Monte Carlo 10,000 시나리오 시뮬레이션 실행 과정. 코인별 비중 설정 후 VaR, Sharpe Ratio, 리스크 분해 결과를 시각화' },
    { src: cvFng, label: 'FNG 게이지 + 모형 상세', desc: 'FNG 실시간 게이지와 추이 차트. GARCH 모형 수식과 파라미터 상세 설명 및 모형별 예측 정확도 비교' },
    { src: cvAi, label: 'AI 시장 브리핑', desc: 'GPT-4o-mini 기반 일일 시장 분석. 날씨 비유, FNG 해석, 변동성 상태, 행동 추천을 AI 마스코트 말풍선으로 전달' },
    { src: cvDarkAi, label: '다크모드 + AI 브리핑', desc: '다크/라이트 테마 전환 애니메이션과 AI 마스코트의 시장 브리핑 인터랙션. GPT-4o-mini가 실시간 시장 상황을 분석' },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const PRIMARY = '#2b4fcb';

const CRYPTO_VOL_DASHBOARD_CHARTS = [
    {
        title: '시스템 아키텍처',
        description: '실시간 시세 수집, 변동성 모델 계산, 캐싱, React 대시보드 렌더링의 서비스 구조',
        chart: String.raw`flowchart LR
    subgraph External["Market / External APIs"]
        Binance["Binance WebSocket<br/>실시간 가격"]
        CoinGecko["CoinGecko API<br/>과거 가격 · 메타데이터"]
        FNG["Fear & Greed API"]
        OpenAI["OpenAI GPT-4o-mini"]
    end

    subgraph Backend["FastAPI Backend"]
        WSRelay["WebSocket Relay"]
        REST["REST API<br/>13 endpoints"]
        Limiter["Rate Limiter<br/>IP 슬라이딩 윈도우<br/>5 · 10 req / 60s"]
        Scheduler["APScheduler<br/>주기 갱신"]
        Cache["5min TTL Cache"]
        DB[("PostgreSQL<br/>SQLAlchemy + Alembic")]
    end

    subgraph Model["Model Layer"]
        GARCH["5 GARCH Models<br/>GARCH(1,1) · TGARCH · HAR-GARCH<br/>HAR-TGARCH · HAR-TGARCH-X<br/>모형별 예외 격리"]
        Accuracy["60일 롤링 윈도우 적합<br/>Rolling RMSE 리더보드"]
        MonteCarlo["Monte Carlo<br/>10,000 scenarios"]
        Signal["FNG + Volatility + Momentum<br/>Trading Signal"]
    end

    subgraph Frontend["React Dashboard"]
        Chart["Volatility Chart"]
        Portfolio["Portfolio Simulator"]
        Briefing["AI Market Briefing"]
        Alert["Price Alert / Report"]
    end

    Binance --> WSRelay
    CoinGecko --> REST
    FNG --> REST
    REST --> Limiter
    Limiter --> Cache
    Scheduler --> Cache
    Scheduler --> DB
    REST --> DB
    DB --> GARCH
    Cache --> GARCH
    Cache --> Accuracy
    GARCH --> Signal
    GARCH --> MonteCarlo
    OpenAI --> Briefing
    WSRelay --> Frontend
    REST --> Frontend
    Model --> Frontend
    Frontend --> Chart
    Frontend --> Portfolio
    Frontend --> Briefing
    Frontend --> Alert

    style External fill:#fef3c7,stroke:#f59e0b
    style Backend fill:#dbeafe,stroke:#3b82f6
    style Model fill:#dcfce7,stroke:#22c55e
    style Frontend fill:#f3e8ff,stroke:#a855f7`,
    },
];

const FEATURES = [
    {
        title: '실시간 멀티코인 변동성 예측',
        desc: 'Jupyter에서 수동 실행해야 했던 GARCH 적합을 API로 자동화. Binance WebSocket 릴레이로 실시간 시세를 수신하고, 6개 모형의 적합 결과를 5분 TTL 캐싱하여 수백ms 연산 비용 해결.',
        icon: '01',
    },
    {
        title: '매매 시그널 + 적중률 추적',
        desc: 'FNG + GARCH 변동성 + 모멘텀 3요소를 결합한 시그널 생성. 단순 "BUY/SELL"이 아니라 60일 적중률 히스토리를 시계열로 추적하여, 사용자가 시그널의 신뢰도를 직접 검증 가능.',
        icon: '02',
    },
    {
        title: '포트폴리오 시뮬레이터',
        desc: '초기 1,000 시나리오에서 99% VaR 꼬리 분포가 불안정한 문제 발견 → 10,000 시나리오로 확장하여 분포 안정성 확보. VaR(95%/99%), Sharpe Ratio, 코인별 리스크 분해 제공.',
        icon: '03',
    },
    {
        title: '예측 정확도 리더보드',
        desc: '시장 구간마다 최적 모형이 달라지는 문제를 해결하기 위해, 60일 롤링 RMSE로 6개 모형을 실시간 랭킹. 모형을 하나로 고정하지 않고 투명하게 비교.',
        icon: '04',
    },
    {
        title: 'AI 시장 브리핑',
        desc: '정량 데이터만으로는 시장 상황 해석이 어려운 초보 투자자를 위해, GPT-4o-mini가 FNG 해석 + 변동성 상태 + 행동 추천을 자연어로 전달. Rate Limiting 5req/60s로 API 비용 통제.',
        icon: '05',
    },
    {
        title: '인터랙티브 백테스트',
        desc: '과거 구간에서 어떤 모형이 가장 정확했는지를 검증할 수 없는 문제 → 날짜 범위를 선택하여 MSE, RMSE, MAE, MAPE, R² 5개 지표로 모형별 비교. 구간별 최적 모형 탐색 가능.',
        icon: '06',
    },
    {
        title: 'FNG 게이지 + Price Alert',
        desc: '시장 심리(FNG)를 실시간 게이지로 시각화. 가격 상한/하한 도달 시 WebSocket 기반 Toast 알림으로 즉시 인지.',
        icon: '07',
    },
    {
        title: '다크모드 + 다국어 + 리포트',
        desc: 'KO/EN i18n으로 글로벌 사용자 대응, 다크/라이트 테마, 대시보드 현황 텍스트 리포트 다운로드 기능.',
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
        name: 'TGARCH',
        formula: 'σₜ = ω + α·|εₜ₋₁| + γ·|εₜ₋₁|·I + β·σₜ₋₁',
        desc: 'Threshold GARCH. 조건부 표준편차를 직접 모델링하여 비대칭 충격 반응을 포착.',
    },
    {
        name: 'GARCH+E.V',
        formula: 'σ²ₜ = ω + α·ε²ₜ₋₁ + β·σ²ₜ₋₁ + c·xₜ',
        desc: 'GARCH(1,1)에 외생변수(거래량, FNG)를 추가. 논문 Table 7에서 원자료 유실로 공란이던 행으로, 이번 구현에서 추정치를 산출했다.',
    },
    {
        name: 'HAR-GARCH',
        formula: 'σ²ₜ = ω + α·RV₁ + β·RV₇ + γ·RV₃₀ + GARCH(1,1)',
        desc: 'HAR(Heterogeneous Autoregressive) 구조로 1일/7일/30일 Realized Volatility를 다중 시간 스케일로 반영. 단기 트레이더와 장기 투자자의 변동성 인식 차이를 모형에 내재화.',
    },
    {
        name: 'HAR-TGARCH',
        formula: 'σₜ = ω + α·RV₁ + β·RV₇ + γ·RV₃₀ + TGARCH',
        desc: 'HAR 다중 스케일 구조에 TGARCH의 비대칭 충격 반응을 결합. 하락장에서 변동성이 더 크게 반응하는 현상을 다중 시간 스케일과 함께 포착.',
    },
    {
        name: 'HAR-TGARCH-X',
        formula: 'σₜ = HAR-TGARCH + δ₁·Volume + δ₂·FNG',
        desc: '외생변수(거래량, FNG)를 표준화해 mean equation에 주입. 논문이 수식만 남기고 추정치를 내지 못한 모형으로, 이번에 실제 적합에 성공했다. 논문 §3.1은 분산식에 넣도록 정의하지만 arch 패키지가 분산식 외생변수를 지원하지 않아 평균식에 넣었다.',
    },
];


const ORIGIN_COMPARISON = [
    { category: '인원', team: '3인 팀 (학술제)', personal: '단독' },
    { category: '모형', team: '3개 적합 완료 (GARCH, TGARCH, TGARCH+E.V). HAR 계열과 GARCH+E.V는 수식만 서술, Table 7 공란', personal: '6개 전부 적합. 공란이던 GARCH+E.V와 미구현 HAR 계열 3종을 실제 구현' },
    { category: '데이터', team: 'investing.com CSV 2,129일(2018.02~2023.11), 정적', personal: 'CoinGecko 백필 365일 + 일일 크론 + Binance WebSocket 실시간 틱' },
    { category: '대상', team: 'BTC 1종', personal: 'BTC / ETH / SOL 3종' },
    { category: '실행', team: '스크립트 1회 실행 후 표 추출', personal: 'FastAPI 14 REST + 1 WebSocket, 5분 TTL 캐싱으로 상시 서빙' },
    { category: '검증', team: '본문 서술 수치(R², 상관계수) — 뒷받침 표 유실로 재현 불가', personal: '/api/volatility/factors 에서 매 요청 재계산' },
    { category: '배포', team: '로컬 실행', personal: 'Render(API) + Vercel(Web) + Neon(PostgreSQL) 운영 중' },
];

// 논문의 핵심 주장을 현재 데이터로 다시 계산한 결과.
// 인용이 아니라 /api/volatility/factors 가 매 요청 산출하는 값이다.
const PAPER_VERIFICATION = {
    paperPeriod: '2018.02 ~ 2023.11 (2,129일, investing.com)',
    livePeriod: '2025.09 ~ 2026.09 (364일, CoinGecko)',
    rows: [
        { factor: 'FNG', target: '수익률', paper: '0.72', live: '0.2184', p: '2.6e-05', verdict: 'weaker' },
        { factor: 'FNG', target: '실현변동성', paper: '—', live: '-0.2868', p: '3.3e-08', verdict: 'new' },
        { factor: '거래량', target: '절대수익률', paper: '유의한 양(+)', live: '0.5198', p: '1.4e-26', verdict: 'stronger' },
        { factor: '거래량', target: '실현변동성', paper: '—', live: '0.3514', p: '7.6e-12', verdict: 'new' },
    ],
};

const TECH_STACK = {
    'Backend': ['FastAPI', 'SQLAlchemy', 'SQLite', 'PostgreSQL', 'Alembic', 'websockets', 'APScheduler', 'httpx', 'arch', 'pandas', 'numpy', 'scipy'],
    'Frontend': ['React 19', 'Vite 6', 'Tailwind CSS v4', 'Recharts'],
    'API & Data': ['CoinGecko API', 'Binance WebSocket', 'OpenAI API (GPT-4o-mini)'],
    'Infra': ['Docker Compose', 'Nginx'],
};

const SECTIONS = [
    { id: 'goal', label: 'Goal' },
    { id: 'problem', label: 'Problem' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'origin', label: 'Origin Story' },
    { id: 'verification', label: 'Paper Verification', highlight: true },
    { id: 'paper', label: 'Source Paper' },
    { id: 'decisions', label: 'Technical Decisions' },
    { id: 'evaluation', label: 'Evaluation' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'screenshots', label: 'Screenshots', highlight: true },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
];

function HeroTip({ text, align = 'center', children }) {
    // 가장 왼쪽 버튼은 가운데 정렬하면 툴팁이 화면 밖으로 잘린다.
    const pos = align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2';
    return (
        <span className="relative group inline-flex">
            {children}
            <span
                role="tooltip"
                className={`pointer-events-none absolute ${pos} top-full z-20 mt-2 w-max max-w-xs
                           rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-relaxed text-white
                           opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100
                           group-focus-within:opacity-100`}
                style={{ wordBreak: 'keep-all' }}
            >
                {text}
            </span>
        </span>
    );
}

const PAPER_TOTAL_PAGES = 12;
function SourcePaperViewer() {
    const [current, setCurrent] = useState(1);
    const prev = () => setCurrent(c => Math.max(1, c - 1));
    const next = () => setCurrent(c => Math.min(PAPER_TOTAL_PAGES, c + 1));

    return (
        <motion.div id="paper" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Source Paper</h2>
            <p className="text-gray-500 mb-8">이 프로젝트가 출발한 2023년 학술제 논문 — 화살표로 페이지를 넘겨보세요</p>

            <div className="mb-6 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                    원 논문은 Table 7의 GARCH+E.V·HAR-GARCH·HAR-TGARCH 세 행을 <span className="font-semibold text-gray-800">공란으로 남긴 채</span> 마감됐다.
                    보관된 원자료(2,129일, In-Sample 1,795일)로 3년 뒤 여섯 모형을 다시 적합해 그 공란을 채우고,
                    원문 서술과 어긋나는 지점까지 그대로 기록한 것이 <span className="font-semibold text-gray-800">재현 부록</span>이다.
                    원문은 수정하지 않고 별도 문서로 보존했다.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative flex items-center justify-center bg-gray-50" style={{ height: 'min(72vh, 760px)' }}>
                    <img
                        src={`/paper-pages/page-${String(current).padStart(2, '0')}.png`}
                        alt={`Page ${current}`}
                        className="max-h-full max-w-full object-contain"
                    />
                    <button onClick={prev} disabled={current === 1} aria-label="이전 페이지"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={next} disabled={current === PAPER_TOTAL_PAGES} aria-label="다음 페이지"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-50">
                    <div className="flex flex-wrap items-center gap-4">
                        <a href="/paper/최종논문_완성본.docx" download
                            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            원 논문 (.docx)
                        </a>
                        <a href="/paper/최종논문_재현부록.pdf" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold hover:underline" style={{ color: PRIMARY }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            재현 부록 포함본 (.pdf)
                        </a>
                        <a href="/paper/최종논문_재현부록.docx" download
                            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:underline">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            부록 (.docx)
                        </a>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{current}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(current / PAPER_TOTAL_PAGES) * 100}%`, backgroundColor: PRIMARY }}></div>
                        </div>
                        <span className="text-sm text-gray-400">{PAPER_TOTAL_PAGES}</span>
                    </div>
                </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
                미리보기 12쪽 중 11~12쪽이 재현 부록(A.1 환경·데이터 / A.2 결과 / A.3 원문과 어긋나는 점 / A.4 한계)이다.
            </p>
        </motion.div>
    );
}

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
                        <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full tracking-wider uppercase">Personal</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Extended from Team Project</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2026.03 —</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        <span style={{ color: PRIMARY }}>CryptoVol</span> Dashboard
                    </h1>
                    <p className="text-xl font-semibold mb-6 tracking-tight" style={{ color: PRIMARY }}>
                        실시간 멀티코인 변동성 서빙 · 모델 비교 · 리스크 해석 대시보드
                    </p>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
                        2023년 학술제 논문은 기간에 쫓겨 GARCH·TGARCH·TGARCH+E.V 3개까지만 실제 적합했고, HAR 계열과 GARCH+E.V는 수식만 남긴 채 마감했습니다. 논문 스스로 한계에 &ldquo;HAR-TGARCH-X의 완전한 구현이 이루어지지 못했다&rdquo;, &ldquo;실시간 예측 시스템으로의 발전을 모색할 필요가 있다&rdquo;고 적었습니다. 이 프로젝트는 그 두 문장에 대한 답입니다. 공란이던 GARCH+E.V와 미구현 HAR 계열 3종을 실제로 적합해 6개 모형을 완성했고, Binance WebSocket 릴레이와 5분 TTL 캐싱으로 수백ms 적합 비용을 제어해 상시 서빙 구조로 전환했습니다. 논문의 미검증 수치를 인용하는 대신 매 요청 재계산하는 검증 엔드포인트를 두었습니다.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <HeroTip align="left" text="FastAPI 백엔드와 React 프론트엔드 전체 코드, 그리고 논문 원문과 2026년 재현 부록(docs/paper)이 함께 있습니다.">
                        <a href="https://github.com/ykgstar37-lab/crypto-volatility-intelligence-system" target="_blank" rel="noopener noreferrer"
                            title="FastAPI 백엔드와 React 프론트엔드 전체 코드, 논문 원문·재현 부록 포함"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-full transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                            GitHub
                        </a>
                        </HeroTip>
                        <button onClick={() => { const el = document.getElementById('screenshots'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e27500] hover:bg-[#c96600] text-white text-sm font-medium rounded-full transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Screenshots
                        </button>
                        <button onClick={() => { const el = document.getElementById('paper'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-full transition hover:opacity-90"
                            style={{ backgroundColor: PRIMARY }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            논문 보기
                        </button>
                        <HeroTip text="Render 무료 플랜이라 15분 이상 유휴 상태였다면 서버가 깨어나는 데 약 50초가 걸립니다. 차트가 비어 있어도 잠시 기다려 주세요.">
                        <a href="https://crypto-volatility-intelligence-syst.vercel.app/" target="_blank" rel="noopener noreferrer"
                            title="Render 무료 플랜 — 첫 접속 시 서버 기동에 약 50초 소요"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m4 10V11m4 6V9M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Live Demo
                        </a>
                        </HeroTip>
                    </div>
                </motion.div>

                {/* PDF-style Overview / Role / Skills */}
                <motion.div id="overview" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: PRIMARY }}>Overview</p>
                                <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    팀 분석 프로젝트의 GARCH 모형을 실시간 서빙 API로 확장한 개인 프로젝트입니다. WebSocket 릴레이(Binance → 차단 시 Coinbase 폴백)로 실시간 시세를 수신하고, 6개 변동성 예측 모형의 적합 결과를 캐싱해 안정적으로 서빙합니다. 중요한 점은 하나의 모델을 고정 추천하는 대신, 모델 성능 비교와 리스크 지표를 함께 노출해 사용자가 근거 기반으로 판단할 수 있게 만든 것입니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
                                <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    개인 프로젝트로서 API 서빙 아키텍처 설계, WebSocket 릴레이 구현, 5분 TTL 캐싱 전략, 에러 격리 패턴, 프론트엔드 대시보드까지 전 과정을 담당.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {['FastAPI', 'React', 'GARCH', 'Binance WebSocket', 'OpenAI API', 'Recharts', 'Monte Carlo'].map(t => (
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
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border-l-4 shadow-sm space-y-4" style={{ borderColor: PRIMARY }}>
                        <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                            <strong className="text-gray-900">문제:</strong> P학기 팀 분석 결과가 Jupyter 안에 갇혀 실시간 의사결정에 활용 불가. 시장은 24시간 움직이는데 분석은 항상 과거 데이터에 머물러 있음.
                        </p>
                        <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                            <strong className="text-gray-900">목표:</strong> 6개 GARCH 모형을 실시간 자동 서빙하고, WebSocket으로 실시간 시세를 연동하며, 모형 정확도를 투명하게 추적하는 인터랙티브 대시보드.
                        </p>
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

                <ProjectFlowSection
                    id="architecture"
                    title="Architecture"
                    subtitle="Jupyter 분석 코드를 실시간 서비스로 바꾸기 위해 데이터 수집, 모델 적합, 캐싱, 화면 렌더링을 분리했습니다."
                    accentColor={PRIMARY}
                    variant={fadeInUp}
                    charts={CRYPTO_VOL_DASHBOARD_CHARTS}
                    steps={[
                        { title: 'Market Data', subtitle: '실시간/과거 시세 수집', items: ['Binance WS', 'CoinGecko API', 'BTC/ETH/SOL'] },
                        { title: 'FastAPI Backend', subtitle: '모델 계산과 API 제공', items: ['13 REST', '1 WebSocket', 'APScheduler'] },
                        { title: 'Model Layer', subtitle: '비용 큰 연산 격리', items: ['5 GARCH models', '5min TTL cache', 'Monte Carlo 10K'] },
                        { title: 'React Dashboard', subtitle: '투자 의사결정 화면', items: ['Volatility chart', 'Signal', 'Portfolio', 'AI briefing'] },
                    ]}
                    notes={[
                        { label: 'Bottleneck', value: 'GARCH 적합 수백ms -> 5분 TTL 캐싱' },
                        { label: 'Reliability', value: '모형별 실패 격리로 전체 응답 장애 방지' },
                        { label: 'Status', value: 'Docker Compose 실행 환경까지 구성 (배포 전)' },
                    ]}
                />

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

                {/* Paper Verification */}
                <motion.div id="verification" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Paper Verification</h2>
                    <p className="text-gray-500 mb-8">논문의 핵심 주장은 지금도 유효한가</p>

                    <div className="mb-8 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            2023년 논문은 <span className="font-semibold text-gray-800">&ldquo;비트코인 변동성은 전통 금융시장이 아니라 투자자 심리에 붙어 있다&rdquo;</span>고 결론지었다.
                            근거는 본문에 서술된 FNG-수익률 상관 0.72였지만, 이를 뒷받침하는 표가 유실되어 <span className="font-semibold text-gray-800">인용만으로는 검증할 수 없다.</span>
                            그래서 인용을 재계산으로 대체했다. 아래 수치는 문서에서 옮겨 적은 값이 아니라
                            <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[13px]">/api/volatility/factors</code>
                            가 요청마다 DB의 실제 데이터로 산출하는 값이다.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">요인 → 대상</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">논문 (2018–2023)</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">재계산 (2025–2026)</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">p-value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PAPER_VERIFICATION.rows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-semibold text-gray-700">{row.factor} → {row.target}</td>
                                        <td className="py-3 px-4 text-gray-500">{row.paper}</td>
                                        <td className="py-3 px-4 font-bold tabular-nums" style={{ color: row.verdict === 'stronger' ? PRIMARY : '#111' }}>
                                            {row.live}
                                            {row.verdict === 'stronger' && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 align-middle">최강</span>}
                                        </td>
                                        <td className="py-3 px-4 text-gray-400 tabular-nums text-xs">{row.p}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">결과</div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                논문의 0.72는 현재 데이터에서 <span className="font-semibold text-gray-800">0.2184로 재현되지 않았다.</span>
                                오히려 거래량-절대수익률이 <span className="font-semibold text-gray-800">0.5198</span>로 가장 강했고,
                                FNG는 실현변동성과 <span className="font-semibold text-gray-800">음의 상관(-0.2868)</span>을 보였다.
                                심리보다 거래 활동이 변동성을 더 잘 설명한다.
                            </p>
                        </div>
                        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">해석의 한계</div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                기간({PAPER_VERIFICATION.paperPeriod.split(' ')[0]} vs {PAPER_VERIFICATION.livePeriod.split(' ')[0]})과 데이터 출처, 표본 크기(2,129일 vs 364일)가 모두 달라
                                <span className="font-semibold text-gray-800"> 논문이 틀렸다고 단정할 수 없다.</span>
                                다만 &ldquo;재현되지 않는다&rdquo;는 사실 자체가 결과이며, 정적 결론을 매일 다시 검증하는 구조를 갖춘 것이 이 확장의 목적이다.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <SourcePaperViewer />

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
                                answer: 'arch 라이브러리의 적합은 수십~수백ms가 걸립니다. 인메모리 캐싱(5분 TTL)으로 반복 호출을 방지하고, 롤링 적합 윈도우를 60일로 고정한 뒤 조회 구간에도 상한(accuracy 120일 / compare 180일)을 둬 요청당 연산량이 늘어나지 않게 했습니다. 개별 모형 실패 시 0.0을 반환하여 하나의 모형 실패가 전체 응답을 깨뜨리지 않도록 했습니다.',
                                tag: '성능 + 안정성'
                            },
                            {
                                question: '코인 전환 시 API 호출을 어떻게 최적화했는가?',
                                answer: 'BTC→ETH 전환 시 가격, 차트, 변동성, 시그널, 리더보드 등 전체 데이터가 갱신되어야 합니다. Promise.all로 API 호출을 병렬화하고, 5분 TTL 인메모리 캐시로 GARCH 재계산을 방지하여 체감 전환 속도를 확보했습니다.',
                                tag: '사용자 경험'
                            },
                            {
                                question: '6개 모형 중 "최적 모형"을 고정하지 않은 이유는?',
                                answer: '시장 구간마다 최적 모형이 달라집니다. 모형을 하나로 고정하는 대신, 60일 롤링 RMSE로 실시간 리더보드를 운영하고 백테스트로 구간별 최적 모형을 탐색할 수 있게 했습니다. 모형의 한계를 투명하게 보여주는 것도 설계라는 판단이었습니다.',
                                tag: '도메인 설계'
                            },
                            {
                                question: 'HAR-TGARCH-X에 외생변수(거래량, FNG)를 주입한 근거는?',
                                answer: '외생변수 주입 근거를 인용이 아니라 재계산으로 확보했습니다. /api/volatility/factors가 매 요청 피어슨 상관을 산출하며, 현재 데이터 기준 거래량-절대수익률 0.5198(p=1.4e-26)이 FNG-수익률 0.2184(p=2.6e-05)보다 강했습니다. 거래량과 FNG 모두 표준화하여 mean equation의 외생변수(x=exog)로 주입. reindex + ffill로 비정렬 시계열을 정합하고, 최소 60일 이상의 정합 데이터가 확보된 경우에만 모형을 적합합니다.',
                                tag: '통계적 설계'
                            },
                            {
                                question: 'API Rate Limiting을 왜 직접 구현했는가?',
                                answer: 'AI 브리핑(GPT-4o-mini)과 Monte Carlo 시뮬레이션은 비용이 높은 연산입니다. IP 기반 슬라이딩 윈도우 방식으로 AI 브리핑 5req/60s, 포트폴리오 시뮬레이션 10req/60s를 제한합니다. X-Forwarded-For 헤더에서 클라이언트 IP를 추출해, 리버스 프록시 뒤에 놓이더라도 정확한 IP 식별이 되도록 했습니다.',
                                tag: '비용 최적화'
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

                {/* Evaluation & Verification */}
                <motion.div id="evaluation" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Evaluation & Verification</h2>
                    <p className="text-gray-500 mb-8">통계적 검증 기반 모형 설계 근거</p>

                    {/* Statistical Pre-tests */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        {[
                            { test: 'ADF Test', target: '로그수익률', result: '정상성 확인', desc: 'p < 0.05 — 시계열 안정성 확보', color: 'bg-emerald-50 text-emerald-700' },
                            { test: 'ARCH-LM Test', target: '로그수익률', result: 'ARCH 효과 유의', desc: 'GARCH류 모형 적합 근거', color: 'bg-emerald-50 text-emerald-700' },
                            { test: '정규성 검정', target: '로그수익률', result: '정규성 기각', desc: '두터운 꼬리 → t-분포 적용', color: 'bg-amber-50 text-amber-700' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.test}</p>
                                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-lg mb-2 ${item.color}`}>{item.result}</span>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Key Metrics — Before→After 도표 */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">지표</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-red-400 uppercase tracking-wider">팀 분석 (Before)</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-emerald-500 uppercase tracking-wider">개인 서비스 (After)</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">근거</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { metric: '데이터 소스', before: 'CSV 정적', after: 'WebSocket 실시간', improvement: 'Binance 릴레이' },
                                    { metric: 'GARCH 적합', before: '수동 (수백ms)', after: '5분 TTL 캐시', improvement: '자동 서빙' },
                                    { metric: '모형 수', before: '1~2개 수동 비교', after: '5개 동시 서빙', improvement: '60일 RMSE 랭킹' },
                                    { metric: 'TGARCH 레버리지', before: '미검증', after: 'γ = 0.0990', improvement: '비대칭 실증' },
                                    { metric: '외생변수 근거', before: '논문 본문 서술(표 유실)', after: '요청마다 재계산', improvement: '거래량 0.5198 / FNG 0.2184' },
                                    { metric: '결과 확인', before: '~10분 (Jupyter)', after: '즉시 (대시보드)', improvement: 'WebSocket Alert' },
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

                    {/* Model Comparison Framework */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">6개 모형 비교 프레임워크</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {['GARCH(1,1)', 'TGARCH (GJR)', 'HAR-GARCH', 'HAR-TGARCH', 'HAR-TGARCH-X'].map((name, i) => (
                                <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>{name}</span>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>평가 지표: <strong className="text-gray-700">MSE · RMSE · MAE · MAPE · R²</strong></span>
                            <span>|</span>
                            <span>60일 롤링 RMSE 리더보드로 구간별 최적 모형 동적 추적</span>
                        </div>
                    </div>

                    {/* Jupyter 정적 분석 vs 실시간 대시보드 비교 */}
                    <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>Jupyter 정적 분석 vs 실시간 대시보드</p>
                        <p className="text-sm text-gray-500 mb-4" style={{ wordBreak: 'keep-all' }}>시나리오: <span className="font-medium text-gray-700">"BTC 변동성이 급등할 때 어떻게 대응하나?"</span></p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Jupyter (Before)</p>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                    <p>CSV 어제 데이터 · 수동 fit 수백ms · 정적 차트 · <strong>~10분</strong></p>
                                    <p className="text-red-400 text-xs">시장 변화 후 대응 불가</p>
                                </div>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">실시간 대시보드 (After)</p>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                    <p>WebSocket 실시간 · 5분 캐시 자동 · 인터랙티브 · <strong>즉시</strong></p>
                                    <p className="text-emerald-500 text-xs">Alert + AI 브리핑으로 선제 대응</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Technical Challenges */}
                <motion.div id="challenges" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Technical Challenges</h2>
                    <p className="text-gray-500 mb-8">개인 프로젝트에서 직면한 문제와 해결 과정</p>
                    <div className="space-y-4">
                        {[
                            { title: 'GARCH 적합 비용', problem: 'arch 라이브러리 적합이 수백ms 소요, 동시 요청 시 서버 응답 지연', solution: '5분 TTL 인메모리 캐싱 + 롤링 적합 윈도우 60일 고정 + 조회 구간 상한 + 개별 모형 실패 시 0.0 반환으로 격리', result: '반복 호출 비용 0' },
                            { title: 'WebSocket 보안', problem: '프론트에서 Binance 직접 연결 시 CORS 차단 + API 키 노출 위험', solution: 'FastAPI WebSocket 릴레이 서버 구현, Set 기반 클라이언트 추적으로 브로드캐스트', result: 'API 키 노출 0' },
                            { title: '코인 전환 성능', problem: 'BTC→ETH 전환 시 5개 API(가격/차트/변동성/시그널/리더보드) 순차 호출로 느림', solution: 'Promise.all 병렬 호출 + 5분 TTL 캐시로 GARCH 재계산 방지', result: '체감 전환 즉시' },
                            { title: 'Monte Carlo 정확도', problem: '1,000 시나리오에서 99% VaR 꼬리 분포 불안정', solution: '10,000 시나리오로 확장, 분포 수렴 확인', result: '10x 확장, VaR 안정' },
                            { title: 'AI 브리핑 비용', problem: 'GPT-4o-mini 호출이 무제한이면 API 비용 폭증', solution: 'IP 기반 슬라이딩 윈도우 Rate Limiting 직접 구현, X-Forwarded-For 추출', result: '5req/60s 제한' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-start gap-5">
                                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">{idx + 1}</div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="p-3 bg-red-50 rounded-xl">
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Problem</p>
                                                <p className="text-xs text-gray-700 leading-relaxed">{item.problem}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Solution</p>
                                                <p className="text-xs text-gray-700 leading-relaxed">{item.solution}</p>
                                            </div>
                                            <div className="p-3 bg-emerald-50 rounded-xl flex flex-col items-center justify-center">
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Result</p>
                                                <p className="text-sm font-bold text-emerald-700 text-center">{item.result}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Technical Drawer */}
                <TechnicalDrawer accentColor="#2b4fcb" tabs={[
                    { label: 'About', content: (
                        <div className="space-y-6">
                            <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#2b4fcb' }}>
                                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>CryptoVol Dashboard</h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-4" style={{ wordBreak: 'keep-all' }}>
                                    Jupyter에서 수동 실행하던 GARCH 분석을 실시간 웹 서비스로 전환. 6개 변동성 모형을 자동 서빙하고,
                                    WebSocket 릴레이로 실시간 시세를 수신하며, 60일 롤링 RMSE로 모형 정확도를 투명하게 추적하는 인터랙티브 대시보드.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['FastAPI', 'React', 'GARCH', 'WebSocket', 'Monte Carlo', 'GPT-4o-mini', 'Docker'].map(t => (
                                        <span key={t} className="text-[10px] font-bold px-2 py-1 bg-white/15 rounded-full">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                                {[
                                    { label: 'Models', value: '5개', sub: 'GARCH 계열 동시 서빙' },
                                    { label: 'Data', value: '365일', sub: '3종 코인 일별' },
                                    { label: 'TGARCH γ', value: '0.0990', sub: '비대칭 레버리지' },
                                    { label: '최강 상관', value: '0.5198', sub: '거래량↔절대수익률' },
                                    { label: 'Endpoints', value: '14', sub: '13 REST + 1 WS' },
                                    { label: 'Simulation', value: '10K', sub: 'Monte Carlo' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-lg font-bold text-[#2b4fcb]">{item.value}</p>
                                        <p className="text-[10px] text-gray-500">{item.sub}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What Makes This Special</p>
                                <div className="space-y-2">
                                    {[
                                        'BTC/ETH/SOL 365일 데이터로 6개 GARCH 모형을 60일 롤링 RMSE 기준으로 실시간 비교',
                                        'TGARCH 레버리지 효과(γ=0.0990) 실증 — 하락 시 변동성이 비대칭적으로 증가하는 현상을 모형에 내재화',
                                        '논문이 수식만 남긴 HAR-TGARCH-X를 실제 적합. arch의 기본 ConstantMean이 x=를 무시하는 문제를 mean="LS"로 해결',
                                        'GARCH 적합 수백ms를 5분 TTL 인메모리 캐싱으로 해결 — 코인 전환 시 Promise.all 병렬 호출',
                                        'Binance WebSocket 릴레이로 API 키 노출 없이 실시간 시세 브로드캐스트 — CORS/보안 문제 해결',
                                        'Monte Carlo 1,000→10,000 시나리오 확장으로 99% VaR 꼬리 분포 안정화',
                                        'IP 슬라이딩 윈도우 Rate Limiting 직접 구현 — AI 브리핑 5req/60s, 시뮬레이션 10req/60s',
                                    ].map((text, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="text-[#2b4fcb] mt-0.5 flex-shrink-0">*</span>
                                            <span style={{ wordBreak: 'keep-all' }}>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )},
                    { label: 'Overview', content: (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Models', value: '5', sub: 'GARCH / TGARCH / HAR / HAR-T / HAR-TX' },
                                { label: 'API Endpoints', value: '14', sub: '13 REST + 1 WebSocket' },
                                { label: 'Coins', value: '3', sub: 'BTC / ETH / SOL 멀티코인' },
                                { label: 'i18n', value: 'KO / EN', sub: '한국어·영어 다국어 지원' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
                                    <p className="text-xs font-medium text-gray-500">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    )},
                    { label: 'Architecture', content: (
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
                                <div className="px-6 py-4 bg-[#2b4fcb] rounded-xl text-white text-center max-w-lg w-full">
                                    <p className="text-sm font-bold">FastAPI Backend</p>
                                    <p className="text-xs text-white/70 mt-1">14 Endpoints (13 REST + 1 WebSocket)</p>
                                </div>
                            </div>

                            {/* Backend Modules */}
                            <div className="flex justify-center gap-3 flex-wrap">
                                {[
                                    { name: 'APScheduler', desc: '자동 수집' },
                                    { name: 'GARCH (5)', desc: 'arch + HAR-X' },
                                    { name: 'Monte Carlo', desc: '10K Sim' },
                                    { name: 'Rate Limiter', desc: 'IP 슬라이딩 윈도우' },
                                ].map((m, i) => (
                                    <div key={i} className="flex-1 min-w-[120px] max-w-[160px] px-4 py-3 bg-[#2b4fcb]/10 border border-[#2b4fcb]/30 rounded-xl text-center">
                                        <p className="text-xs font-bold text-[#c96600]">{m.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Storage */}
                            <div className="flex justify-center gap-3 flex-wrap">
                                {[
                                    { name: 'PostgreSQL', desc: '시세 DB (prod)' },
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
                                <div className="px-4 py-2 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">Docker Compose</div>
                                <div className="px-4 py-2 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">Nginx</div>
                            </div>
                        </div>
                    )},
                    { label: 'Key Features', content: (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {FEATURES.map((feature, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: PRIMARY }}>
                                            {feature.icon}
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 leading-snug">{feature.title}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed" style={{ wordBreak: 'keep-all' }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    )},
                    { label: '5 GARCH Models', content: (
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
                ]} />

                {/* Screenshots Gallery */}
                <ScreenshotGallery />

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
                                    <span><strong className="text-gray-900">분석 코드 ≠ 서비스 코드</strong> — Jupyter GARCH를 API로 서빙하려면 에러 핸들링, 캐싱, 동시 요청 처리가 필수. 각 모형을 독립 try-except로 격리하는 패턴을 익힘</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">02</span>
                                    <span><strong className="text-gray-900">모형의 한계를 인정하는 것도 설계</strong> — "최적 모형 하나"가 아니라 "투명하게 비교"가 더 나은 설계. HAR-TGARCH-X 외생변수 전달 누락도 뒤늦게 발견 → 수학적 이해와 올바른 구현은 별개</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">03</span>
                                    <span><strong className="text-gray-900">프로덕션 품질 도달 과정</strong> — 처음에는 테스트 0개, CI 없음, Docker 없음 → pytest 28개 + GitHub Actions CI + Docker Compose + Alembic 마이그레이션까지 단계적으로 개선</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span>
                                    <span className="line-through text-gray-400">테스트 코드 부재 → <strong className="text-gray-600 no-underline">pytest 28개 + GitHub Actions CI 구축 완료</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span>
                                    <span className="line-through text-gray-400">캐시 전략 없음 → <strong className="text-gray-600 no-underline">5분 TTL 인메모리 캐싱 + Docker Compose 적용</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 text-xs font-bold mt-0.5 w-14 shrink-0">높음</span>
                                    <span>WebSocket + Monte Carlo e2e 통합 테스트 확장 필요</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 text-xs font-bold mt-0.5 w-14 shrink-0">중간</span>
                                    <span>CoinGecko rate limit(30 req/min) — 캐싱 우회 중이지만 데이터 신선도 트레이드오프</span>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                            <p className="text-sm text-gray-600 leading-relaxed italic" style={{ wordBreak: 'keep-all' }}>
                                "분석할 수 있다"에서 "분석을 서비스로 만들 수 있다"로의 전환이었습니다. 분석가는 모형의 AIC를 비교하지만, 엔지니어는 그 모형이 API 타임아웃 안에 응답할 수 있는지를 고민합니다. 이 차이를 체감한 프로젝트였습니다.
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
