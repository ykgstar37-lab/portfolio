import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import SectionDotNav from '../components/SectionDotNav';

import cmMain from '../assets/culturemap/culturemap-main.png';
import cmAnalytics from '../assets/culturemap/culturemap-analytics.png';
import cmCourse from '../assets/culturemap/culturemap-course.png';
import cmFavorites from '../assets/culturemap/culturemap-favorites.png';
import cmSubway from '../assets/culturemap/culturemap-subway.png';
import cmAi from '../assets/culturemap/culturemap-ai.png';
import cmAnalyticsModes from '../assets/culturemap/culturemap-analytics-modes.gif';
import cmCourseAi from '../assets/culturemap/culturemap-course-ai.gif';
import cmExplore from '../assets/culturemap/culturemap-explore.gif';
import cmSubwayGif from '../assets/culturemap/culturemap-subway.gif';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const PRIMARY = '#0ea5e9';

const FEATURES = [
    {
        title: 'Culture Map — 인터랙티브 시설 탐색',
        desc: 'Leaflet 기반 서울시 25개 자치구 지도. 7개 카테고리 시설 마커, 사진+상세 정보 팝업, 즐겨찾기, 밀집도 히트맵, K-means 군집분석 토글.',
        icon: '01',
    },
    {
        title: 'Analytics — 지도 위 데이터 분석',
        desc: '군집분석, 권역별, 카테고리 밀도, 지하철 접근성 4가지 분석 모드를 지도 위에 직접 시각화. 레이더 차트 + 파이 차트 사이드바.',
        icon: '02',
    },
    {
        title: 'Course — 관광 목적별 코스 추천',
        desc: '공연 중심 / 자연 힐링 / 역사 탐방 / 액티비티 / 문화 예술 5가지 목적 선택 → 맞춤 자치구 Top 5 + AI 코스 추천 (OpenAI 연동).',
        icon: '03',
    },
    {
        title: 'Favorites — 즐겨찾기 관리',
        desc: 'Culture Map에서 저장한 시설이 하트 마커로 지도 표시. 클릭 시 해당 위치로 flyTo. localStorage 영구 저장.',
        icon: '04',
    },
    {
        title: '지하철 노선 필터',
        desc: '19개 노선 필터 + 역 핀 표시. 자치구별 반경 1.5km 내 지하철역 수 시각화 + 접근성 Top 10 랭킹.',
        icon: '05',
    },
    {
        title: '자치구 경계선 + 권역 필터',
        desc: 'GeoJSON 오버레이로 자치구 경계 표시. 서울 5대 권역(도심/동북/서북/서남/동남) 필터링.',
        icon: '06',
    },
];

const ORIGIN_COMPARISON = [
    { category: '형태', team: 'R 분석 스크립트 + 보고서', personal: '풀스택 웹 서비스' },
    { category: '데이터', team: 'CSV 정적 데이터', personal: '공공 API + DB 실시간 서빙' },
    { category: '시각화', team: 'ggplot2 정적 차트', personal: 'Leaflet 인터랙티브 맵' },
    { category: '분석', team: 'R 스크립트', personal: '지도 위 실시간 분석 시각화' },
    { category: '결과물', team: 'PDF 보고서', personal: 'React 대시보드 (4개 페이지)' },
    { category: '배포', team: '로컬 실행', personal: 'Render + Vercel 클라우드' },
];

const API_ENDPOINTS = [
    { method: 'GET', path: '/api/facilities', desc: '전체 시설 목록 (카테고리·자치구 필터)' },
    { method: 'GET', path: '/api/facilities/{id}', desc: '시설 상세 정보 + 이미지' },
    { method: 'GET', path: '/api/districts', desc: '25개 자치구 목록 + 시설 수 집계' },
    { method: 'GET', path: '/api/districts/{name}', desc: '자치구별 시설 상세 통계' },
    { method: 'GET', path: '/api/categories', desc: '7개 카테고리 목록 + 시설 수' },
    { method: 'GET', path: '/api/clusters', desc: 'K-means 군집분석 결과' },
    { method: 'GET', path: '/api/subway/lines', desc: '19개 지하철 노선 목록' },
    { method: 'GET', path: '/api/subway/stations', desc: '노선별 역 위치 좌표' },
    { method: 'GET', path: '/api/subway/accessibility', desc: '자치구별 지하철 접근성 랭킹' },
    { method: 'GET', path: '/api/analytics/region', desc: '5대 권역별 시설 분포 통계' },
    { method: 'POST', path: '/api/recommend', desc: 'OpenAI 기반 AI 코스 추천' },
];

