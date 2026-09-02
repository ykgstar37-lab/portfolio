import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import CollapsibleSection from '../components/CollapsibleSection';
import SectionDotNav from '../components/SectionDotNav';
import ProjectFlowSection from '../components/ProjectFlowSection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const CRYPTO_VOLATILITY_CHARTS = [
    {
        title: 'Analysis Pipeline',
        description: '2018.02~2023.11 BTC 데이터를 정제한 뒤 사전 검정, GARCH 계열 모델링, 예측 검증으로 이어지는 분석 흐름',
        chart: String.raw`flowchart LR
    subgraph Data["Data Collection"]
        Price["BTC Price\n2018.02~2023.11"]
        Volume["Trading Volume"]
        FNG["Fear & Greed Index"]
        Market["Market Indices"]
    end

    subgraph Prep["Preprocessing"]
        Return["Log Return"]
        Clean["Missing / Outlier Check"]
        Split["Train / Test Split"]
    end

    subgraph Test["Pre-Tests"]
        ADF["ADF Stationarity"]
        ARCH["ARCH-LM Effect"]
        Normality["Normality Check"]
    end

    subgraph Model["Modeling"]
        GARCH["GARCH"]
        TGARCH["TGARCH"]
        HAR["HAR"]
        HARTGARCH["HAR-TGARCH"]
        HARX["HAR-TGARCH-X\nVolume + FNG"]
    end

    subgraph Eval["Validation"]
        Info["AIC / BIC"]
        Error["MSE / RMSE / MAE / MAPE"]
        Explain["R2 + Coefficient Effect"]
    end

    Data --> Prep
    Prep --> Test
    Test --> Model
    Model --> Eval
    Eval --> Insight["외생변수와 HAR/TGARCH 계열의\n변동성 설명력 비교"]

    style Data fill:#fef3c7,stroke:#f59e0b
    style Prep fill:#fee2e2,stroke:#ef4444
    style Test fill:#dbeafe,stroke:#3b82f6
    style Model fill:#dcfce7,stroke:#22c55e
    style Eval fill:#f3e8ff,stroke:#a855f7`,
    },
];

// Bitcoin price data (sampled monthly from 2018-2023)
const BTC_PRICE_DATA = [
    { date: '2018.02', price: 9181 }, { date: '2018.06', price: 6394 }, { date: '2018.12', price: 3693 },
    { date: '2019.06', price: 10817 }, { date: '2019.12', price: 7195 },
    { date: '2020.03', price: 6424 }, { date: '2020.06', price: 9137 }, { date: '2020.12', price: 29001 },
    { date: '2021.04', price: 57750 }, { date: '2021.11', price: 56905 },
    { date: '2022.01', price: 38484 }, { date: '2022.06', price: 19785 }, { date: '2022.12', price: 16547 },
    { date: '2023.03', price: 28478 }, { date: '2023.06', price: 30468 }, { date: '2023.11', price: 37713 },
];

// Daily log returns sample (first 30 days, 2018.02)
const LOG_RETURNS_DATA = [
    { day: 1, ret: -0.118 }, { day: 2, ret: -0.032 }, { day: 3, ret: 0.038 }, { day: 4, ret: -0.124 },
    { day: 5, ret: -0.185 }, { day: 6, ret: 0.099 }, { day: 7, ret: -0.014 }, { day: 8, ret: 0.070 },
    { day: 9, ret: 0.062 }, { day: 10, ret: -0.016 }, { day: 11, ret: -0.007 }, { day: 12, ret: -0.019 },
    { day: 13, ret: 0.023 }, { day: 14, ret: 0.054 }, { day: 15, ret: -0.007 }, { day: 16, ret: 0.028 },
    { day: 17, ret: -0.028 }, { day: 18, ret: 0.007 }, { day: 19, ret: -0.039 }, { day: 20, ret: 0.101 },
    { day: 21, ret: 0.035 }, { day: 22, ret: -0.003 }, { day: 23, ret: 0.052 }, { day: 24, ret: -0.021 },
    { day: 25, ret: -0.020 }, { day: 26, ret: -0.081 }, { day: 27, ret: 0.022 }, { day: 28, ret: 0.010 },
];

