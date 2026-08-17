import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import TechnicalDrawer from '../components/TechnicalDrawer';
import SectionDotNav from '../components/SectionDotNav';
import ProjectFlowSection from '../components/ProjectFlowSection';

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

const SEOUL_CULTURE_MAP_CHARTS = [
    {
        title: '시스템 아키텍처',
        description: 'React 지도 UI, FastAPI, LangGraph Agent, SQLite/ChromaDB, 외부 공공 API의 연결 구조',
        chart: String.raw`graph LR
    subgraph Frontend
        React[React 19 + Vite]
        Leaflet[Leaflet 지도]
        Tailwind[Tailwind CSS]
    end

    subgraph Backend
        FastAPI[FastAPI]
        LangGraph[LangGraph Agent]
        sklearn[scikit-learn]
    end

    subgraph Storage
        SQLite[(SQLite\n2,500+ 시설)]
        ChromaDB[(ChromaDB\n벡터 검색)]
    end

    subgraph External["External APIs"]
        Seoul[서울 열린데이터광장]
        Tour[한국관광공사 Tour API]
        OpenAI[OpenAI GPT-4o-mini]
    end

    React <-->|REST /api + SSE| FastAPI
    FastAPI --> LangGraph
    FastAPI --> sklearn
    LangGraph --> SQLite
    LangGraph --> ChromaDB
    LangGraph --> OpenAI
    FastAPI -->|POST /api/sync| Seoul
    FastAPI -->|POST /api/sync| Tour
    Seoul --> SQLite
    Tour --> SQLite
    SQLite -->|임베딩| ChromaDB`,
    },
    {
        title: 'LangGraph Agent Pipeline',
        description: '의도 분류, 데이터 검색, 응답 생성, 지도 마커 출력까지의 대화형 추천 흐름',
        chart: String.raw`flowchart TD
    Start([사용자 메시지]) --> Intent

    subgraph Step1["1단계: 의도 분류"]
        Intent[GPT-4o-mini\nStructured Output]
    end

    Intent -->|recommend\n코스 추천| Retrieve
    Intent -->|search\n장소 검색| Retrieve
    Intent -->|info\n정보 질의| Retrieve
    Intent -->|chitchat\n일상 대화| Generate

    subgraph Step2["2단계: 데이터 검색"]
        Retrieve --> SQLite[(SQLite DB\n시설·지하철·군집)]
        Retrieve --> Chroma[(ChromaDB\n시맨틱 검색)]
        SQLite --> Merge[컨텍스트 병합]
        Chroma --> Merge
    end

    Merge --> Generate

    subgraph Step3["3단계: 응답 생성"]
        Generate[GPT-4o-mini\n컨텍스트 주입]
    end

    Generate --> Output

    subgraph Result["응답 출력"]
        Output[마크다운 텍스트\n+ 추천 장소 좌표]
        Output -->|JSON| API["/api/chat 응답"]
        Output -->|SSE 스트리밍| Stream["/api/chat/stream\n토큰 단위 전송"]
        Output -->|장소 좌표| Map["지도 마커 표시\n번호 + 경로선"]
        Output -->|이력 저장| DB[(SQLite\nchat_messages)]
    end

    style Step1 fill:#fef3c7,stroke:#f59e0b
    style Step2 fill:#dbeafe,stroke:#3b82f6
    style Step3 fill:#dcfce7,stroke:#22c55e
    style Result fill:#f3e8ff,stroke:#a855f7`,
    },
    {
        title: 'Data Pipeline',
        description: '공공데이터 수집, 정규화, SQLite 저장, 로컬 임베딩, API/Agent 서빙 흐름',
        chart: String.raw`flowchart TD
    subgraph Sources["데이터 소스"]
        Seoul["서울 열린데이터광장\n문화공간 ~1,039\n공원 ~133\n지하철역 ~700+"]
        Tour["한국관광공사 Tour API\n관광지 · 문화시설\n공연/축제 · 레포츠\n+ 이미지 URL"]
        CSV["학술제 CSV (seed)\n자치구별 집계\n6카테고리 × 25자치구"]
    end

    subgraph Sync["POST /api/sync"]
        Normalize["데이터 정규화\n좌표 검증 · 자치구 추출\n카테고리 매핑 · 중복 제거"]
    end

    Seoul --> Normalize
    Tour --> Normalize

    subgraph DB["SQLite DB"]
        Places["places\n2,500+ 개별 시설"]
        Facilities["facilities\n자치구별 집계"]
        Subway["subway_stations\n700+ 역"]
        Chat["chat_sessions\nchat_messages"]
    end

    Normalize --> Places
    Normalize --> Subway
    CSV -->|서버 시작 시 seed| Facilities

    subgraph Vector["ChromaDB"]
        Embed["all-MiniLM-L6-v2\n로컬 임베딩\nAPI 비용 없음"]
        Index["벡터 인덱스\n시맨틱 검색 지원"]
    end

    Places -->|서버 시작 시 임베딩| Embed
    Embed --> Index

    subgraph Serve["서빙"]
        REST["REST API\n시설 · 통계 · 지하철"]
        Agent["LangGraph Agent\nRAG 기반 대화"]
        Cluster["K-means 군집분석\nscikit-learn"]
    end

    Places --> REST
    Places --> Agent
    Index --> Agent
    Facilities --> Cluster

    style Sources fill:#fef3c7,stroke:#f59e0b
    style Sync fill:#fee2e2,stroke:#ef4444
    style DB fill:#dbeafe,stroke:#3b82f6
    style Vector fill:#dcfce7,stroke:#22c55e
    style Serve fill:#f3e8ff,stroke:#a855f7`,
    },
];