const CLUSTER_INFO = [
    {
        name: 'Cluster 1 — 도심권',
        color: '#ef4444',
        districts: '종로구, 중구',
        traits: '공연장·미술관·박물관 고밀집. 역사 문화 중심지로 관광 시설 최다.',
    },
    {
        name: 'Cluster 2 — 동북권',
        color: '#3b82f6',
        districts: '성동구, 광진구, 동대문구, 중랑구, 성북구, 강북구, 도봉구, 노원구',
        traits: '공원·도서관 비중 높음. 주거 밀집 지역으로 생활밀착형 문화시설 중심.',
    },
    {
        name: 'Cluster 3 — 서북권',
        color: '#22c55e',
        districts: '은평구, 서대문구, 마포구',
        traits: '독립서점·공연장·문화공간 균형. 젊은 층 유동인구 기반 문화 소비 활발.',
    },
    {
        name: 'Cluster 4 — 서남권',
        color: '#f59e0b',
        districts: '양천구, 강서구, 구로구, 금천구, 영등포구, 동작구, 관악구',
        traits: '레포츠·공원 비중 상위. 대규모 공원(여의도, 보라매) 기반 야외활동 중심.',
    },
    {
        name: 'Cluster 5 — 동남권',
        color: '#8b5cf6',
        districts: '서초구, 강남구, 송파구, 강동구',
        traits: '공연시설·전시관 고밀집. 예술의전당, COEX 등 대형 문화 인프라 보유.',
    },
];

const TECH_STACK = {
    'Backend': ['FastAPI', 'SQLAlchemy', 'SQLite', 'scikit-learn', 'OpenAI API', 'httpx'],
    'Frontend': ['React 19', 'Vite', 'Tailwind CSS v4', 'Leaflet / React-Leaflet', 'Recharts', 'Axios'],
    'Data': ['서울 열린데이터광장', '한국관광공사 Tour API'],
    'Infra': ['Render', 'Vercel'],
};

const DATA_SOURCES = [
    { source: '서울 열린데이터광장', data: '문화공간 (공연장, 미술관, 도서관 등)', count: '~1,039' },
    { source: '서울 열린데이터광장', data: '공원 정보', count: '~133' },
    { source: '서울 열린데이터광장', data: '지하철역 마스터', count: '~700+' },
    { source: '한국관광공사 Tour API', data: '관광지, 문화시설, 공연, 레포츠 (+이미지)', count: '~1,200' },
    { source: '학술제 CSV', data: '자치구별 시설 집계 (seed data)', count: '25구' },
];

const SCREENSHOTS = [
    { src: cmMain, label: 'Culture Map', desc: 'Leaflet 기반 서울시 25개 자치구 지도. 7개 카테고리 시설 마커, 사진+상세 정보 팝업, 즐겨찾기, 밀집도 히트맵, K-means 군집분석 토글' },
    { src: cmExplore, label: '시설 탐색 (GIF)', desc: '지도 위 시설 마커 클릭 → 사진+상세 팝업, 카테고리 필터링, 히트맵 토글 등 인터랙티브 탐색 데모' },
    { src: cmAnalytics, label: 'Analytics', desc: '군집분석, 권역별, 카테고리 밀도, 지하철 접근성 4가지 분석 모드를 지도 위에 직접 시각화. 레이더 차트 + 파이 차트 사이드바' },
    { src: cmAnalyticsModes, label: '분석 모드 전환 (GIF)', desc: '군집분석 · 권역별 · 카테고리 밀도 · 지하철 접근성 4가지 분석 모드를 실시간 전환하는 데모' },
    { src: cmCourse, label: 'Course 추천', desc: '공연 중심 / 자연 힐링 / 역사 탐방 / 액티비티 / 문화 예술 5가지 목적 선택 → 맞춤 자치구 Top 5 + AI 코스 추천 (OpenAI 연동)' },
    { src: cmAi, label: 'AI 코스 추천', desc: 'OpenAI 기반 자치구별 맞춤 관광 코스 생성. 추천 코스, 문화 관련 설명, 추천 장소 등을 AI가 자동 제안' },
    { src: cmCourseAi, label: 'AI 코스 추천 (GIF)', desc: '관광 목적 선택 → Top 5 자치구 추천 → OpenAI 기반 맞춤 코스 생성 과정 데모' },
    { src: cmFavorites, label: 'Favorites', desc: 'Culture Map에서 저장한 시설이 하트 마커로 지도 표시. 클릭 시 해당 위치로 flyTo. localStorage 영구 저장' },
    { src: cmSubway, label: '지하철 노선 필터', desc: '19개 노선 필터 + 역 핀 표시. 자치구별 반경 1.5km 내 지하철역 수 시각화 + 접근성 Top 10 랭킹' },
    { src: cmSubwayGif, label: '지하철 노선 탐색 (GIF)', desc: '19개 노선 필터 선택 → 역 핀 표시 → 자치구 접근성 랭킹 확인 과정 데모' },
];