// Correlation data
const CORR_DATA = [
    { name: 'BTC ↔ FNG', value: 0.72, pValue: '2.2e-16', significant: true },
    { name: 'BTC ↔ KOSPI', value: -0.03, pValue: '0.9816', significant: false },
    { name: 'BTC ↔ NASDAQ', value: -0.05, pValue: '0.84', significant: false },
    { name: 'KOSPI ↔ KOSDAQ', value: 0.94, pValue: '<0.001', significant: true },
    { name: 'NASDAQ ↔ S&P500', value: 0.98, pValue: '<0.001', significant: true },
];

// Model comparison (GARCH parameters from CODE PDF)
const MODEL_PARAMS = [
    { model: 'GARCH(1,1)', omega: 0.00938, alpha: 0.0538, beta: 0.8351, gamma: '-', r2: 0.78 },
    { model: 'TGARCH', omega: 0.00938, alpha: 0.0538, beta: 0.8351, gamma: 0.099, r2: 0.72 },
    { model: 'HAR-GARCH', omega: '-', alpha: '-', beta: '-', gamma: '-', r2: 0.02 },
    { model: 'HAR-TGARCH', omega: '-', alpha: '-', beta: '-', gamma: '-', r2: 0.89 },
    { model: 'HAR-TGARCH-X', omega: '-', alpha: '-', beta: '-', gamma: '-', r2: 0.89 },
];

// Radar chart for model comparison
const RADAR_DATA = [
    { metric: 'R²', GARCH: 78, TGARCH: 72, HAR_TGARCH_X: 89 },
    { metric: 'Stability', GARCH: 90, TGARCH: 85, HAR_TGARCH_X: 80 },
    { metric: 'Asymmetry', GARCH: 40, TGARCH: 85, HAR_TGARCH_X: 90 },
    { metric: 'Multi-scale', GARCH: 30, TGARCH: 30, HAR_TGARCH_X: 95 },
    { metric: 'Exogenous', GARCH: 10, TGARCH: 10, HAR_TGARCH_X: 90 },
];

const MODELS = [
    { name: 'GARCH(1,1)', desc: '기본 조건부 분산 모형', formula: 'σ²ₜ = ω + α·r²ₜ₋₁ + β·σ²ₜ₋₁', color: 'from-[#1b3fab] to-[#0f2570]' },
    { name: 'TGARCH', desc: '비대칭 레버리지 효과', formula: '+ γ·r²ₜ₋₁·I(rₜ₋₁<0)', color: 'from-[#2b4fcb] to-[#1a3090]' },
    { name: 'HAR-GARCH', desc: '단·중·장기 변동성', formula: 'HARCH(1,7,30)', color: 'from-[#3a5ed5] to-[#2040a0]' },
    { name: 'HAR-TGARCH', desc: 'HAR + 비대칭 결합', formula: 'r1+r7+r30+neg+σ_lag', color: 'from-[#4a6ad4] to-[#2a4ab0]' },
    { name: 'HAR-TGARCH-X', desc: '+ Volume + FNG', formula: '+ vol_lag + fng_lag', color: 'from-[#5878dd] to-[#3455c0]' },
];

const TESTS = [
    { name: 'ADF 검정', purpose: '시계열 정상성 확인', result: '로그수익률 정상 (p<0.05)', icon: '1' },
    { name: 'ARCH-LM 검정', purpose: '이분산성 확인', result: 'ARCH 효과 존재 (p<0.05)', icon: '2' },
    { name: '정규성 검정', purpose: '수익률 분포 확인', result: '정규성 기각 → 두터운 꼬리', icon: '3' },
];

const TECH_STACK = {
    'Modeling': ['arch', 'statsmodels', 'scipy'],
    'Data': ['Python', 'pandas', 'numpy', 'R'],
    'Visualization': ['matplotlib', 'seaborn'],
};