const FEATURES = [
    {
        title: 'Culture Map — 인터랙티브 시설 탐색',
        desc: 'R 분석 결과가 PDF 보고서에 갇혀 상호작용이 불가능한 문제 → Leaflet 기반 25개 자치구 지도에 2,500+ 시설을 7개 카테고리별 마커로 시각화. 밀집도 히트맵 + K-means 군집 토글로 분포 패턴 즉시 파악 가능.',
        icon: '01',
    },
    {
        title: 'Analytics — 지도 위 데이터 분석',
        desc: '단순 시설 목록으로는 권역별 분포 불균형을 파악하기 어려운 문제 → 군집분석·권역별·카테고리 밀도·지하철 접근성 4가지 분석 모드를 지도 위에 직접 시각화하여 지역별 문화 접근성 격차를 정량적으로 확인.',
        icon: '02',
    },
    {
        title: 'AI Chatbot — LangGraph Agent + RAG',
        desc: '키워드 검색만으로는 "종로 근처 조용한 박물관" 같은 자연어 질문을 처리할 수 없는 문제 → LangGraph 3-node Agent(Intent→Retrieve→Generate) + ChromaDB RAG + SSE 스트리밍 → 요청당 ~$0.003(85% 비용 절감).',
        icon: '03',
    },
    {
        title: 'Favorites — 즐겨찾기 관리',
        desc: '탐색 중 관심 시설을 다시 찾기 어려운 문제 → 하트 마커로 지도 표시 + 클릭 시 해당 위치로 flyTo. localStorage로 영구 저장하여 재방문 시 유지.',
        icon: '04',
    },
    {
        title: '지하철 노선 필터',
        desc: '문화시설 접근성이 대중교통 의존도가 높은데 기존 분석에 교통 데이터가 없었던 문제 → 19개 노선 필터 + 반경 1.5km 내 역 수 시각화 + 접근성 Top 10 랭킹으로 교통 편의성 판단 지원.',
        icon: '05',
    },
    {
        title: '자치구 경계선 + 권역 필터',
        desc: 'GeoJSON 오버레이로 행정 경계를 시각화. 서울 5대 권역(도심/동북/서북/서남/동남) 필터링으로 권역 단위 비교 분석 가능.',
        icon: '06',
    },
    {
        title: 'Course — 관광 목적별 코스 추천',
        desc: '시설 2,500+개가 나열만 되면 선택이 어려운 문제 → 공연·자연·역사·액티비티·문화예술 5가지 목적 선택 시 K-means 결과 + 시설 밀집도 가중치로 자치구 Top 5 자동 추천.',
        icon: '07',
    },
];

