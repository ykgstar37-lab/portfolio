import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import CollapsibleSection from '../components/CollapsibleSection';
import SectionDotNav from '../components/SectionDotNav';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const TOTAL_SLIDES = 40;
function SlideViewer() {
    const [current, setCurrent] = useState(1);
    const prev = () => setCurrent(c => Math.max(1, c - 1));
    const next = () => setCurrent(c => Math.min(TOTAL_SLIDES, c + 1));

    return (
        <motion.div className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Presentation Slides</h2>
            <p className="text-gray-500 mb-8">최종 발표 자료 — 화살표로 슬라이드를 넘겨보세요</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative">
                    <img
                        src={`/slides-seoul/slide-${String(current).padStart(2, '0')}.png`}
                        alt={`Slide ${current}`}
                        className="w-full h-auto"
                    />
                    {/* Left arrow */}
                    <button onClick={prev} disabled={current === 1}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {/* Right arrow */}
                    <button onClick={next} disabled={current === TOTAL_SLIDES}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                {/* Page indicator */}
                <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-50">
                    <span className="text-sm font-bold text-gray-900">{current}</span>
                    <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#d4a03c] rounded-full transition-all duration-300" style={{ width: `${(current / TOTAL_SLIDES) * 100}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-400">{TOTAL_SLIDES}</span>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Data ── */
const RAW_DATA = {
    '영화관': { '강남구': 27, '중구': 21, '종로구': 12, '마포구': 8, '서대문구': 8, '노원구': 6, '강서구': 5, '강북구': 5, '영등포구': 5, '광진구': 5, '구로구': 4, '서초구': 4, '성북구': 4, '송파구': 4, '용산구': 4, '은평구': 4, '강동구': 3, '동작구': 3, '중랑구': 3, '관악구': 2, '금천구': 2, '양천구': 2, '성동구': 2, '도봉구': 2, '동대문구': 1 },
    '공연시설': { '종로구': 162, '중구': 38, '마포구': 33, '강남구': 27, '서초구': 26, '송파구': 15, '용산구': 12, '광진구': 11, '성북구': 11, '성동구': 10, '구로구': 9, '강동구': 8, '서대문구': 8, '양천구': 8, '관악구': 6, '강북구': 5, '도봉구': 5, '영등포구': 4, '노원구': 3, '강서구': 3, '금천구': 2, '중랑구': 2, '동대문구': 1, '동작구': 1, '은평구': 1 },
    '박물관/유적지': { '강남구': 42, '종로구': 21, '도봉구': 19, '노원구': 14, '서초구': 9, '관악구': 6, '성동구': 4, '은평구': 3, '강동구': 3, '금천구': 2, '서대문구': 2, '마포구': 2, '송파구': 2, '용산구': 2, '강북구': 1, '강서구': 1, '구로구': 1, '성북구': 1, '양천구': 1, '영등포구': 1, '중구': 1 },
    '방탈출': { '마포구': 85, '강남구': 64, '광진구': 38, '서대문구': 26, '관악구': 14, '종로구': 14, '노원구': 8, '송파구': 6, '강북구': 4, '동작구': 4, '성북구': 4, '강동구': 2, '구로구': 2, '동대문구': 2, '서초구': 2, '성동구': 2, '영등포구': 2, '은평구': 2, '중구': 2 },
    '공원': { '마포구': 20, '구로구': 14, '강동구': 12, '노원구': 12, '동작구': 12, '송파구': 9, '강남구': 8, '강서구': 8, '광진구': 8, '영등포구': 8, '강북구': 6, '도봉구': 6, '동대문구': 6, '성동구': 6, '양천구': 6, '관악구': 4, '금천구': 4, '서초구': 4, '성북구': 2, '용산구': 1, '중구': 1, '중랑구': 1 },
    '전통사찰': { '종로구': 12, '성북구': 10, '강북구': 8, '서대문구': 5, '은평구': 5, '관악구': 4, '도봉구': 4, '강서구': 3, '노원구': 3, '동대문구': 2, '동작구': 2, '강남구': 1, '금천구': 1, '서초구': 1, '성동구': 1 },
};

const CATEGORIES = Object.keys(RAW_DATA);
const COLORS = ['#d4a03c', '#e07c4a', '#2b9e8f', '#6c7eb7', '#7a9e3b', '#c46b6b'];

const getTop10 = (cat) => Object.entries(RAW_DATA[cat]).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));

const TOTAL_BY_DISTRICT = {};
Object.values(RAW_DATA).forEach(cat => Object.entries(cat).forEach(([d, v]) => { TOTAL_BY_DISTRICT[d] = (TOTAL_BY_DISTRICT[d] || 0) + v; }));
const TOP_DISTRICTS = Object.entries(TOTAL_BY_DISTRICT).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, value]) => ({ name, value }));

const PIE_DATA = CATEGORIES.map((cat, i) => ({ name: cat, value: Object.values(RAW_DATA[cat]).reduce((a, b) => a + b, 0), color: COLORS[i] }));