const CRYPTO_CONTRIBUTIONS = [
    { title: 'GARCH 모형 구현 및 비교', desc: 'Python arch 라이브러리를 활용하여 GARCH, TGARCH, HAR-GARCH, HAR-TGARCH, HAR-TGARCH-X 5개 모형을 구현하고 성능을 비교 분석.', tag: 'Modeling' },
    { title: '데이터 수집 및 전처리', desc: 'BTC 일별 가격 데이터 수집, 로그 수익률 변환, 정상성 검정(ADF), 이분산성 검정(ARCH LM) 수행.', tag: 'Data' },
    { title: '외생변수 분석', desc: 'Fear & Greed Index, 거래량 등 외생변수의 변동성 예측력 분석. HAR-TGARCH-X 모형에 통합.', tag: 'Analysis' },
    { title: '모형 성능 평가 체계', desc: 'AIC, BIC, Log-Likelihood, R² 기반 다각도 모형 성능 평가 프레임워크 설계 및 시각화.', tag: 'Analysis' },
    { title: '논문 작성 및 발표', desc: '연구 결과를 학술 논문 형식으로 작성하고 P학기 발표 진행.', tag: 'Presentation' },
];

const SECTIONS = [
    { id: 'background', label: 'Research Background' },
    { id: 'analysis-pipeline', label: 'Analysis Pipeline' },
    { id: 'price-trend', label: 'Bitcoin Price Trend' },
    { id: 'log-returns', label: 'Daily Log Returns' },
    { id: 'pretests', label: 'Statistical Pre-Tests' },
    { id: 'correlation', label: 'Correlation Analysis' },
    { id: 'evolution', label: 'Model Evolution' },
    { id: 'performance-compare', label: 'Model Performance Comparison' },
    { id: 'findings', label: 'Key Findings' },
    { id: 'exogenous', label: 'Exogenous Variables' },
    { id: 'performance', label: 'Model Performance' },
    { id: 'conclusion', label: 'Conclusion' },
    { id: 'contributions', label: 'My Contributions' },
    { id: 'tech', label: 'Tech Stack' },
    { id: 'presentation', label: 'Research', highlight: true },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
];

const CRYPTO_TOTAL_SLIDES = 37;
function CryptoSlideViewer() {
    const [current, setCurrent] = useState(1);
    const prev = () => setCurrent(c => Math.max(1, c - 1));
    const next = () => setCurrent(c => Math.min(CRYPTO_TOTAL_SLIDES, c + 1));

    return (
        <div>
            <h3 className="text-xl font-bold mb-2">Slides</h3>
            <p className="text-gray-500 text-sm mb-4">발표 자료 ({CRYPTO_TOTAL_SLIDES}장)</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative">
                    <img
                        src={`/slides-crypto/slide-${String(current).padStart(2, '0')}.png`}
                        alt={`Slide ${current}`}
                        className="w-full h-auto"
                    />
                    <button onClick={prev} disabled={current === 1}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={next} disabled={current === CRYPTO_TOTAL_SLIDES}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-50">
                    <span className="text-sm font-bold text-gray-900">{current}</span>
                    <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2b4fcb] rounded-full transition-all duration-300" style={{ width: `${(current / CRYPTO_TOTAL_SLIDES) * 100}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-400">{CRYPTO_TOTAL_SLIDES}</span>
                </div>
            </div>
        </div>
    );
}