const ORIGIN_COMPARISON = [
    { category: '형태', team: 'R 분석 스크립트 + 보고서', personal: '풀스택 웹 서비스' },
    { category: '데이터', team: 'CSV 정적 데이터', personal: '공공 API + DB 실시간 서빙' },
    { category: '시각화', team: 'ggplot2 정적 차트', personal: 'Leaflet 인터랙티브 맵' },
    { category: '분석', team: 'R 스크립트', personal: '지도 위 실시간 분석 시각화' },
    { category: '결과물', team: 'PDF 보고서', personal: 'React 대시보드 (4개 페이지)' },
    { category: 'AI', team: '없음', personal: 'LangGraph Agent + ChromaDB RAG + SSE 스트리밍' },
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
    { method: 'POST', path: '/api/chat', desc: 'LangGraph AI 챗봇 (JSON 응답)' },
    { method: 'POST', path: '/api/chat/stream', desc: 'SSE 스트리밍 AI 챗봇 (토큰 단위)' },
    { method: 'GET', path: '/api/chat/sessions', desc: '채팅 세션 목록 + 메시지 수' },
    { method: 'GET', path: '/api/chat/history/{id}', desc: '세션별 대화 히스토리' },
    { method: 'DELETE', path: '/api/chat/sessions/{id}', desc: '채팅 세션 삭제' },
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
    'Backend': ['FastAPI', 'SQLAlchemy', 'SQLite', 'LangGraph', 'ChromaDB', 'scikit-learn', 'OpenAI API', 'httpx', 'sse-starlette'],
    'Frontend': ['React 19', 'Vite', 'Tailwind CSS v4', 'Leaflet / React-Leaflet', 'Recharts', 'Axios', 'react-markdown'],
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
    { id: 'goal', label: 'Goal' },
    { id: 'problem', label: 'Problem' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'origin', label: 'Origin Story' },
    { id: 'decisions', label: 'Technical Decisions' },
    { id: 'evaluation', label: 'Evaluation' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'screenshots', label: 'Screenshots', highlight: true },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
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
                        서울 문화 데이터 탐색 · 군집 해석 · LLM 추천 서비스
                    </p>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
                        학술제 팀 분석이 PDF 보고서로만 남아 일반 사용자가 활용할 수 없는 문제를 해결했습니다. 2개 공공API의 좌표 필드와 카테고리 코드가 달라 통합이 어려웠지만, 데이터 정규화 파이프라인으로 2,500+ 시설과 1,177장 이미지를 확보했습니다. 이후 LangGraph 3-node 구조로 추천 비용을 요청당 ~$0.003까지 낮추고, 로컬 임베딩으로 월 API 비용 $0을 달성해 데이터 제품을 운영 가능한 형태로 바꿨습니다.
                    </p>
                    <div className="flex gap-3">
                        <a href="https://github.com/ykgstar37-lab/seoul-culture-map" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-full transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                            GitHub
                        </a>
                        <button onClick={() => { const el = document.getElementById('screenshots'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e27500] text-white text-sm font-medium rounded-full hover:bg-[#c96600] transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Screenshots
                        </button>
                    </div>
                </motion.div>

                {/* PDF-style Overview / Role / Skills */}
                <motion.div id="overview" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8 space-y-6">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: PRIMARY }}>Overview</p>
                                <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    서울시 2,500+ 문화시설 데이터를 K-means 군집분석하고, Intent 라우팅 RAG 기반 추천과 Leaflet 지도를 결합한 데이터 서비스입니다. 팀 학술제의 R 분석 결과를 웹 서비스로 확장하면서, 정적 분석을 사용자의 탐색 행동과 추천 응답으로 연결하는 구조를 설계했습니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
                                <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                                    개인 프로젝트로서 RESTful API 설계(11개 엔드포인트), LangGraph 기반 Intent 라우팅 RAG 파이프라인, K-means 군집분석, SSE 스트리밍, 인터랙티브 지도 구현까지 전 과정을 담당했습니다. 특히 검색 비용, 추천 품질, 데이터 정규화, 응답 지연을 함께 고려해 서비스 구조를 설계했습니다.
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {['FastAPI', 'React', 'Leaflet', 'scikit-learn', 'LangGraph', 'ChromaDB', 'OpenAI API', 'SSE Streaming'].map(t => (
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
                            <strong className="text-gray-900">문제:</strong> 학술제 R 분석 결과가 PDF 보고서로만 공유되어 일반인/관광객이 활용 불가. 2023년 기준 데이터도 노후화.
                        </p>
                        <p className="text-gray-700 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                            <strong className="text-gray-900">목표:</strong> 2,500+ 시설을 인터랙티브 지도에서 탐색·분석하고, AI 챗봇으로 자연어 추천까지 제공하는 웹 서비스. 비용은 요청당 $0.003 이하.
                        </p>
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
                                { label: 'Gap', title: '분석 코드 ≠ 서비스', desc: 'R 스크립트 → 웹 전환에는 완전히 다른 아키텍처 필요. 2개 공공API 스키마 통합, 실시간 데이터 연동, AI 추천 비용 최적화 과제', color: 'bg-amber-50 text-amber-700 border-amber-200' },
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

                <ProjectFlowSection
                    id="architecture"
                    title="Architecture"
                    subtitle="정적 R 분석 결과를 실제 탐색 서비스로 확장하기 위해 공공데이터 통합, 공간 분석, AI 추천을 API 단위로 분리했습니다."
                    accentColor={PRIMARY}
                    variant={fadeInUp}
                    charts={SEOUL_CULTURE_MAP_CHARTS}
                    steps={[
                        { title: 'Public Data', subtitle: '시설/관광 데이터 수집', items: ['Seoul Open Data', 'Tour API', '2,500+ facilities'] },
                        { title: 'FastAPI Backend', subtitle: '정규화와 검색 API', items: ['15 endpoints', 'SQLite', 'ChromaDB'] },
                        { title: 'Analysis & Agent', subtitle: '군집/거리/추천 계산', items: ['K-means', 'Haversine', 'LangGraph 3-node'] },
                        { title: 'React Map UI', subtitle: '사용자 탐색 화면', items: ['Leaflet map', 'AI chatbot', 'Course', 'Analytics'] },
                    ]}
                    notes={[
                        { label: 'Data Merge', value: '2개 공공 API 좌표/카테고리 정규화' },
                        { label: 'Cost', value: 'Intent 라우팅으로 AI 호출 비용 85% 절감' },
                        { label: 'Embedding', value: '로컬 MiniLM 임베딩으로 월 비용 $0' },
                    ]}
                />

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
                                question: 'AI 추천을 단일 LLM 호출 대신 LangGraph 3-node 파이프라인으로 설계한 이유는?',
                                answer: '단일 LLM 호출은 의도 분류·데이터 검색·응답 생성을 한 번에 처리하여 비용이 높고 제어가 어렵습니다. Intent → Retrieve → Generate 3단계로 분리하면, 일상 대화(chitchat)는 검색을 건너뛰어 비용을 절감하고, 검색 단계는 LLM 없이 SQL + ChromaDB만 사용합니다. 요청당 ~$0.003으로 엔터프라이즈 대비 85% 비용 절감.',
                                tag: 'Intent 라우팅 RAG'
                            },
                            {
                                question: 'ChromaDB 로컬 임베딩을 선택한 이유는?',
                                answer: 'all-MiniLM-L6-v2 (384차원, ~33MB)로 2,500+ 시설을 로컬에서 임베딩하면 API 비용이 $0입니다. OpenAI embedding 대비 월 ~$0.30 절감. 200건 단위 배치 처리로 메모리 부담을 줄이고, DB 대비 10% 이내 차이면 재임베딩을 건너뛰어 서버 재시작 시 30-60초 절약.',
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
                    <p className="text-gray-500 mb-8">데이터 통합 결과 및 비용 최적화 검증</p>

                    {/* Key Metrics — Before→After 도표 */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">지표</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-red-400 uppercase tracking-wider">팀 분석 (Before)</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-emerald-500 uppercase tracking-wider">개인 서비스 (After)</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">개선</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { metric: '데이터 소스', before: 'CSV 정적', after: '공공API 2개 실시간', improvement: '2,500+ 시설' },
                                    { metric: '이미지', before: '없음', after: '1,177장', improvement: 'Tour API 연동' },
                                    { metric: '시설 탐색', before: 'PDF 보고서', after: 'Leaflet 인터랙티브 맵', improvement: '즉시 탐색' },
                                    { metric: 'AI 추천', before: '없음', after: 'LangGraph 3-node Agent', improvement: '~$0.003/req' },
                                    { metric: 'AI 비용', before: '—', after: '엔터프라이즈 대비 85%↓', improvement: '85% 절감' },
                                    { metric: '임베딩 비용', before: '—', after: '로컬 MiniLM-L6-v2', improvement: '$0/월' },
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

                    {/* Data Integration + Intent 라우팅 RAG */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold" style={{ color: PRIMARY }}>공공 API 통합 — 2개 소스 데이터 정규화</p>
                            <div className="space-y-3 mt-4">
                                {[
                                    { source: '서울 열린데이터광장', data: '문화공간 · 공원 · 지하철', issue: '이미지 없음, 좌표 필드 상이' },
                                    { source: '한국관광공사 Tour API', data: '관광지 · 레포츠 · 이미지', issue: '카테고리 코드 매핑 필요' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-sm font-bold text-gray-900">{item.source}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.data}</p>
                                        <p className="text-[10px] text-amber-600 mt-1">{item.issue}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3">→ 좌표 필드 통합, 카테고리 매핑, 중복 제거 후 6개 카테고리 · 25개 자치구 데이터 확보</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold" style={{ color: PRIMARY }}>Intent 라우팅 RAG — 3-node 비용 최적화</p>
                            <div className="space-y-3 mt-4">
                                {[
                                    { node: 'Intent', desc: 'chitchat은 검색 건너뜀', cost: 'LLM 1회', color: 'bg-sky-50' },
                                    { node: 'Retrieve', desc: 'SQL + ChromaDB만 사용', cost: 'LLM 0회', color: 'bg-emerald-50' },
                                    { node: 'Generate', desc: '검색 결과 기반 응답', cost: 'LLM 1회', color: 'bg-sky-50' },
                                ].map((item, idx) => (
                                    <div key={idx} className={`p-3 ${item.color} rounded-xl flex items-center justify-between`}>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.node}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-lg">{item.cost}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3">단일 LLM 호출 대비 <strong className="text-gray-700">85% 비용 절감</strong> (요청당 ~$0.003)</p>
                        </div>
                    </div>

                    {/* 키워드 검색 vs LangGraph Agent 비교 */}
                    <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>키워드 검색 vs LangGraph Agent 응답 비교</p>
                        <p className="text-sm text-gray-500 mb-4" style={{ wordBreak: 'keep-all' }}>질문: <span className="font-medium text-gray-700">"종로 근처 조용한 박물관 추천해줘"</span></p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">키워드 검색 (Before)</p>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                    <p>"종로"+"박물관" 필터 → <strong>42건 일괄 나열</strong></p>
                                    <p className="text-red-400 text-xs">"조용한" 의도 반영 불가</p>
                                </div>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">LangGraph Agent (After) — ~$0.003/req</p>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                    <p>Intent→Retrieve→Generate → <strong>"국립민속박물관은 평일 오전이 한적합니다"</strong></p>
                                    <p className="text-emerald-500 text-xs">의도("조용한") 반영 + 맥락 설명</p>
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
                            { title: '공공API 데이터 통합', problem: '서울 열린데이터광장과 한국관광공사 API의 좌표 필드명·카테고리 코드가 완전히 다름', solution: '좌표 필드 정규화 + 카테고리 코드 매핑 테이블 설계 + 중복 제거 파이프라인', result: '2,500+ 시설 통합' },
                            { title: 'Leaflet + React 충돌', problem: 'Leaflet은 DOM 직접 조작, React는 Virtual DOM — 마커/팝업 렌더링에서 반복 오류', solution: 'react-leaflet 선언적 API로 제어 일원화 + useEffect cleanup에서 레이어 명시적 제거', result: '렌더링 안정화' },
                            { title: 'AI 추천 비용', problem: '단일 LLM 호출로 의도 분류·검색·응답을 한 번에 처리하면 비용이 높고 제어 어려움', solution: 'LangGraph 3-node(Intent→Retrieve→Generate) 분리, chitchat은 검색 스킵, 검색은 LLM 없이 SQL만', result: '85% 비용 절감' },
                            { title: '임베딩 API 비용', problem: '2,500+ 시설을 OpenAI embedding으로 처리하면 월 비용 발생', solution: 'all-MiniLM-L6-v2(384D, 33MB) 로컬 임베딩 + 200건 배치 + 10% 이내 차이 시 재임베딩 스킵', result: '$0/월' },
                            { title: '연산 위치 판단', problem: 'K-means 군집분석과 Haversine 거리 계산을 어디서 처리할지 결정 필요', solution: 'K-means는 scikit-learn 필요하므로 서버, 거리 계산은 뷰포트 내 데이터만 필요하므로 프론트', result: 'API 호출 최소화' },
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
                <TechnicalDrawer accentColor="#0ea5e9" tabs={[
                    { label: 'About', content: (
                        <div className="space-y-6">
                            <div className="bg-[#0ea5e9] rounded-2xl p-6 text-white">
                                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Seoul Culture Map</h3>
                                <p className="text-white/80 text-sm leading-relaxed mb-4" style={{ wordBreak: 'keep-all' }}>
                                    학술제 R 분석 결과가 PDF 보고서에 갇혀있던 문제를 해결. 2개 공공API를 통합하여 2,500+ 시설을 인터랙티브 지도로 시각화하고,
                                    LangGraph 3-node AI Agent로 자연어 문화시설 추천을 요청당 $0.003(85% 절감)에 제공.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['FastAPI', 'React', 'Leaflet', 'LangGraph', 'ChromaDB', 'K-means', 'SSE'].map(t => (
                                        <span key={t} className="text-[10px] font-bold px-2 py-1 bg-white/15 rounded-full">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                                {[
                                    { label: '시설', value: '2,500+', sub: '7개 카테고리' },
                                    { label: '이미지', value: '1,177장', sub: 'Tour API' },
                                    { label: '자치구', value: '25개', sub: '서울 전역' },
                                    { label: 'Endpoints', value: '15', sub: 'REST+SSE' },
                                    { label: 'AI 비용', value: '$0.003', sub: '85% 절감' },
                                    { label: '임베딩', value: '$0/월', sub: '로컬 임베딩' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-lg font-bold text-[#0ea5e9]">{item.value}</p>
                                        <p className="text-[10px] text-gray-500">{item.sub}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What Makes This Special</p>
                                <div className="space-y-2">
                                    {[
                                        'LangGraph 3-node Agent로 AI 추천 비용 85% 절감 — 요청당 $0.003, chitchat은 검색 스킵',
                                        '로컬 임베딩(MiniLM-L6-v2)으로 월 API 비용 $0 달성 — 200건 배치, 변화 10% 이내 시 재임베딩 스킵',
                                        'R 정적 분석 → React+Leaflet 인터랙티브 맵 + SSE AI 챗봇으로 완전 전환',
                                        '2개 공공API 통합 — 좌표 필드·카테고리 코드 정규화로 2,500+ 시설 + 1,177장 이미지 확보',
                                        'K-means 5대 권역 분류 — 방탈출 64개(강남), 박물관 42개(중구) 등 분포 불균형을 데이터로 증명',
                                        '7개 카테고리 + 116개 법정동 단위 다층 공간 분석',
                                        'Leaflet + React 충돌을 react-leaflet + useEffect cleanup으로 해결',
                                    ].map((text, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="text-[#0ea5e9] mt-0.5 flex-shrink-0">*</span>
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
                                { label: 'Facilities', value: '2,500+', sub: '7개 카테고리 문화시설' },
                                { label: 'API Endpoints', value: '15', sub: '10 GET + 3 POST + 1 DELETE + SSE' },
                                { label: 'Pages', value: '5', sub: 'Map / Chatbot / Analytics / Course / Favorites' },
                                { label: 'Districts', value: '25', sub: '서울특별시 전 자치구' },
                                { label: 'Photos', value: '1,177', sub: '한국관광공사 이미지 포함' },
                                { label: 'Subway Lines', value: '19', sub: '노선별 역 위치 + 접근성 분석' },
                                { label: 'Clusters', value: '5', sub: 'K-means 군집분석 (5대 권역)' },
                                { label: 'Categories', value: '7', sub: '관광지·공연·미술관·박물관·공원·레포츠·도서관' },
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
                                    { name: '서울 열린데이터광장', desc: '문화공간/공원/지하철' },
                                    { name: '한국관광공사 Tour API', desc: '관광지/이미지' },
                                    { name: 'OpenAI API', desc: 'GPT-4o-mini Agent' },
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
                                    <p className="text-xs text-white/70 mt-1">15 Endpoints (REST + SSE + sync)</p>
                                </div>
                            </div>

                            {/* Backend Modules */}
                            <div className="flex justify-center gap-3 flex-wrap">
                                {[
                                    { name: 'LangGraph Agent', desc: '3-node Pipeline' },
                                    { name: 'ChromaDB', desc: 'RAG 벡터 검색' },
                                    { name: 'scikit-learn', desc: 'K-means 군집' },
                                    { name: 'Data Loader', desc: 'CSV + API' },
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
                                    { name: 'SQLite', desc: '시설 + 채팅 DB' },
                                    { name: 'ChromaDB', desc: '벡터 임베딩' },
                                    { name: 'Cluster Cache', desc: '1시간 TTL' },
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
                                        {['Culture Map', 'AI Chatbot', 'Analytics', 'Course', 'Favorites'].map((f, i) => (
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
                    { label: 'API Endpoints', content: (
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
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${ep.method === 'POST' ? 'bg-amber-100 text-amber-700' : ep.method === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
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
                    )},
                    { label: 'K-means Clustering', content: (
                        <div className="space-y-4">
                            {CLUSTER_INFO.map((cluster, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
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
                                </div>
                            ))}
                        </div>
                    )},
                    { label: 'Data Sources', content: (
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
                                학술제 R 분석 결과를 React + Leaflet 인터랙티브 맵으로 전환하면서, <span className="font-semibold text-gray-900">데이터 분석의 가치는 전달 방식에 따라 달라진다</span>는 것을 체감했습니다. 같은 군집분석 결과라도 PDF 표와 지도 위 색상 마커로 보여주는 것은 완전히 다른 경험이었습니다.
                            </p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">01</span>
                                    <span><strong className="text-gray-900">데이터 분석의 가치 = 전달 방식</strong> — 같은 군집분석이라도 PDF 표와 지도 위 색상 마커는 완전히 다른 경험. 공공 API 좌표 필드명(lat/lng vs latitude/longitude) 불일치로 전체 마커 미표시 버그도 경험</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">02</span>
                                    <span><strong className="text-gray-900">정보 밀도 조절이 UX의 핵심</strong> — 2,500+ 마커 동시 렌더링은 성능/가독성 모두 저하. 카테고리 필터 + 클러스터링 + 히트맵으로 사용자가 스스로 정보량을 조절하는 패턴 설계</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">03</span>
                                    <span><strong className="text-gray-900">Intent 라우팅 RAG 비용 최적화</strong> — Intent→Retrieve→Generate 분리로 chitchat은 검색 스킵, 검색은 LLM 없이 SQL+ChromaDB만 사용 → 요청당 $0.003(85% 절감). API 실패 시 SQL만으로 fallback</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span>
                                    <span className="line-through text-gray-400">AI 기능 없음 → <strong className="text-gray-600 no-underline">LangGraph 3-node Agent + ChromaDB RAG + SSE 스트리밍 챗봇 구현 완료</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span>
                                    <span className="line-through text-gray-400">테스트 없음 → <strong className="text-gray-600 no-underline">pytest 15개 + 코드 중복 제거 리팩토링 완료</strong></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 text-xs font-bold mt-0.5 w-14 shrink-0">높음</span>
                                    <span>다국어(i18n) 미지원 — 외국인 관광객 대상인데 한국어만 구현</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 text-xs font-bold mt-0.5 w-14 shrink-0">중간</span>
                                    <span>TypeScript 미도입 — 좌표 필드명 불일치 같은 런타임 버그 컴파일 타임 방지 가능</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-gray-400 text-xs font-bold mt-0.5 w-12 shrink-0">낮음</span>
                                    <span>CSS overflow 충돌 — position: fixed로 우회했지만 근본적 해결은 아님</span>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
                            <p className="text-sm text-gray-600 leading-relaxed italic" style={{ wordBreak: 'keep-all' }}>
                                같은 데이터라도 PDF 보고서와 인터랙티브 지도는 완전히 다른 가치를 만듭니다. 데이터 분석의 가치는 분석 자체가 아니라, 그것을 필요한 사람에게 전달하는 방식에서 결정된다는 것을 배운 프로젝트였습니다.
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