const SECTIONS = [
    { id: 'problem', label: 'Problem' },
    { id: 'origin', label: 'Origin Story' },
    { id: 'decisions', label: 'Technical Decisions' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'features', label: 'Key Features' },
    { id: 'api', label: 'API Endpoints' },
    { id: 'clustering', label: 'K-means Clustering' },
    { id: 'data', label: 'Data Sources' },
    { id: 'tech', label: 'Tech Stack' },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
    { id: 'screenshots', label: 'Screenshots', highlight: true },
];

function ScreenshotGallery() {
    const [selected, setSelected] = useState(null);

    return (
        <motion.div id="screenshots" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Screenshots</h2>
            <p className="text-gray-500 mb-8">서비스 주요 화면 미리보기</p>
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
                            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
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

export default function SeoulCultureMap() {
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
                        <span className="text-[10px] font-bold px-3 py-1 bg-sky-50 text-sky-800 rounded-full tracking-wider uppercase">Personal</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Extended from Team Project</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2026.03 —</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        <span style={{ color: PRIMARY }}>Seoul</span> Culture Map
                    </h1>
                    <p className="text-xl font-semibold mb-6 tracking-tight" style={{ color: PRIMARY }}>
                        서울시 문화시설 인터랙티브 탐색 맵
                    </p>
                    <p className="text-lg text-gray-500 font-medium max-w-3xl leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
                        학술제 팀 프로젝트(서울시 25개 자치구 문화·여가시설 분석)를 개인 프로젝트로 확장하여 인터랙티브 웹 서비스로 구현. R 분석 스크립트를 FastAPI + React 풀스택 웹 서비스로 발전시키고, 서울 열린데이터광장 + 한국관광공사 API 실시간 데이터 연동, Leaflet 인터랙티브 맵, K-means 군집분석, AI 코스 추천 등 2,500+ 시설 탐색 대시보드를 구현.
                    </p>
                    <div className="flex gap-3">
                        <a href="https://github.com/ykgstar37-lab/seoul-culture-map" target="_blank" rel="noopener noreferrer"
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
                            "통계 분석 보고서는 제출하면 끝나지만, 데이터의 가치는 누군가 실제로 사용할 때 발생한다"
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            학술제에서 R로 서울 25개 자치구의 관광 시설을 분석하고 군집분석으로 지역구를 분류했지만, 결과물은 PDF 보고서 한 장이었습니다. 외국인 관광객이 실제로 "어디를 가야 할지" 알려면, 정적 차트가 아니라 지도 위에서 직접 탐색할 수 있는 서비스가 필요했습니다. 또한 2023년 기준 데이터가 2~3년이 지나 노후화된 상태였습니다.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'AS-IS', title: '정적 보고서', desc: 'R 스크립트 + ggplot2 차트 → PDF 제출. 2023년 CSV 데이터, 업데이트 불가. 수상 후 아무도 사용하지 않음', color: 'bg-red-50 text-red-700 border-red-200' },
                                { label: 'Gap', title: '데이터 노후화 + 접근성', desc: '2~3년 지난 정적 데이터, 공공 API 연동 필요. R 스크립트를 웹으로 전환하려면 완전히 다른 아키텍처 설계 필요', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                                { label: 'TO-BE', title: '인터랙티브 서비스', desc: '최신 공공 API 데이터로 2,500+ 시설을 지도에서 탐색, 분석, AI 코스 추천까지 — 분석 결과가 실제 사용 가능한 서비스로', color: 'bg-green-50 text-green-700 border-green-200' },
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
                    <p className="text-gray-500 mb-8">학술제 팀 프로젝트에서 개인 프로젝트로의 확장</p>
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
                                question: '두 개의 공공 API를 왜 함께 사용했는가?',
                                answer: '서울 열린데이터광장은 문화공간(공연장, 도서관) 데이터가 풍부하지만 이미지가 없고, 한국관광공사 Tour API는 관광지/레포츠 데이터와 사진을 제공합니다. 두 API의 응답 형식과 좌표 필드명이 달라 통합에 많은 변환 작업이 필요했지만, 2,500+ 시설과 1,177장의 사진을 확보할 수 있었습니다.',
                                tag: '데이터 설계'
                            },
                            {
                                question: '군집분석은 서버에서, 거리 계산은 프론트에서 하는 이유는?',
                                answer: 'K-means는 scikit-learn이 필요하고 전체 데이터 대상으로 수행되므로 서버에서 실행합니다. 반면 "가장 가까운 지하철역" 같은 Haversine 거리 계산은 사용자의 현재 뷰포트 내 데이터만 필요하므로 프론트에서 처리하여 API 호출을 줄였습니다.',
                                tag: '연산 위치 판단'
                            },
                            {
                                question: 'Leaflet + React의 라이프사이클 충돌을 어떻게 해결했는가?',
                                answer: 'Leaflet은 DOM을 직접 조작하고 React는 Virtual DOM을 사용합니다. 마커/팝업 렌더링에서 반복적인 이슈가 발생했고, react-leaflet의 선언적 API로 제어를 일원화하고, useEffect cleanup에서 레이어를 명시적으로 제거하는 패턴으로 해결했습니다.',
                                tag: 'DX + 안정성'
                            },
                            {
                                question: 'OpenAI API가 없어도 동작하도록 설계한 이유는?',
                                answer: 'AI 코스 추천은 부가 기능이지, 핵심 기능이 아닙니다. API 키가 없거나 호출 실패 시에도 규칙 기반 fallback 추천(카테고리 가중합 Top 5)이 동작하도록 설계하여, 외부 API 의존성이 서비스 가용성을 해치지 않도록 했습니다.',
                                tag: '방어적 설계'
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
                        { label: 'Facilities', value: '2,500+', sub: '7개 카테고리 문화시설' },
                        { label: 'API Endpoints', value: '11', sub: '10 GET + 1 POST (AI 추천)' },
                        { label: 'Pages', value: '4', sub: 'Map / Analytics / Course / Favorites' },
                        { label: 'Districts', value: '25', sub: '서울특별시 전 자치구' },
                        { label: 'Photos', value: '1,177', sub: '한국관광공사 이미지 포함' },
                        { label: 'Subway Lines', value: '19', sub: '노선별 역 위치 + 접근성 분석' },
                        { label: 'Clusters', value: '5', sub: 'K-means 군집분석 (5대 권역)' },
                        { label: 'Categories', value: '7', sub: '관광지·공연·미술관·박물관·공원·레포츠·도서관' },
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
                    <p className="text-gray-500 mb-8">공공데이터 API 기반 실시간 문화시설 탐색 파이프라인</p>
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-3">
                        {/* Data Sources */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {[
                                { name: '서울 열린데이터광장', desc: '문화공간/공원/지하철' },
                                { name: '한국관광공사 Tour API', desc: '관광지/이미지' },
                                { name: 'OpenAI API', desc: 'GPT 코스추천' },
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
                            <div className="px-6 py-4 bg-[#0ea5e9] rounded-xl text-white text-center max-w-lg w-full">
                                <p className="text-sm font-bold">FastAPI Backend</p>
                                <p className="text-xs text-white/70 mt-1">11 RESTful Endpoints + sync</p>
                            </div>
                        </div>

                        {/* Backend Modules */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {[
                                { name: 'Data Loader', desc: 'CSV + API' },
                                { name: 'scikit-learn', desc: 'K-means 군집' },
                                { name: 'OpenAI Client', desc: '코스 추천' },
                            ].map((m, i) => (
                                <div key={i} className="flex-1 min-w-[120px] max-w-[170px] px-4 py-3 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-xl text-center">
                                    <p className="text-xs font-bold text-[#0284c7]">{m.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Storage */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {[
                                { name: 'SQLite', desc: '시설 DB' },
                                { name: 'Cluster API', desc: '군집 결과' },
                                { name: 'Recommend API', desc: 'AI 추천 결과' },
                            ].map((m, i) => (
                                <div key={i} className="flex-1 min-w-[120px] max-w-[170px] px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl text-center">
                                    <p className="text-xs font-bold text-sky-700">{m.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* React Dashboard */}
                        <div className="flex justify-center">
                            <div className="px-6 py-5 bg-gray-900 rounded-xl text-white text-center max-w-lg w-full">
                                <p className="text-sm font-bold mb-2">React Dashboard (Vite + Tailwind + Leaflet)</p>
                                <div className="flex justify-center gap-2 text-[10px]">
                                    {['Culture Map', 'Analytics', 'Course', 'Favorites'].map((f, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/10 rounded">{f}</span>
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
                    <p className="text-gray-500 mb-8">6가지 핵심 기능</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((feature, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #0369a1)` }}>
                                        {feature.icon}
                                    </div>
                                    <p className="text-base font-bold text-gray-900">{feature.title}</p>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* API Endpoints */}
                <motion.div id="api" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>API Endpoints</h2>
                    <p className="text-gray-500 mb-8">FastAPI 기반 RESTful API 11개 엔드포인트</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Endpoint</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {API_ENDPOINTS.map((ep, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-3 px-4">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${ep.method === 'POST' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                                                {ep.method}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-sm" style={{ color: PRIMARY }}>{ep.path}</td>
                                        <td className="py-3 px-4 text-gray-500">{ep.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* K-means Clustering */}
                <motion.div id="clustering" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>K-means Clustering</h2>
                    <p className="text-gray-500 mb-8">서울시 25개 자치구를 문화시설 분포 패턴 기반으로 5개 군집으로 분류</p>
                    <div className="space-y-4">
                        {CLUSTER_INFO.map((cluster, idx) => (
                            <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <div className="flex items-center gap-3 md:w-56 shrink-0">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: cluster.color }}>
                                            {idx + 1}
                                        </div>
                                        <p className="text-base font-bold text-gray-900">{cluster.name}</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg px-4 py-2 mb-3 inline-block">
                                            <span className="text-sm font-medium text-gray-600">{cluster.districts}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{cluster.traits}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Data Sources */}
                <motion.div id="data" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Data Sources</h2>
                    <p className="text-gray-500 mb-8">총 2,500+ 개별 시설, 1,177개 시설에 사진 포함</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Source</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DATA_SOURCES.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-semibold text-gray-700">{row.source}</td>
                                        <td className="py-3 px-4 text-gray-500">{row.data}</td>
                                        <td className="py-3 px-4 font-semibold" style={{ color: PRIMARY }}>{row.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                학술제 R 분석 결과를 React + Leaflet 인터랙티브 맵으로 전환하면서, <span className="font-semibold text-gray-900">데이터 분석의 가치는 전달 방식에 따라 달라진다</span>는 것을 체감했습니다. 같은 군집분석 결과라도 PDF 표와 지도 위 색상 마커로 보여주는 것은 완전히 다른 경험이었습니다.
                            </p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">01</span>
                                    <span><strong className="text-gray-900">공공 API 데이터 정규화의 어려움</strong> — 두 API의 응답 형식과 좌표 필드명(lat/lng vs latitude/longitude)이 달라 전체 마커가 미표시되는 버그 발생. API-first 설계의 중요성을 체감</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">02</span>
                                    <span><strong className="text-gray-900">지도 시각화의 핵심은 정보 밀도 조절</strong> — 2,500+ 마커를 한 번에 렌더링하면 성능과 가독성이 모두 떨어짐. 카테고리 필터, 클러스터링, 히트맵으로 사용자가 원하는 수준으로 정보를 조절하는 UX 패턴 습득</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">03</span>
                                    <span><strong className="text-gray-900">외부 API 의존성에는 fallback 필수</strong> — OpenAI API, 공공데이터 API 모두 언제든 실패할 수 있음. mock 데이터와 규칙 기반 fallback을 준비하는 방어적 프로그래밍 실전 적용</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>TypeScript 미도입 — 좌표 필드명 불일치 같은 런타임 버그를 컴파일 타임에 잡을 수 있었을 것</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>CSS overflow 충돌 — overflow-y: auto가 overflow-x도 강제하여 드롭다운이 잘리는 문제, position: fixed로 우회했지만 근본적 해결은 아님</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>다국어(i18n) 미지원 — 외국인 관광객 대상 서비스이므로 영어/일본어 지원이 필요했으나 한국어만 구현</span>
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