/* Map markers — top districts with coordinates */
const MAP_MARKERS = [
    { name: '종로구', lat: 37.5735, lng: 126.9790, value: 162, label: '공연시설 162개', color: '#e07c4a', r: 28 },
    { name: '마포구', lat: 37.5663, lng: 126.9014, value: 85, label: '방탈출 85개', color: '#6c7eb7', r: 22 },
    { name: '강남구', lat: 37.4979, lng: 127.0276, value: 42, label: '박물관 42개', color: '#2b9e8f', r: 18 },
    { name: '중구', lat: 37.5641, lng: 126.9979, value: 21, label: '영화관 21개', color: '#d4a03c', r: 14 },
    { name: '서초구', lat: 37.4837, lng: 127.0324, value: 26, label: '공연시설 26개', color: '#7a9e3b', r: 15 },
];

/* Cluster results from K-means (k=3) */
const CLUSTERS = [
    {
        id: 1, name: '군집 1', color: '#d4a03c', tag: '일반 관광',
        districts: ['강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '서대문구', '성동구', '성북구', '송파구', '양천구', '영등포구', '은평구', '중랑구'],
        desc: '대체적으로 모든 변수에서 평균값이 낮아 특화된 관광 특성을 파악하기 어려웠습니다.',
    },
    {
        id: 2, name: '군집 2', color: '#e07c4a', tag: '한류 · 쇼핑 · 먹거리',
        districts: ['강남구', '마포구', '용산구', '중구'],
        desc: '한류, 쇼핑·먹거리 분야에서 평균값이 높아 한류 및 쇼핑·먹거리에 특화된 관광 군집으로 해석했습니다.',
    },
    {
        id: 3, name: '군집 3', color: '#2b9e8f', tag: '역사 · 체험 · 휴양 · 자연',
        districts: ['종로구', '서초구'],
        desc: '역사·체험, 휴양·자연 분야에서 평균값이 높아 역사·체험 및 휴양·자연에 특화된 관광 군집으로 해석했습니다.',
    },
];

/* Radar for top 5 districts */
const RADAR_DISTRICTS = ['강남구', '종로구', '마포구', '서초구', '중구'];
const RADAR_DATA = CATEGORIES.map(cat => {
    const row = { category: cat };
    RADAR_DISTRICTS.forEach(d => { row[d] = RAW_DATA[cat][d] || 0; });
    return row;
});
const RADAR_COLORS = ['#d4a03c', '#e07c4a', '#6c7eb7', '#2b9e8f', '#7a9e3b'];

const PRIMARY = '#d4a03c';

const SEOUL_CONTRIBUTIONS = [
    { title: '데이터 수집 및 전처리', desc: '서울시 공공데이터 포털에서 6개 카테고리 문화·여가시설 데이터 수집. 결측치 처리(mice 패키지) 및 변수 정규화 수행.', tag: 'Data' },
    { title: '탐색적 데이터 분석(EDA)', desc: '25개 자치구별 문화시설 현황 시각화. ggplot2 기반 분포도, 상관분석, 카테고리별 Top 10 자치구 분석.', tag: 'Analysis' },
    { title: 'K-means 군집분석 설계', desc: 'NbClust 패키지로 최적 군집 수(k=5) 결정. PCA·MDS 차원 축소를 통한 군집 시각화 및 해석.', tag: 'Analysis' },
    { title: '관광 목적별 지역구 매칭', desc: '군집별 문화시설 특성을 분석하여 관광 목적(문화체험, 예술관람 등)에 맞는 지역구 추천 로직 설계.', tag: 'Analysis' },
    { title: '발표 자료 제작', desc: '학술제 발표용 슬라이드 제작 및 분석 결과 스토리텔링. 2등상 수상.', tag: 'Presentation' },
];

const SECTIONS = [
    { id: 'background', label: 'Research Background' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'variables', label: 'Data Variables' },
    { id: 'eda', label: 'EDA Process' },
    { id: 'correlation', label: 'Correlation & Distribution' },
    { id: 'cluster', label: 'Cluster Analysis Results' },
    { id: 'validation', label: 'Cluster Validation' },
    { id: 'map', label: 'Seoul District Map' },
    { id: 'explorer', label: 'District Explorer' },
    { id: 'category', label: 'Category Distribution' },
    { id: 'profile', label: 'District Profile Comparison' },
    { id: 'findings', label: 'Key Findings' },
    { id: 'contributions', label: 'My Contributions' },
    { id: 'tech', label: 'Tech Stack' },
    { id: 'presentation', label: 'Research', highlight: true },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
];

export default function SeoulCulture() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('영화관');
    useEffect(() => { const hash = window.location.hash; if (hash) { setTimeout(() => { const el = document.querySelector(hash); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 500); } else { window.scrollTo(0, 0); } }, []);

    return (
        <div className="bg-gradient-to-b from-white to-[#f9f9f9] min-h-screen text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* Back */}
                <motion.button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition mb-12 group" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    All Projects
                </motion.button>

                {/* ═══ HERO ═══ */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-20">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full tracking-wider uppercase">학술제 2023</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Team — 통계 모임</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2023.09 — 2023.11</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full tracking-wider uppercase flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>2nd Place</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        외국인에게 관광목적에 맞는 <span className="text-[#d4a03c]">지역구 제안</span>
                    </h1>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">
                        위드 코로나 이후 빠르게 늘어난 외국인 관광 수요를 데이터로 해석하기 위해, 서울특별시 25개 자치구의 관광 시설을 정량화하고 군집분석으로 관광 목적별 추천 단위를 설계했습니다. 단순 현황 정리가 아니라 추천 가능한 기준을 만드는 데 초점을 둔 프로젝트입니다.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <a href="https://www.notion.so/2023-27fbec2d3d51809bb7d7e69f958f3103" target="_blank" rel="noopener noreferrer"
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

                {/* ═══ OVERVIEW STATS ═══ */}
                <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20" initial="hidden" animate="visible" variants={stagger}>
                    {[
                        { label: '분석 자치구', value: '25개', sub: '서울 전체' },
                        { label: '변수 대분류', value: '5개', sub: '한류/역사·체험/휴양·자연/쇼핑/편의' },
                        { label: '군집 수 (K)', value: '3개', sub: 'K-means 최적 k' },
                        { label: 'PCA 설명력', value: '91.3%', sub: 'PC1 71.85% + PC2 19.41%' },
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
                                <p className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest mb-2">Overview</p>
                                <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    서울시 25개 자치구 관광시설 데이터를 군집분석해 외국인 관광객에게 목적별 지역구를 추천하는 팀 연구 프로젝트입니다. NbClust+Silhouette로 최적 k=3을 결정하고 PCA 설명력 91.3%를 확보해, 추천 로직의 기준이 되는 지역 특성 벡터를 해석 가능하게 만들었습니다. 이후 Seoul Culture Map 서비스로 확장된 분석 기반입니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
                                <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    공공데이터 수집·전처리, NbClust+Silhouette 군집분석, PCA 차원축소, 인터랙티브 시각화, 발표 자료 작성.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {['R', 'dplyr', 'ggplot2', 'NbClust', 'PCA', 'K-means', '공공데이터'].map(t => (
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
                    <p className="text-gray-500 mb-8">위드 코로나 이후 외국인 관광객 급증 — 왜 서울 자치구별 분석이 필요한가</p>

                    {/* Timeline */}
                    <div className="relative mb-10">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { year: '2019.3', stat: '기준점', desc: '코로나 이전 관광 정상 수준', color: '#6c7eb7' },
                                { year: '2023.3', stat: '45% 회복', desc: '2019년 동기간 대비 45% 회복\n누적 방문 입국자 17.1M', color: '#e07c4a' },
                                { year: '2023.6', stat: '90% 회복', desc: '전 세계 항공 권역 예상 회복률\n2019년 대비 약 90%', color: '#d4a03c' },
                                { year: '2024 하반기', stat: '100% 전망', desc: '글로벌 항공 정보 제공업체 OAG\n완전 회복 전망', color: '#2b9e8f' },
                            ].map((item, i) => (
                                <div key={i} className="relative bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                                    <div className="w-3 h-3 rounded-full mx-auto mb-3 hidden md:block" style={{ backgroundColor: item.color }}></div>
                                    <p className="text-xs font-bold text-gray-400 mb-1">{item.year}</p>
                                    <p className="text-xl font-bold mb-1" style={{ color: item.color }}>{item.stat}</p>
                                    <p className="text-xs text-gray-500 whitespace-pre-line">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#d4a03c]/10 flex items-center justify-center text-lg">🌏</div>
                                <div>
                                    <p className="text-2xl font-bold text-[#d4a03c]">78.9%</p>
                                    <p className="text-xs font-bold text-gray-400">관광 목적 입국 비율</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">2023년 기준 입국 외국인의 78.9%가 관광 목적으로 한국을 방문. 2022년(50%) 대비 크게 증가했습니다.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#e07c4a]/10 flex items-center justify-center text-lg">🎵</div>
                                <div>
                                    <p className="text-2xl font-bold text-[#e07c4a]">160M</p>
                                    <p className="text-xs font-bold text-gray-400">한류 콘텐츠 팬덤</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">한류 팬덤이 67M(2012)에서 160M(2021)으로 성장. 이용자 64%가 한국 방문 의향, 66.1%가 한류를 통해 관심을 갖게 되었다고 응답했습니다.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-[#2b9e8f]/10 flex items-center justify-center text-lg">🏙️</div>
                                <div>
                                    <p className="text-2xl font-bold text-[#2b9e8f]">81.8%</p>
                                    <p className="text-xs font-bold text-gray-400">서울 선호 비율</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">한국여행인지역 조사에서 서울이 81.8%로 압도적 1위. 선호 관광지 1위 명동, 2위 홍대, 3위 경복궁으로 나타났습니다.</p>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ METHODOLOGY PIPELINE ═══ */}
                <motion.div id="methodology" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Methodology</h2>
                    <p className="text-gray-500 mb-8">분석방법론 3단계 플로우</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                step: '01', title: '데이터 선정', color: 'border-[#8c7851]',
                                items: ['문제정의 및 관광연구 논문 참조', '대분류: 한류 / 역사·체험 / 휴양·자연 / 쇼핑·먹거리 / 편의시설', '공공데이터 5종 수집 및 변수 설정']
                            },
                            {
                                step: '02', title: 'EDA', color: 'border-[#7b8a96]',
                                items: ['희소데이터(0 과다) 삭제 및 왜도 조정', '결측값 대체: 예측평균법', '상관관계 히트맵 및 박스플롯 시각화', '다차원척도법(MDS)을 통한 객체간 관계 파악']
                            },
                            {
                                step: '03', title: '군집분석', color: 'border-[#9b7878]',
                                items: ['계층적 군집분석 (Ward.D / Complete / Average)', 'K-means 군집분석 (Silhouette, WSS)', 'PCA 차원축소 후 군집 시각화', '지수변환(루트→원데이터) 후 군집 결과 해석']
                            },
                        ].map((phase, idx) => (
                            <div key={idx} className="relative">
                                <div className={`bg-white p-6 rounded-2xl border-t-4 ${phase.color} shadow-sm h-full`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">{phase.step}</div>
                                        <h3 className="text-xl font-bold">{phase.title}</h3>
                                    </div>
                                    <ul className="space-y-2.5">
                                        {phase.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {idx < 2 && (
                                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-gray-400">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ DATA VARIABLES ═══ */}
                <motion.div id="variables" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Data Variables</h2>
                    <p className="text-gray-500 mb-8">관광 논문을 참조하여 5개 대분류, 세부 변수를 설정하고 공공데이터를 수집했습니다</p>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-5 py-3 font-bold text-gray-700 w-1/5">대분류</th>
                                    <th className="text-left px-5 py-3 font-bold text-gray-700">세부 변수</th>
                                    <th className="text-left px-5 py-3 font-bold text-gray-700 w-1/4">집계 방식</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { cat: '한류', color: '#d4a03c', vars: '공연장/극장, 영화관, 방탈출, 한옥마을', agg: '지역구별 합계' },
                                    { cat: '역사 · 체험', color: '#e07c4a', vars: '지역축제, 박물관/유적지, 스파/체험', agg: '지역구별 합계' },
                                    { cat: '휴양 · 자연', color: '#2b9e8f', vars: '공원, 등산코스, 사찰', agg: '지역구별 합계' },
                                    { cat: '쇼핑 · 먹거리', color: '#6c7eb7', vars: '전통시장, 쇼핑센터, 골목상권, 먹거리골목', agg: '지역구별 합계 (백화점, 면세점만 집계)' },
                                    { cat: '편의시설', color: '#7a9e3b', vars: '관광안내소, 숙박시설, 물품보관소', agg: '영/일/중/러시아어 순 가중치 후 합계' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }}></div>
                                                <span className="font-semibold text-gray-900">{row.cat}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{row.vars}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{row.agg}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {['공공데이터포털', '서울열린데이터광장', '문화빅데이터플랫폼'].map(src => (
                            <span key={src} className="text-[11px] font-medium px-3 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">{src}</span>
                        ))}
                        <span className="text-[11px] font-medium px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">기준년도: 2022</span>
                    </div>
                </motion.div>

                {/* ═══ EDA DETAILS ═══ */}
                <motion.div id="eda" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>EDA Process</h2>
                    <p className="text-gray-500 mb-8">탐색적 데이터 분석 상세 과정</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: '희소데이터 삭제', desc: '한옥(17개), 안내소(11개), 사찰(10개), 방탈출(6개)은 0의 개수가 과다하여 군집분석에 의미 없다고 판단하여 제거했습니다.', tag: 'NZV' },
                            { title: '왜도 조정 (루트 변환)', desc: '공연극장(왜도 3.76), 박물관유적지(2.35), 영화관(2.33)은 이상치가 극단적이어서 루트 변환으로 왜도를 조정했습니다.', tag: 'Skewness' },
                            { title: '결측값 대체', desc: '박물관유적지와 쇼핑센터의 결측값을 예측평균법으로 대체했습니다. 같은 대분류 변수를 활용하여 대체했습니다.', tag: 'Imputation' },
                            { title: '다차원척도법 (MDS)', desc: '유클리디안 거리행렬 기반으로 객체간 관계를 시각화한 결과, 강북구·도봉구·종로구가 동떨어져 비슷한 특징이 있을 것으로 사전 예측했습니다.', tag: 'MDS' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">{item.tag}</span>
                                    <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ CORRELATION & SKEWNESS ═══ */}
                <motion.div id="correlation" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Correlation & Distribution</h2>
                    <p className="text-gray-500 mb-8">변수 간 상관관계 및 왜도 분석 — 루트 변환 대상 변수 선정 근거</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Correlation highlights */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">주요 상관관계</h3>
                            <div className="space-y-3">
                                {[
                                    { v1: '한옥', v2: '공연극장', corr: 0.93, desc: '강한 양의 상관성 — 전통 문화 인프라 동반 분포' },
                                    { v1: '박물관유적지', v2: '등산코스', corr: 0.72, desc: '역사·자연 시설이 함께 분포' },
                                    { v1: '쇼핑센터', v2: '영화관', corr: 0.65, desc: '상업시설 밀집 지역 동반 입지' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70">
                                        <div className="flex-shrink-0 text-center">
                                            <div className={`text-lg font-bold ${item.corr >= 0.8 ? 'text-[#c46b6b]' : item.corr >= 0.7 ? 'text-[#e07c4a]' : 'text-[#d4a03c]'}`}>{item.corr.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{item.v1} ↔ {item.v2}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Skewness table */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">왜도 분석 — 루트 변환 대상</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2 font-semibold text-gray-700">변수</th>
                                        <th className="text-right py-2 font-semibold text-gray-700">왜도</th>
                                        <th className="text-right py-2 font-semibold text-gray-700">첨도</th>
                                        <th className="text-center py-2 font-semibold text-gray-700">변환</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: '공연극장', skew: 3.76, kurt: 14.20, transform: true },
                                        { name: '박물관유적지', skew: 2.54, kurt: 6.34, transform: true },
                                        { name: '영화관', skew: 2.33, kurt: 4.82, transform: true },
                                        { name: '쇼핑센터', skew: 1.45, kurt: 1.12, transform: false },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0">
                                            <td className="py-2.5 font-medium text-gray-800">{row.name}</td>
                                            <td className={`py-2.5 text-right font-bold ${row.skew > 2 ? 'text-[#c46b6b]' : 'text-[#d4a03c]'}`}>{row.skew.toFixed(2)}</td>
                                            <td className="py-2.5 text-right text-gray-500">{row.kurt.toFixed(2)}</td>
                                            <td className="py-2.5 text-center">{row.transform ? <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e07c4a]/10 text-[#e07c4a] rounded">√ 변환</span> : <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-400 rounded">유지</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-xs text-gray-400 mt-3">왜도 {">"} 1인 변수를 루트 변환하여 이상치 영향을 완화했습니다</p>
                        </div>
                    </div>

                    {/* MDS */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-[#2b9e8f]/10 text-[#2b9e8f] rounded-md">MDS</span>
                            <h3 className="text-base font-bold text-gray-900">다차원척도법 — 자치구 간 거리 시각화</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 bg-gray-50/50 rounded-xl p-5">
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">유클리디안 거리행렬을 기반으로 25개 자치구의 상대적 위치를 2차원으로 축소 시각화했습니다.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: '동떨어진 자치구', value: '강북구, 도봉구, 종로구', desc: '다른 자치구와 거리가 먼 3개 구가 비슷한 특징을 공유할 것으로 예측', color: '#c46b6b' },
                                        { label: '밀집 자치구', value: '대다수 자치구', desc: '유사한 관광 인프라 수준으로 하나의 큰 군집 형성 예상', color: '#6c7eb7' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white p-3 rounded-lg border border-gray-100">
                                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: item.color }}>{item.label}</p>
                                            <p className="text-sm font-bold text-gray-900 mb-1">{item.value}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center gap-3">
                                <div className="p-4 rounded-xl border-2 border-dashed border-[#2b9e8f]/30 bg-[#2b9e8f]/5 text-center">
                                    <p className="text-xs font-bold text-[#2b9e8f] mb-1">사전 예측 결과</p>
                                    <p className="text-sm text-gray-700 font-semibold">3개 그룹 형태 예상</p>
                                    <p className="text-xs text-gray-500 mt-1">→ 실제 K-means k=3 결과와 일치</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 text-center">
                                    <p className="text-xs font-bold text-gray-400 mb-1">분석 도구</p>
                                    <p className="text-sm text-gray-700">R — cmdscale()</p>
                                    <p className="text-xs text-gray-500">공분산행렬 → 유클리디안 거리</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ CLUSTER ANALYSIS RESULTS ═══ */}
                <motion.div id="cluster" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Cluster Analysis Results</h2>
                    <p className="text-gray-500 mb-8">K-means (k=3) 군집분석 결과 — Ward.D 계층적 군집분석과 동일한 결과를 확인하여 채택했습니다</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {CLUSTERS.map((cluster) => (
                            <motion.div key={cluster.id} whileHover={{ y: -4 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-default">
                                <div className="h-2" style={{ backgroundColor: cluster.color }}></div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: cluster.color }}>{cluster.id}</div>
                                        <h3 className="text-lg font-bold">{cluster.name}</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md ml-auto" style={{ backgroundColor: cluster.color + '20', color: cluster.color }}>{cluster.tag}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{cluster.desc}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {cluster.districts.map(d => (
                                            <span key={d} className="text-[11px] font-medium px-2 py-0.5 bg-gray-50 text-gray-600 rounded">{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-6 p-5 bg-gray-50 rounded-2xl">
                        <div className="flex flex-wrap gap-6 text-sm">
                            <div><span className="font-bold text-gray-900">Silhouette & WSS →</span> <span className="text-gray-500">적정 k = 3, 4 확인</span></div>
                            <div><span className="font-bold text-gray-900">PCA →</span> <span className="text-gray-500">PC1 71.85% + PC2 19.41% = 91.26% 설명력</span></div>
                            <div><span className="font-bold text-gray-900">NbClust →</span> <span className="text-gray-500">ward.D, complete, average 모두 k=3 추천</span></div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ HIERARCHICAL + K-MEANS DETAIL ═══ */}
                <motion.div id="validation" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Cluster Validation</h2>
                    <p className="text-gray-500 mb-8">계층적 군집분석 3종과 K-means 결과 비교 — 일관된 k=3 도출</p>

                    {/* Hierarchical comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {[
                            { method: 'Ward.D', c1: 13, c2: 9, c3: 3, note: '군집1/2/3이 균등 분배', highlight: true },
                            { method: 'Complete', c1: 11, c2: 11, c3: 3, note: '광진구 경계 애매 — 군집1↔2', highlight: false },
                            { method: 'Average', c1: 12, c2: 10, c3: 3, note: '광진구·서대문구 경계 애매', highlight: false },
                        ].map((m, i) => (
                            <div key={i} className={`bg-white p-5 rounded-2xl border shadow-sm ${m.highlight ? 'border-[#d4a03c] ring-1 ring-[#d4a03c]/20' : 'border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-900">{m.method}</h3>
                                    {m.highlight && <span className="text-[9px] font-bold px-2 py-0.5 bg-[#d4a03c]/10 text-[#d4a03c] rounded">채택</span>}
                                </div>
                                <div className="flex gap-2 mb-3">
                                    {[
                                        { label: '군집1', val: m.c1, color: '#d4a03c' },
                                        { label: '군집2', val: m.c2, color: '#e07c4a' },
                                        { label: '군집3', val: m.c3, color: '#2b9e8f' },
                                    ].map((c, j) => (
                                        <div key={j} className="flex-1 text-center p-2 rounded-lg" style={{ backgroundColor: c.color + '10' }}>
                                            <p className="text-lg font-bold" style={{ color: c.color }}>{c.val}개</p>
                                            <p className="text-[10px] text-gray-500">{c.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">{m.note}</p>
                            </div>
                        ))}
                    </div>

                    {/* Cluster mean scores */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-50">
                            <h3 className="text-base font-bold">군집별 평균점 비교</h3>
                            <p className="text-xs text-gray-500 mt-1">지수변환(루트→원데이터) 후 군집 평균점을 빼서 상대 비교한 결과입니다</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="text-left px-4 py-3 font-bold text-gray-700"></th>
                                        <th className="text-center px-3 py-3 font-semibold text-gray-600" colSpan={2}>한류</th>
                                        <th className="text-center px-3 py-3 font-semibold text-gray-600" colSpan={2}>역사 · 체험</th>
                                        <th className="text-center px-3 py-3 font-semibold text-gray-600" colSpan={3}>휴양 · 자연</th>
                                        <th className="text-center px-3 py-3 font-semibold text-gray-600" colSpan={2}>쇼핑 · 먹거리</th>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-4 py-2 text-xs text-gray-500"></th>
                                        {['공연극장', '영화관', '박물관유적지', '지역축제', '공원', '등산코스', '전통시장', '쇼핑센터', '골목상권'].map(h => (
                                            <th key={h} className="px-3 py-2 text-[10px] text-gray-500 font-medium text-center">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: '군집1', color: '#d4a03c', tag: '일반 관광', values: [-8.44, -2.84, -1.12, -3.92, -0.32, -30.76, 0.36, -1.2, -0.6] },
                                        { name: '군집2', color: '#e07c4a', tag: '한류·쇼핑', values: [-8.44, -0.84, -1.12, -4.92, 1.68, 6.24, 0.36, -0.2, 2.4] },
                                        { name: '군집3', color: '#2b9e8f', tag: '역사·자연', values: [-11.44, -0.84, 3.88, 12.08, -0.32, 67.24, -0.64, -2.2, -5.6] },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-0">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }}></div>
                                                    <span className="font-bold text-gray-900 text-xs">{row.name}</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: row.color + '15', color: row.color }}>{row.tag}</span>
                                                </div>
                                            </td>
                                            {row.values.map((v, j) => (
                                                <td key={j} className="px-3 py-3 text-center text-xs font-medium">
                                                    <span className={v > 3 ? 'text-[#2b9e8f] font-bold' : v < -3 ? 'text-[#c46b6b]' : 'text-gray-500'}>{v > 0 ? '+' : ''}{v.toFixed(1)}</span>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-3 bg-gray-50/50 flex gap-4 text-[10px] text-gray-500">
                            <span><span className="inline-block w-2 h-2 rounded-full bg-[#2b9e8f] mr-1"></span>높은 수준 ({">"} +3)</span>
                            <span><span className="inline-block w-2 h-2 rounded-full bg-[#c46b6b] mr-1"></span>낮은 수준 ({"<"} -3)</span>
                            <span className="text-gray-400">— 전체 평균 대비 상대 점수</span>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ MAP INFOGRAPHIC ═══ */}
                <motion.div id="map" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Seoul District Map</h2>
                    <p className="text-gray-500 mb-8">주요 자치구별 시설 분포 — 마커 크기는 시설 수에 비례합니다</p>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Progress bars */}
                        <div className="lg:col-span-3 flex flex-col gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Top Facilities</h3>
                                {[
                                    { name: '종로구', value: 162, max: 162, color: '#e07c4a', label: '공연시설' },
                                    { name: '마포구', value: 85, max: 162, color: '#6c7eb7', label: '방탈출' },
                                    { name: '강남구', value: 42, max: 162, color: '#2b9e8f', label: '박물관' },
                                ].map((item, i) => (
                                    <div key={i} className="mb-4 last:mb-0">
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span style={{ color: item.color }}>{item.name}</span>
                                            <span className="text-gray-900">{item.value}개</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div className="h-full rounded-full" style={{ backgroundColor: item.color, width: `${(item.value / item.max) * 100}%` }}
                                                initial={{ width: 0 }} whileInView={{ width: `${(item.value / item.max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.2 }} />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cluster Legend</h3>
                                {CLUSTERS.map(c => (
                                    <div key={c.id} className="flex items-center gap-2 py-1.5">
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }}></div>
                                        <span className="text-xs font-medium text-gray-700">{c.tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Center: Map */}
                        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 420 }}>
                            <MapContainer center={[37.5665, 126.978]} zoom={11} style={{ height: '100%', minHeight: 420 }} zoomControl={false} attributionControl={false}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                {MAP_MARKERS.map((m, i) => (
                                    <CircleMarker key={i} center={[m.lat, m.lng]} radius={m.r} pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 0.35, weight: 2 }}>
                                        <LeafletTooltip permanent direction="top" offset={[0, -m.r]} className="custom-tooltip">
                                            <span style={{ fontWeight: 700, fontSize: 11 }}>{m.name}</span><br />
                                            <span style={{ fontSize: 10, color: '#666' }}>{m.label}</span>
                                        </LeafletTooltip>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>

                        {/* Right: Info cards */}
                        <div className="lg:col-span-3 flex flex-col gap-4">
                            {[
                                { pct: '38%', district: '종로구', desc: '서울 공연시설의 38%가 집중된 문화 중심지입니다', color: '#e07c4a', icon: '🎭' },
                                { pct: '31%', district: '마포구', desc: '방탈출 시설의 31%가 홍대·합정 상권에 밀집되어 있습니다', color: '#6c7eb7', icon: '🔐' },
                                { pct: '31%', district: '강남구', desc: '박물관·유적지의 31%가 위치한 복합 문화 인프라 지역입니다', color: '#2b9e8f', icon: '🏛️' },
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-2xl">{card.icon}</div>
                                        <div>
                                            <span className="text-2xl font-bold" style={{ color: card.color }}>{card.pct}</span>
                                            <p className="text-xs font-bold text-gray-900">{card.district}</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ═══ INTERACTIVE CATEGORY EXPLORER ═══ */}
                <motion.div id="explorer" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>District Explorer</h2>
                    <p className="text-gray-500 mb-6">카테고리를 선택하면 자치구별 시설 분포를 확인할 수 있습니다</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {CATEGORIES.map((cat, i) => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedCategory === cat ? 'text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                style={selectedCategory === cat ? { backgroundColor: COLORS[i] } : {}}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={getTop10(selectedCategory)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" fontSize={11} tick={{ fill: '#999' }} />
                                <YAxis type="category" dataKey="name" fontSize={12} tick={{ fill: '#333', fontWeight: 600 }} width={80} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #eee', fontSize: '12px' }} formatter={(v) => [`${v}개`, selectedCategory]} />
                                <Bar dataKey="value" fill={COLORS[CATEGORIES.indexOf(selectedCategory)]} radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* ═══ TOTAL FACILITIES + PIE ═══ */}
                <motion.div id="category" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Category Distribution</h2>
                    <p className="text-gray-500 mb-8">카테고리별 전체 시설 수 및 자치구별 총량</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">카테고리별 비율</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                                        {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #eee', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold mb-4">자치구별 총 시설 수 (Top 12)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={TOP_DISTRICTS}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" fontSize={10} tick={{ fill: '#666' }} angle={-30} textAnchor="end" height={50} />
                                    <YAxis fontSize={10} tick={{ fill: '#999' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #eee', fontSize: '12px' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28}>
                                        {TOP_DISTRICTS.map((_, i) => <Cell key={i} fill={['#d4a03c', '#e07c4a', '#2b9e8f', '#6c7eb7', '#7a9e3b', '#c46b6b', '#d4a03c', '#e07c4a', '#2b9e8f', '#6c7eb7', '#7a9e3b', '#c46b6b'][i]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ RADAR ═══ */}
                <motion.div id="profile" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>District Profile Comparison</h2>
                    <p className="text-gray-500 mb-8">주요 5개 자치구의 카테고리별 시설 분포 비교</p>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={380}>
                            <RadarChart data={RADAR_DATA}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="category" fontSize={11} tick={{ fill: '#666' }} />
                                <PolarRadiusAxis fontSize={9} tick={{ fill: '#999' }} />
                                {RADAR_DISTRICTS.map((d, i) => (
                                    <Radar key={d} name={d} dataKey={d} stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                                ))}
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* ═══ KEY FINDINGS ═══ */}
                <motion.div id="findings" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Key Findings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Ward.D ≡ K-means 일치', desc: '계층적 군집분석(Ward.D)과 K-means 결과가 동일하게 나와 결과의 신뢰도를 확보했습니다.', tag: '검증' },
                            { title: '군집2: 한류·쇼핑 특화', desc: '강남구·마포구·용산구·중구는 한류 및 쇼핑·먹거리 분야에서 평균값이 높아 해당 목적의 관광객에게 추천했습니다.', tag: 'K-pop / Shopping' },
                            { title: '군집3: 역사·자연 특화', desc: '종로구·서초구는 역사·체험 및 휴양·자연 분야에서 평균값이 높아 문화탐방 목적의 관광객에게 추천했습니다.', tag: 'Culture / Nature' },
                            { title: 'PCA 시각화의 한계', desc: 'k=4일 때 PC2 설명력(19.41%)이 낮아 서초구와 종로구 해석이 어려웠고, 이를 근거로 k=3을 최종 선택했습니다.', tag: 'PCA' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{idx + 1}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">{item.tag}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ MY CONTRIBUTIONS ═══ */}
                <motion.div id="contributions" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>My Contributions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SEOUL_CONTRIBUTIONS.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#d4a03c] text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{idx + 1}</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.tag === 'Data' ? 'bg-amber-50 text-amber-700' : item.tag === 'Analysis' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>{item.tag}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ TECH STACK ═══ */}
                <motion.div id="tech" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Tech Stack</h2>
                    <div className="space-y-6">
                        {Object.entries({
                            'Analysis': ['R', 'dplyr', 'K-means', 'PCA', 'MDS'],
                            'Packages': ['NbClust', 'factoextra', 'mice', 'ggplot2'],
                            'Data': ['CSV (공공데이터)'],
                        }).map(([category, items]) => (
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

                {/* ═══ RESEARCH: Slides ═══ */}
                <CollapsibleSection id="presentation" title="Research" subtitle="발표 자료">
                    <SlideViewer />
                </CollapsibleSection>

                {/* Retrospective */}
                <motion.div id="retrospective" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Retrospective</h2>
                    <p className="text-gray-500 mb-6">프로젝트를 마치며</p>
                    <div className="space-y-4">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-3">핵심 인사이트</p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">01</span>
                                    <span><strong className="text-gray-900">통계적 최적 ≠ 도메인 최적</strong> — NbClust가 제안한 k값과 실제 관광 맥락에서 의미 있는 군집이 일치하지 않았음. 통계적 유의성과 해석 가능성 사이에서 도메인 지식으로 보완하는 과정을 경험</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">02</span>
                                    <span><strong className="text-gray-900">EDA 과정에서의 판단력</strong> — 희소 데이터(전통사찰) 제거, 왜도 보정(log 변환), 결측값 처리 등 데이터 전처리의 각 단계에서 "왜 이렇게 하는가"를 근거 있게 설명하는 훈련. PCA 91.3% 분산 설명력으로 차원 축소의 유효성을 검증</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">03</span>
                                    <span><strong className="text-gray-900">분석은 숫자가 아닌 스토리텔링</strong> — 군집 결과를 "관광 목적별 추천"으로 재해석하여 2등상을 수상. 같은 분석이라도 전달 방식에 따라 가치가 달라진다는 것을 체감, 이후 Seoul Culture Map 웹 서비스로 확장하는 동기가 됨</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>2023년 기준 정적 CSV 데이터 — 시간이 지나면 노후화되는 한계 (이후 Seoul Culture Map에서 공공 API 연동으로 해결)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>R 스크립트 기반 — 재현성과 공유가 어려움. Python이나 웹 기반이었으면 더 많은 사람이 활용할 수 있었을 것</span>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                            <p className="text-sm text-gray-600 leading-relaxed italic" style={{ wordBreak: 'keep-all' }}>
                                통계 분석 결과를 시각화하여 발표한 경험이, 이후 Seoul Culture Map 웹 서비스 확장의 출발점이 되었습니다. 데이터는 분석에서 끝나는 것이 아니라 전달될 때 가치가 생긴다는 것을 처음 느낀 프로젝트였습니다.
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