const PAPER_TOTAL_PAGES = 12;
function PaperViewer() {
    const [current, setCurrent] = useState(1);
    const prev = () => setCurrent(c => Math.max(1, c - 1));
    const next = () => setCurrent(c => Math.min(PAPER_TOTAL_PAGES, c + 1));

    return (
        <div id="paper">
            <h3 className="text-xl font-bold mb-3">Paper</h3>
            <p className="text-gray-500 text-sm mb-4">완성된 논문 미리보기 — 화살표로 페이지를 넘겨보세요</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative">
                    <img
                        src={`/paper-pages/page-${String(current).padStart(2, '0')}.png`}
                        alt={`Page ${current}`}
                        className="w-full h-auto"
                    />
                    <button onClick={prev} disabled={current === 1}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={next} disabled={current === PAPER_TOTAL_PAGES}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
                    <a href="/paper/최종논문_완성본.docx" download onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#2b4fcb] hover:underline">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download .docx
                    </a>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{current}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2b4fcb] rounded-full transition-all duration-300" style={{ width: `${(current / PAPER_TOTAL_PAGES) * 100}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-400">{PAPER_TOTAL_PAGES}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CryptoVolatility() {
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
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-800 rounded-full tracking-wider uppercase">P-실무 2024</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Team — 6조 52경</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2023.12 — 2024.01</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Comparison and Analysis of Cryptocurrency Volatility Forecast Based on the <span className="text-[#2b4fcb]">GARCH</span> Model
                    </h1>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
                        5개 GARCH 계열 모형을 비교해 비트코인 변동성 예측의 기준선을 세우고, 외생변수(Volume+FNG)가 모델 선택과 성능 해석에 어떤 기여를 하는지 검증한 프로젝트
                    </p>
                    <div className="flex gap-3">
                        <a href="https://www.notion.so/p-2024-27fbec2d3d51803bada9dcfdb30f8d50" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.58 2.36c-.42-.326-.98-.7-2.055-.607L3.48 2.86c-.466.046-.56.28-.374.466zm.793 3.08v13.908c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.607.327-1.167.514-1.634.514-.747 0-.933-.234-1.494-.934l-4.577-7.186v6.952l1.447.327s0 .84-1.167.84l-3.22.187c-.093-.187 0-.653.327-.727l.84-.233V9.854L7.46 9.667c-.094-.42.14-1.027.747-1.074l3.453-.233 4.763 7.28V9.107l-1.213-.14c-.094-.514.28-.887.747-.933zM2.4 1.86L15.867.88c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.933.653.933 1.213v16.378c0 1.026-.373 1.634-1.68 1.726L6.933 24.64c-.98.047-1.447-.093-1.96-.747L1.313 19.3c-.56-.747-.793-1.307-.793-1.96V3.54c0-.84.373-1.54 1.88-1.68z"/></svg>
                            Notion
                        </a>
                        <button onClick={() => { const el = document.getElementById('presentation'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e27500] text-white text-sm font-medium rounded-full hover:bg-[#c96600] transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Research
                        </button>
                    </div>
                </motion.div>

                {/* Overview */}
                <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                    {[
                        { label: '분석 기간', value: '6년', sub: '2018.02 ~ 2023.11' },
                        { label: '데이터 포인트', value: '2,129', sub: '거래일 기준' },
                        { label: '비교 모형', value: '5개', sub: 'GARCH 계열' },
                        { label: '시작 → 종료 가격', value: '$9K→$38K', sub: 'BTC/USD' },
                    ].map((item, idx) => (
                        <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
                            <p className="text-xs font-medium text-gray-500">{item.sub}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* PDF-style Overview / Role / Skills */}
                <motion.div id="overview" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-[#2b4fcb] uppercase tracking-widest mb-2">Overview</p>
                                <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    암호화폐 시장의 변동성을 GARCH 계열 5개 모형으로 비교 분석한 팀 연구 프로젝트입니다. ADF·ARCH-LM 사전 검정으로 모델 적용 조건을 확인하고, AIC/BIC/R²를 함께 보며 단순 적합이 아니라 평가 기준이 분명한 모델 비교 체계를 설계했습니다. 이후 CryptoVol Dashboard에서 어떤 모형을 실시간 서빙할지 판단하는 기반이 되었습니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
                                <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    GARCH 모형 비교 분석, ADF·ARCH-LM 사전 검정 수행, HAR-TGARCH-X 후보 검증, 외생변수(FNG) 효과 분석, 평가 지표 정리와 발표 자료 작성을 담당했습니다. 모델링 자체보다 검증 근거를 명확히 남기는 데 집중했습니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {['Python', 'GARCH', 'HAR', 'ADF Test', 'ARCH-LM', 'statsmodels', 'pandas'].map(t => (
                                        <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ RESEARCH BACKGROUND ═══ */}
                <motion.div id="background" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Research Background</h2>
                    <p className="text-gray-500 mb-8">청년층의 암호화폐 관심과 변동성 예측의 필요성</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#2b4fcb]/10 flex items-center justify-center text-lg">💰</div>
                                <div>
                                    <p className="text-2xl font-bold text-[#2b4fcb]">300조</p>
                                    <p className="text-xs font-bold text-gray-400">한국 가상자산 시장 규모</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">2021년 말 기준 세계 시장의 약 10% 차지. BCG는 2026년 1,000조 원 수준으로 성장 전망했습니다.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#2b4fcb]/10 flex items-center justify-center text-lg">👥</div>
                                <div>
                                    <p className="text-2xl font-bold text-[#2b4fcb]">73%</p>
                                    <p className="text-xs font-bold text-gray-400">20~30대 투자자 비율</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">한화자산운용 조사 기준. 대학생 10명 중 7명이 가상화폐 투자 경험이 있다고 응답했습니다.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg">📉</div>
                                <div>
                                    <p className="text-2xl font-bold text-red-500">폭락 사례</p>
                                    <p className="text-xs font-bold text-gray-400">예측 불가한 변동성</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">2018년 박상기의 난(30%↓), 2021년 은성수의 난(10%↓), 2022년 루나 사태($119→$1) 등 반복된 폭락.</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-2xl">
                        <p className="text-sm text-gray-600 leading-relaxed"><span className="font-bold text-gray-900">연구 동기:</span> 과거의 암호화폐 폭락 사태의 재발을 막기 위한 해답은 지나친 변동성에 있다고 판단하였고, 청년들의 안정적인 투자를 위해 최적의 변동성 예측 모형을 구현하고자 하였습니다.</p>
                    </div>
                </motion.div>

                <ProjectFlowSection
                    id="analysis-pipeline"
                    title="Analysis Pipeline"
                    subtitle="암호화폐 변동성이 예측 가능한 구조를 갖는지 확인하기 위해 데이터 정제, 사전 검정, 후보 모델 비교, 외생변수 검증 순서로 분석했습니다."
                    accentColor="#2b4fcb"
                    variant={fadeInUp}
                    charts={CRYPTO_VOLATILITY_CHARTS}
                    steps={[
                        { title: 'Data Collection', subtitle: '2018.02~2023.11 시계열', items: ['BTC price', 'Volume', 'FNG', 'Market indices'] },
                        { title: 'Pre-Tests', subtitle: '모형 적용 가능성 확인', items: ['Log return', 'ADF', 'ARCH-LM', 'Normality'] },
                        { title: 'Modeling', subtitle: '5개 GARCH 계열 비교', items: ['GARCH', 'TGARCH', 'HAR', 'HAR-TGARCH', 'HAR-TGARCH-X'] },
                        { title: 'Validation', subtitle: '설명력과 예측력 비교', items: ['AIC/BIC', 'MSE/RMSE', 'MAPE/MAE', 'R2'] },
                    ]}
                    notes={[
                        { label: 'Problem', value: '단일 모델로 변동성 리스크를 설명하기 어려움' },
                        { label: 'Hypothesis', value: '거래량과 FNG가 변동성 예측력을 보완할 수 있음' },
                        { label: 'Result', value: 'HAR/TGARCH 계열과 외생변수 효과를 비교 근거로 확보' },
                    ]}
                />

                {/* BTC Price Chart */}
                <motion.div id="price-trend" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Bitcoin Price Trend</h2>
                    <p className="text-gray-500 mb-8">2018.02 ~ 2023.11 비트코인 가격 추이 (USD)</p>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={BTC_PRICE_DATA}>
                                <defs>
                                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2b4fcb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2b4fcb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#999' }} />
                                <YAxis fontSize={11} tick={{ fill: '#999' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Price']} contentStyle={{ borderRadius: '12px', border: '1px solid #eee', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="price" stroke="#2b4fcb" strokeWidth={2.5} fill="url(#priceGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Log Returns Chart */}
                <motion.div id="log-returns" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Daily Log Returns</h2>
                    <p className="text-gray-500 mb-8">2018년 2월 일별 로그수익률 — 변동성 클러스터링 확인</p>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={LOG_RETURNS_DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" fontSize={11} tick={{ fill: '#999' }} label={{ value: 'Day', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                                <YAxis fontSize={11} tick={{ fill: '#999' }} />
                                <Tooltip formatter={(v) => [v.toFixed(4), 'Log Return']} contentStyle={{ borderRadius: '12px', border: '1px solid #eee', fontSize: '12px' }} />
                                <Bar dataKey="ret" fill="#2b4fcb" radius={[2, 2, 0, 0]}>
                                    {LOG_RETURNS_DATA.map((entry, i) => (
                                        <rect key={i} fill={entry.ret >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Statistical Tests */}
                <motion.div id="pretests" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Statistical Pre-Tests</h2>
                    <p className="text-gray-500 mb-8">GARCH 모형 적용 전 사전 검정 결과</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TESTS.map((test, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center mb-4 text-sm font-bold">{test.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{test.name}</h3>
                                <p className="text-xs text-gray-500 mb-3">{test.purpose}</p>
                                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg inline-block">{test.result}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Correlation Analysis */}
                <motion.div id="correlation" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Correlation Analysis</h2>
                    <p className="text-gray-500 mb-8">피어슨 상관계수 및 통계적 유의성 검정</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={CORR_DATA} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" domain={[-0.2, 1]} fontSize={11} tick={{ fill: '#999' }} />
                                    <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: '#666' }} width={120} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #eee', fontSize: '12px' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {CORR_DATA.map((entry, i) => (
                                            <rect key={i} fill={entry.value > 0.5 ? '#2b4fcb' : entry.value > 0 ? '#9ca3af' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">검정 결과</h3>
                            <div className="space-y-3">
                                {CORR_DATA.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400">p={c.pValue}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.significant ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {c.significant ? 'Significant' : 'N.S.'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 5 Models */}
                <motion.div id="evolution" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Model Evolution</h2>
                    <p className="text-gray-500 mb-8">GARCH → HAR-TGARCH-X 5단계 모형 발전 구조</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {MODELS.map((model, idx) => (
                            <motion.div key={idx} whileHover={{ y: -6 }} className={`relative bg-gradient-to-br ${model.color} p-5 rounded-2xl text-white overflow-hidden cursor-default`}>
                                <div className="absolute top-2 right-3 text-white/15 text-4xl font-bold">{String(idx + 1).padStart(2, '0')}</div>
                                <h3 className="text-base font-bold mb-1 relative z-10">{model.name}</h3>
                                <p className="text-[11px] text-white/60 mb-3 relative z-10">{model.desc}</p>
                                <code className="text-[10px] text-white/80 bg-white/10 px-2 py-1 rounded block">{model.formula}</code>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Model Radar Comparison */}
                <motion.div id="performance-compare" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Model Performance Comparison</h2>
                    <p className="text-gray-500 mb-8">GARCH vs TGARCH vs HAR-TGARCH-X 다차원 비교</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={350}>
                                <RadarChart data={RADAR_DATA}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="metric" fontSize={11} tick={{ fill: '#666' }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={9} tick={{ fill: '#999' }} />
                                    <Radar name="GARCH(1,1)" dataKey="GARCH" stroke="#4a6ad4" fill="#4a6ad4" fillOpacity={0.15} strokeWidth={2} />
                                    <Radar name="TGARCH" dataKey="TGARCH" stroke="#2b4fcb" fill="#2b4fcb" fillOpacity={0.15} strokeWidth={2} />
                                    <Radar name="HAR-TGARCH-X" dataKey="HAR_TGARCH_X" stroke="#1b3fab" fill="#1b3fab" fillOpacity={0.15} strokeWidth={2} />
                                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">GARCH(1,1) Parameters</h3>
                            <div className="space-y-4 mb-6">
                                {[
                                    { label: 'ω (omega)', value: '9.384e-03', desc: '상수항' },
                                    { label: 'α (alpha)', value: '0.0538', desc: 'ARCH 효과' },
                                    { label: 'β (beta)', value: '0.8351', desc: 'GARCH 지속성' },
                                    { label: 'γ (gamma)', value: '0.0990', desc: 'TGARCH 레버리지' },
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-bold text-gray-900">{p.label}</span>
                                            <span className="text-xs text-gray-400 ml-2">{p.desc}</span>
                                        </div>
                                        <code className="text-sm font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">{p.value}</code>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    <strong>α + β = 0.889</strong> → 1에 가까워 변동성 지속성이 높음<br />
                                    <strong>γ = 0.099</strong> → 하락 시 변동성이 약 10% 추가 증가 (레버리지 효과)
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Key Findings */}
                <motion.div id="findings" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Key Findings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'FNG 지수 유의성', desc: '비트코인 수익률과 FNG 지수의 상관계수 0.72, p-value 2.2e-16으로 매우 유의', tag: 'p < 0.001' },
                            { title: 'TGARCH 레버리지', desc: 'γ=0.099 → 하락 시 변동성이 상승 시보다 약 10% 더 크게 증가', tag: 'γ = 0.099' },
                            { title: 'HAR 다중 스케일', desc: '1일/7일/30일 변동성 구조가 단·중·장기 패턴을 효과적으로 포착', tag: 'Multi-scale' },
                            { title: '외생변수 보완 효과', desc: 'Volume(거래 강도)과 FNG(심리)는 상관 낮아 보완적 정보 제공, 동시 투입 유효', tag: 'Vol+FNG' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{idx + 1}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">{item.tag}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ EXOGENOUS VARIABLES DETAIL ═══ */}
                <motion.div id="exogenous" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Exogenous Variables</h2>
                    <p className="text-gray-500 mb-8">경제적 요인과 심리적 요인의 그레인저 인과관계 검정 결과</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">심리적 요인 — Fear & Greed Index</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">비트코인 시장의 현재 심리를 0~100 범위로 압축한 지수. 투자자와 거래자가 합리적인 결정을 내리는 지표로 활용됩니다.</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: '공포', range: '0~24', color: '#ef4444' },
                                    { label: '중립', range: '25~49', color: '#d4a03c' },
                                    { label: '탐욕', range: '50~100', color: '#10b981' },
                                ].map((item, i) => (
                                    <div key={i} className="text-center p-2 rounded-lg" style={{ backgroundColor: item.color + '15' }}>
                                        <p className="text-xs font-bold" style={{ color: item.color }}>{item.label}</p>
                                        <p className="text-[10px] text-gray-500">{item.range}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">Granger Causality 검정</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 font-semibold text-gray-700">변수</th>
                                        <th className="text-right py-2 font-semibold text-gray-700">p-value</th>
                                        <th className="text-center py-2 font-semibold text-gray-700">유의</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Price (종가)', p: '0.0000', sig: true },
                                        { name: 'Volume (거래량)', p: '0.0000', sig: true },
                                        { name: 'FNG (공포탐욕)', p: '0.2472', sig: false },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2.5 text-gray-800 font-medium">{row.name}</td>
                                            <td className={`py-2.5 text-right font-bold ${row.sig ? 'text-[#2b4fcb]' : 'text-gray-400'}`}>{row.p}</td>
                                            <td className="py-2.5 text-center">{row.sig ? <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2b4fcb]/10 text-[#2b4fcb] rounded">유의</span> : <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-400 rounded">비유의</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-400 mt-3">Price와 Volume은 비트코인에 유의한 영향. FNG는 직접적 그레인저 인과관계는 없으나 상관관계(r=0.72)는 강함.</p>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ MODEL PERFORMANCE TABLE ═══ */}
                <motion.div id="performance" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Model Performance</h2>
                    <p className="text-gray-500 mb-8">Out-of-Sample (2023.01~2023.11) 예측 성능 비교 — 실제 실험 결과</p>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 font-bold text-gray-700">Model</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">MSE</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">RMSE</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">MAPE</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">MAE</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">R²</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'GARCH(1,1)', mse: '0.000170', rmse: '0.013051', mape: '4.605', mae: '0.005091', r2: '0.7809', best: false },
                                        { name: 'GARCH + Volume', mse: '0.000217', rmse: '0.014738', mape: '6.406', mae: '0.005766', r2: '0.8991', best: false },
                                        { name: 'TGARCH', mse: '0.000122', rmse: '0.011029', mape: '4.392', mae: '0.004525', r2: '0.7181', best: false },
                                        { name: 'TGARCH + Volume', mse: '0.000279', rmse: '0.016712', mape: '6.519', mae: '0.006541', r2: '0.8887', best: true },
                                        { name: 'TGARCH + Price', mse: '0.000278', rmse: '0.016678', mape: '6.509', mae: '0.006528', r2: '0.8888', best: false },
                                        { name: 'HAR-GARCH', mse: '0.000001', rmse: '0.000870', mape: '10.513', mae: '0.000235', r2: '0.0232', best: false },
                                    ].map((row, i) => (
                                        <tr key={i} className={`border-b border-gray-50 last:border-0 ${row.best ? 'bg-[#2b4fcb]/5' : ''}`}>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">{row.name}</span>
                                                    {row.best && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#2b4fcb] text-white rounded">BEST</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{row.mse}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{row.rmse}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{row.mape}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{row.mae}</td>
                                            <td className={`px-4 py-3 text-right font-mono text-xs font-bold ${parseFloat(row.r2) > 0.85 ? 'text-[#2b4fcb]' : 'text-gray-600'}`}>{row.r2}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ CONCLUSION ═══ */}
                <motion.div id="conclusion" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Conclusion</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {[
                            { title: 'GARCH vs TGARCH', desc: '변동성의 극점을 더욱 민감하게 예측한 모형은 GARCH이고, 전반적으로 안정적인 변동성 예측 모형은 TGARCH입니다.', tag: '비대칭 효과' },
                            { title: 'GARCH+E.V vs TGARCH+E.V', desc: '두 모델 다 급격한 가격 변동이 예상되는 상황에서 비슷한 성능을 확인. TGARCH 모델이 전반적으로 더 높은 변동성을 예측합니다.', tag: '외생변수 효과' },
                            { title: '레버리지 효과 확인', desc: 'TGARCH의 비대칭 계수 γ=0.099로, 하락 충격이 상승 충격보다 변동성을 약 10% 더 증가시킴을 실증했습니다.', tag: '핵심 발견' },
                            { title: '투자 시사점', desc: '변동성 예측 모형을 통해 투자자 보호에 기여하고, 비트코인 시장을 더 이해하고 예측함으로써 시장 효율성을 증진시키고자 합니다.', tag: '기대 효과' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#2b4fcb] text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{idx + 1}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">{item.tag}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>


                {/* My Contributions */}
                <motion.div id="contributions" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>My Contributions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CRYPTO_CONTRIBUTIONS.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#2b4fcb] text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{idx + 1}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.tag === 'Data' ? 'bg-blue-50 text-blue-700' : item.tag === 'Modeling' ? 'bg-indigo-50 text-indigo-700' : item.tag === 'Analysis' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>{item.tag}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
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

                {/* ═══ RESEARCH: Slides + Paper ═══ */}
                <CollapsibleSection id="presentation" title="Research" subtitle="발표 자료 + 연구 논문">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div><CryptoSlideViewer /></div>
                        <div><PaperViewer /></div>
                    </div>
                </CollapsibleSection>

                {/* Retrospective */}
                <motion.div id="retrospective" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Retrospective</h2>
                    <p className="text-gray-500 mb-6">프로젝트를 마치며</p>
                    <div className="space-y-4">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">핵심 인사이트</p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">01</span><span><strong className="text-gray-900">모형 복잡도 ≠ 예측력</strong> — HAR-TGARCH-X가 항상 최적은 아니었음. 시장 구간에 따라 GARCH(1,1)이 더 나은 경우도 존재.</span></li>
                                <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">02</span><span><strong className="text-gray-900">FNG 지수의 유의미한 상관</strong> — BTC-FNG 상관 0.72(p &lt; 2.2e-16). 감성 지표의 예측력 통계적 근거 확보.</span></li>
                                <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">03</span><span><strong className="text-gray-900">레버리지 효과 실증</strong> — TGARCH γ=0.099, 하락 시 변동성이 상승보다 약 10% 더 큼. CryptoVol Dashboard 모형 선택 근거.</span></li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">-</span><span>BTC 단일 코인 → 멀티코인 확장 (이후 개인 프로젝트에서 실현)</span></li>
                                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">-</span><span>Out-of-sample 검증 미흡 — 강세장/약세장 구간별 강건성 비교 필요</span></li>
                            </ul>
                        </div>
                        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                            <p className="text-sm text-gray-600 leading-relaxed italic" style={{ wordBreak: 'keep-all' }}>
                                변동성 예측은 단일 모형의 정확도가 아니라, 다양한 모형의 특성을 이해하고 시장 상황에 맞게 선택하는 판단력이 핵심이라는 것을 배운 프로젝트였습니다.
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
