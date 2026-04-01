import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import CollapsibleSection from '../components/CollapsibleSection';
// Demo video hosted on Google Drive
import SectionDotNav from '../components/SectionDotNav';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const AGENTS = [
    {
        name: 'Judgment Agent',
        title: '규정 판단',
        desc: '다중 규정 교차 판단 + 근거 제시 + 대안 추천. cross_references와 confidence 보정으로 정확도 강화.',
        color: 'from-[#5f7f95] to-[#4a6a80]',
        icon: '01',
        input: '사용자 질의 + RAG 검색 결과',
        coreTech: 'Kanana-1.5-8B LoRA + 4중 Guardrail',
        rag: 'O (하이브리드 + HyDE)',
        output: 'JSON (판단/근거/대안/신뢰도)',
        feature: '5-factor Confidence, 교차 규정 판단',
    },
    {
        name: 'Document Agent',
        title: '문서 처리',
        desc: '회의록/보고서/제안서 생성, 요약, 검색, QA. Docling+PaddleOCR+python-docx 통합 파싱.',
        color: 'from-[#6b8ea3] to-[#56788d]',
        icon: '02',
        input: '문서 파일 / 텍스트 / 질의',
        coreTech: 'Kanana LoRA (생성/요약/QA)',
        rag: 'O (문서 검색 시)',
        output: '생성 문서 / 요약문 / 답변',
        feature: '3개 서브태스크 LoRA, OCR 통합',
    },
    {
        name: 'Schedule Agent',
        title: '일정 관리',
        desc: '자연어 → 일정 자동 등록/조회. Google Calendar+Tasks+Gmail+Sheets 4종 연동.',
        color: 'from-[#7a9db0] to-[#5f7f95]',
        icon: '03',
        input: '자연어 일정 요청',
        coreTech: 'Google API 4종 연동',
        rag: 'X',
        output: '일정 등록/조회/알림 결과',
        feature: 'Calendar·Tasks·Gmail·Sheets 통합',
    },
    {
        name: 'Planner Agent',
        title: '복합 요청 분해',
        desc: '멀티스텝 요청을 단계별 계획으로 분해 + 병렬 처리. LoRA 파인튜닝 적용.',
        color: 'from-[#89abbe] to-[#6b8ea3]',
        icon: '04',
        input: '복합 멀티스텝 요청',
        coreTech: 'Kanana LoRA (Planner)',
        rag: 'X',
        output: '단계별 실행 계획 JSON',
        feature: '7버전 반복 최적화, 병렬 처리',
    },
];

const AGENT_DETAIL_HEADERS = ['입력', '핵심 기술', 'RAG 사용', '출력 포맷', '특징'];

const FINETUNING = [
    { model: 'KoELECTRA', task: 'Intent 분류', train: '3,954', eval: '610', source: '자체 제작 + Adversarial 463', metric: 'F1 97.88%', detail: 'Label Smoothing 0.1 적용, 과신뢰 오분류 69% 감소' },
    { model: 'Kanana-1.5-8B (LoRA)', task: 'Planner', train: '1,471', eval: '150', source: '자체 제작 + GPT 증강', metric: '7버전 반복', detail: '멀티스텝 계획 분해 최적화' },
    { model: 'Kanana-1.5-8B (LoRA)', task: '판단 LoRA', train: '3,468', eval: '328', source: '수동 제작(Excel) + RAG 증강', metric: 'GPT-4o-mini 증강', detail: '다중 규정 교차 판단 + 근거 생성' },
    { model: 'Kanana-1.5-8B (LoRA)', task: '문서 요약', train: '900', eval: '100', source: 'AI Hub SN 582 + GPT 증강', metric: '3개 서브태스크', detail: '요약 특화 LoRA 학습' },
    { model: 'Kanana-1.5-8B (LoRA)', task: '문서 생성', train: '1,350', eval: '150', source: 'AI Hub + 합성', metric: '문서 생성 특화', detail: '회의록/보고서/제안서 생성' },
];

const RAG_STEPS = [
    { step: '1', title: '쿼리 정제', desc: '형태소 분석 + 동의어 확장 + 구어→문어 변환' },
    { step: '2', title: 'HyDE 가설 문서', desc: '사용자 질의로부터 가설 답변 문서를 생성하여 검색 품질 향상' },
    { step: '3', title: 'BM25 검색', desc: 'kiwipiepy 기반 Top 15 후보 추출' },
    { step: '4', title: '벡터 검색', desc: 'Qdrant Cloud + ko-sbert-nli (768D) Top 15' },
    { step: '5', title: 'RRF 융합', desc: 'Reciprocal Rank Fusion (k=60)' },
    { step: '6', title: '태그 부스팅', desc: '규정 태그 매칭 기반 스코어 보정' },
    { step: '7', title: '다양성 필터', desc: '중복 문서 제거 + 다양한 규정 커버' },
    { step: '8', title: 'Reranker', desc: 'bge-reranker-v2-m3로 최종 순위 결정' },
    { step: '9', title: 'Top K 반환', desc: '최종 K개 문서를 LLM 컨텍스트에 주입' },
];

const GUARDRAILS = [
    { title: '규정 키워드 매칭', desc: '판단 근거가 실제 규정 키워드와 일치하는지 검증', icon: '1' },
    { title: '조항 존재 검증', desc: '인용된 조항이 실제 존재하는지 확인', icon: '2' },
    { title: '판단 카테고리 제한', desc: '허용된 카테고리(yes/no/conditional) 외 응답 차단', icon: '3' },
    { title: '일관성 모니터링', desc: '동일 질의 유형에 대한 판단 일관성 추적', icon: '4' },
];

const AS_IS_TO_BE = [
    { task: '규정 확인', asIs: '수동 검색 10~15분', toBe: '자연어 질의 10초 이내' },
    { task: '문서 작성', asIs: '수동 30분~1시간', toBe: 'AI 자동 생성, 검토만 5분' },
    { task: '일정 관리', asIs: '3~4개 앱 수동 전환', toBe: '채팅 한 줄로 등록/조회/알림' },
    { task: '정보 탐색', asIs: '여러 문서 직접 검색', toBe: 'RAG 하이브리드 즉시 답변' },
];

const CONTRIBUTIONS = [
    { title: 'Judgment Agent 설계 및 구현', desc: '다중 규정 교차 판단 + 4중 보조장치 (규정 키워드 매칭, 조항 존재 검증, 카테고리 제한, 일관성 모니터링) 아키텍처 설계' },
    { title: 'RAG 파이프라인 구축', desc: 'Qdrant + BM25 + HyDE + RRF + Reranker 하이브리드 검색 파이프라인 전체 설계 및 구현' },
    { title: '판단 Agent LoRA 파인튜닝', desc: '수동 제작(Excel) + RAG 증강으로 3,468건 학습 데이터 구축 후 Kanana-1.5-8B LoRA 어댑터 학습' },
    { title: '쿼리 정제 모듈', desc: '동의어 사전 확장, 구어→문어 변환, 형태소 기반 키워드 추출 전처리 모듈 개발' },
];

const CHALLENGES = [
    { title: 'sLLM JSON 파싱 실패', problem: '소형 모델이 구조화된 JSON 출력을 일관되게 생성하지 못함', solution: '프롬프트 최적화 + 출력 포맷 단순화 + fallback 로직으로 안정성 확보' },
    { title: 'Intent 과신뢰 오분류', problem: '모델이 높은 confidence로 잘못된 Intent를 분류하는 문제', solution: 'Label Smoothing 0.1 적용 → 과신뢰 오분류 69% 감소' },
    { title: 'RAG 검색 정밀도', problem: '단일 검색 방식으로는 규정 문서의 다양한 표현을 커버하기 어려움', solution: '하이브리드(BM25+Vector) + HyDE + RRF + Reranker 파이프라인 구축' },
    { title: '규정 교차 판단 정확도', problem: '복수 규정 간 상충/보완 관계 판단의 어려움', solution: '4중 Guardrail + 5-factor Confidence 보정 + 대안 제시' },
    { title: '문서 파싱 다양성', problem: 'PDF, DOCX, 스캔 이미지 등 다양한 문서 형식 처리 필요', solution: 'Docling + PaddleOCR + python-docx 통합 파싱 파이프라인' },
    { title: 'LLM → sLLM 전환', problem: 'API 기반 LLM에서 온프레미스 sLLM으로의 원활한 전환', solution: '공통 LLM 모듈 설계 — provider만 교체하면 GPT/Claude/vLLM 전환 가능' },
];

const TEAM_MEMBERS = [
    { name: '신지용', role: 'PM', desc: '프로젝트 관리, 의도 분류, 오케스트레이터, 문서 Agent' },
    { name: '문지영', role: 'FE / AI', desc: 'React UI, SSE, Intent 분류, Planner LoRA' },
    { name: '안혜빈', role: 'BE', desc: 'FastAPI, DB, 인증, Google API, 멀티 Agent 기능 강화' },
    { name: '윤경은', role: 'AI', desc: '판단 Agent, RAG, LoRA 파인튜닝, 팀스페이스 기능' },
];

const TECH_STACK = {
    'AI/ML': ['LangGraph', 'Kanana-1.5-8B', 'LoRA', 'KoELECTRA', 'vLLM'],
    'RAG': ['Qdrant Cloud', 'BM25', 'kiwipiepy', 'RRF', 'bge-reranker-v2-m3', 'HyDE'],
    'Embedding': ['ko-sbert-nli (768D)'],
    'Backend': ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'JWT', 'SSE', 'Redis'],
    'Frontend': ['React 18', 'Vite', 'Zustand', 'TanStack Query', 'Tailwind', 'FullCalendar'],
    'Infra': ['AWS EC2', 'S3', 'RDS', 'Docker', 'GitHub Actions', 'RunPod A100'],
    'Document': ['Docling', 'PaddleOCR', 'python-docx'],
};

const SECTIONS = [
    { id: 'architecture', label: 'System Architecture' },
    { id: 'strategy', label: 'Development Strategy' },
    { id: 'vllm-serving', label: 'vLLM Serving' },
    { id: 'agents', label: 'Multi-Agent System' },
    { id: 'agent-detail', label: 'Agent Detail' },
    { id: 'guardrail', label: '4중 보조장치' },
    { id: 'confidence', label: '5-factor Confidence' },
    { id: 'rag', label: 'RAG Pipeline' },
    { id: 'finetuning', label: 'Fine-tuning' },
    { id: 'effects', label: '기대 효과' },
    { id: 'contributions', label: 'My Contributions' },
    { id: 'results', label: 'Key Results' },
    { id: 'challenges', label: 'Technical Challenges' },
    { id: 'team', label: 'Team' },
    { id: 'tech', label: 'Tech Stack' },
    { id: 'demo', label: 'Demo', highlight: true },
    { id: 'retrospective', label: 'Retrospective', highlight: true },
];

export default function WorkFlowAgent() {
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
                        <span className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-800 rounded-full tracking-wider uppercase">SKN21 Final</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Team — 3팀 (4명)</span>
                        <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2026.02 — 2026.03</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                        WorkFlow Agent <span className="text-[#5f7f95]">(듀듀)</span>
                    </h1>
                    <p className="text-xl text-[#5f7f95] font-semibold mb-6 tracking-tight">
                        "하나의 채팅으로 업무의 모든 것을"
                    </p>
                    <p className="text-lg text-gray-500 font-medium max-w-3xl leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
                        LangGraph 기반 멀티 Agent 시스템으로, 사내 규정 판단 · 문서 처리 · 일정 관리를 자연어로 통합 자동화하는 프라이빗 AI 어시스턴트. sLLM 파인튜닝으로 기업 보안 환경에서 운영 가능.
                    </p>
                    <div className="flex gap-3">
                        <a href="https://github.com/SKNETWORKS-FAMILY-AICAMP/SKN21-FINAL-3TEAM" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                            GitHub
                        </a>
                    </div>
                </motion.div>

                {/* Core Values */}
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                    {[
                        { label: '보안', value: 'Private sLLM', desc: '사내 데이터 외부 유출 차단' },
                        { label: '정밀', value: 'RAG + 교차 판단', desc: '근거 중심 규정 판단' },
                        { label: '통합', value: 'Google 4종', desc: 'Calendar · Tasks · Gmail · Sheets' },
                    ].map((item, idx) => (
                        <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                            <p className="text-xl font-bold text-[#5f7f95] mb-1">{item.value}</p>
                            <p className="text-xs font-medium text-gray-500">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Overview Stats */}
                <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                    {[
                        { label: 'Agents', value: '4개', sub: 'Judgment / Document / Schedule / Planner' },
                        { label: 'LoRA 어댑터', value: '4개', sub: '판단 / 문서 / Planner / Intent' },
                        { label: 'Intent F1', value: '97.88%', sub: 'KoELECTRA 분류 성능' },
                        { label: 'DB 테이블', value: '12개', sub: 'PostgreSQL + JWT + SSE' },
                    ].map((item, idx) => (
                        <motion.div key={idx} variants={fadeInUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
                            <p className="text-xs font-medium text-gray-500">{item.sub}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* System Architecture */}
                <motion.div id="architecture" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>System Architecture</h2>
                    <p className="text-gray-500 mb-8">LangGraph 기반 멀티 Agent 오케스트레이션 흐름</p>
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-3">
                        {/* User Input */}
                        <div className="flex justify-center">
                            <div className="px-6 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 text-center">사용자 입력</div>
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* Intent Classification */}
                        <div className="flex justify-center">
                            <div className="px-6 py-4 bg-[#5f7f95] rounded-xl text-white text-center max-w-md w-full">
                                <p className="text-sm font-bold">Intent 분류</p>
                                <p className="text-xs text-white/70 mt-1">KoELECTRA, F1 97.88%</p>
                            </div>
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* LangGraph Orchestrator */}
                        <div className="flex justify-center">
                            <div className="px-6 py-4 bg-gray-900 rounded-xl text-white text-center max-w-md w-full">
                                <p className="text-sm font-bold">LangGraph Orchestrator</p>
                                <p className="text-xs text-white/50 mt-1">StateGraph + 조건부 라우팅</p>
                            </div>
                        </div>

                        {/* 4 Agents */}
                        <div className="flex justify-center gap-3 flex-wrap">
                            {[
                                { name: 'Judgment', desc: '규정 판단' },
                                { name: 'Document', desc: '문서 처리' },
                                { name: 'Schedule', desc: '일정 관리' },
                                { name: 'General', desc: '일반 질의' },
                            ].map((a, i) => (
                                <div key={i} className="flex-1 min-w-[120px] max-w-[160px] px-4 py-3 bg-[#5f7f95]/10 border border-[#5f7f95]/30 rounded-xl text-center">
                                    <p className="text-xs font-bold text-[#4a6a80]">{a.name} Agent</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* RAG Pipeline */}
                        <div className="flex justify-center">
                            <div className="px-6 py-4 bg-[#5f7f95] rounded-xl text-white text-center max-w-md w-full">
                                <p className="text-sm font-bold">RAG Pipeline</p>
                                <p className="text-xs text-white/70 mt-1">HyDE → BM25 + Qdrant + RRF + Reranker</p>
                            </div>
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* LLM Module */}
                        <div className="flex justify-center">
                            <div className="px-6 py-4 bg-gray-900 rounded-xl text-white text-center max-w-md w-full">
                                <p className="text-sm font-bold">LLM Module</p>
                                <p className="text-xs text-white/50 mt-1">GPT / Claude API ↔ vLLM + LoRA</p>
                            </div>
                        </div>
                        <div className="flex justify-center"><div className="w-0.5 h-6 bg-gray-300"></div></div>

                        {/* SSE Response */}
                        <div className="flex justify-center">
                            <div className="px-6 py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 text-center">SSE 스트리밍 응답 → React UI</div>
                        </div>
                    </div>
                </motion.div>

                {/* Development Strategy */}
                <motion.div id="strategy" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Development Strategy</h2>
                    <p className="text-gray-500 mb-8">LLM API → sLLM 전환 전략</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {[
                            { step: '01', title: 'API 기반 구현', desc: 'GPT/Claude API로 전체 기능 먼저 구현하여 동작 검증' },
                            { step: '02', title: 'I/O 형태 확정', desc: '동작 확인하면서 각 Agent의 input/output 포맷 확정' },
                            { step: '03', title: '데이터 수집 + 파인튜닝', desc: '확정된 형태에 맞춰 학습 데이터 수집 및 LoRA 파인튜닝' },
                            { step: '04', title: 'sLLM 교체', desc: 'vLLM + LoRA 핫스왑으로 프라이빗 sLLM 전환 완료' },
                        ].map((item, idx) => (
                            <motion.div key={idx} whileHover={{ y: -6 }} className="relative bg-gradient-to-br from-[#5f7f95] to-[#4a6a80] p-5 rounded-2xl text-white overflow-hidden cursor-default">
                                <div className="absolute top-2 right-3 text-white/15 text-4xl font-bold">{item.step}</div>
                                <h3 className="text-base font-bold mb-1 relative z-10">{item.title}</h3>
                                <p className="text-[11px] text-white/70 relative z-10 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* vLLM Serving */}
                <motion.div id="vllm-serving" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>vLLM Serving</h2>
                    <p className="text-gray-500 mb-8">GPT/Claude API → 프라이빗 sLLM 전환 과정과 서빙 안정성 확보</p>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">문제를 어떻게 정의했는가</p>
                        <p className="text-gray-600 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                            처음에는 단순히 "GPT API를 sLLM으로 교체하면 된다"고 생각했습니다. 하지만 실제 전환 과정에서 <strong>세 가지 구조적 문제</strong>를 발견했습니다:
                            sLLM은 JSON 출력을 일관되게 생성하지 못하고(유효율 70%), confidence가 높아도 환각이 발생하며, LoRA 어댑터 4개를 동시에 관리해야 했습니다.
                            이 문제들은 "모델 성능"이 아니라 <strong>"서빙 안정성"</strong>의 문제라고 재정의한 것이 전환점이었습니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {[
                            { label: '공통 LLM 모듈 설계', title: 'Provider 전환 비용 최소화', desc: 'GPT, Claude, vLLM 간 전환이 provider 설정만 바꾸면 되도록 공통 인터페이스를 설계. 개발 초기에는 GPT API로 기능 검증, I/O 확정 후 vLLM으로 교체하는 전략으로 전환 리스크를 최소화.' },
                            { label: 'LoRA 핫스왑', title: '4개 어댑터 동적 관리', desc: '판단 / 문서(요약·생성) / Planner / Intent 4개 LoRA 어댑터를 Kanana-1.5-8B 베이스 위에서 태스크별 핫스왑. RunPod A100(80GB)에서 학습과 서빙을 병행.' },
                            { label: '서빙 안정성', title: 'JSON 유효율 70% → 97%', desc: 'sLLM이 구조화된 JSON을 일관되게 생성하지 못하는 문제를 프롬프트 최적화 + 출력 포맷 단순화 + fallback 파싱 로직으로 해결. 모델 성능이 아닌 서빙 레이어에서 안정성을 확보.' },
                            { label: 'SSE 스트리밍', title: '토큰 단위 실시간 응답', desc: 'sLLM 추론 시간이 수 초 걸리는 문제를 SSE(Server-Sent Events) 스트리밍으로 해결. 토큰 생성 즉시 클라이언트에 전송하여 체감 응답 속도 개선.' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-[#5f7f95] uppercase tracking-wider mb-2">{item.label}</p>
                                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed" style={{ wordBreak: 'keep-all' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 4 Agents */}
                <motion.div id="agents" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Multi-Agent System</h2>
                    <p className="text-gray-500 mb-8">4개 전문 Agent의 역할과 기능</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {AGENTS.map((agent, idx) => (
                            <motion.div key={idx} whileHover={{ y: -4 }} className={`relative bg-gradient-to-br ${agent.color} p-6 rounded-2xl text-white overflow-hidden cursor-default`}>
                                <div className="absolute top-3 right-4 text-white/10 text-5xl font-bold">{agent.icon}</div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">{agent.title}</p>
                                    <h3 className="text-lg font-bold mb-2">{agent.name}</h3>
                                    <p className="text-sm text-white/80 leading-relaxed">{agent.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Agent Detail Comparison Table */}
                <motion.div id="agent-detail" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Agent Detail Comparison</h2>
                    <p className="text-gray-500 mb-8">각 Agent의 입출력, 핵심 기술, 특징 비교</p>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 font-bold text-gray-700">Agent</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">입력</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">핵심 기술</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-600">RAG</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">출력 포맷</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">특징</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {AGENTS.map((agent, i) => (
                                        <tr key={i} className={`border-b border-gray-50 last:border-0 ${i === 0 ? 'bg-[#5f7f95]/5' : ''}`}>
                                            <td className="px-5 py-3">
                                                <span className="font-semibold text-gray-900">{agent.name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">{agent.input}</td>
                                            <td className="px-4 py-3 text-xs text-gray-700">{agent.coreTech}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${agent.rag.startsWith('O') ? 'bg-slate-50 text-slate-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {agent.rag}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">{agent.output}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{agent.feature}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* 4중 Guardrail */}
                <motion.div id="guardrail" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>4중 보조장치 (Guardrail)</h2>
                    <p className="text-gray-500 mb-8">Judgment Agent의 판단 정확도를 보장하는 4단계 검증 시스템</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {GUARDRAILS.map((item, idx) => (
                            <motion.div key={idx} whileHover={{ y: -4 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5 cursor-default">
                                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{item.icon}</div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 5-factor Confidence */}
                <motion.div id="confidence" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>5-factor Confidence</h2>
                    <p className="text-gray-500 mb-8">Judgment Agent의 다차원 신뢰도 산출 공식</p>
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
                        <div className="bg-gray-900 rounded-xl p-5 text-white text-center">
                            <p className="text-sm font-bold mb-3">Confidence Score</p>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                                <span className="px-3 py-1.5 bg-[#5f7f95] rounded-lg font-bold">LLM raw × 0.60</span>
                                <span className="text-white/40">+</span>
                                <span className="px-3 py-1.5 bg-[#5f7f95] rounded-lg font-bold">RAG avg × 0.25</span>
                                <span className="text-white/40">+</span>
                                <span className="px-3 py-1.5 bg-[#5f7f95] rounded-lg font-bold">규정 커버리지 × 0.15</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-xs mt-2">
                                <span className="text-white/40">−</span>
                                <span className="px-3 py-1.5 bg-red-500/30 rounded-lg">충돌 감점</span>
                                <span className="text-white/40">−</span>
                                <span className="px-3 py-1.5 bg-red-500/30 rounded-lg">환각 감점</span>
                                <span className="text-white/40">−</span>
                                <span className="px-3 py-1.5 bg-red-500/30 rounded-lg">미존재 감점</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { label: 'LLM raw', weight: '60%', desc: 'LLM 자체 판단 신뢰도' },
                            { label: 'RAG avg', weight: '25%', desc: 'RAG 검색 결과 평균 유사도' },
                            { label: '규정 커버리지', weight: '15%', desc: '관련 규정 조항 커버리지 비율' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                <p className="text-xl font-bold text-[#5f7f95] mb-1">{item.weight}</p>
                                <p className="text-xs font-medium text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { label: '충돌 감점', desc: '규정 간 상충 발견 시 신뢰도 하향' },
                            { label: '환각 감점', desc: '근거 없는 판단 감지 시 감점' },
                            { label: '미존재 감점', desc: '인용 조항이 존재하지 않을 경우 감점' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-red-50/50 p-4 rounded-2xl border border-red-100 text-center">
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">{item.label}</p>
                                <p className="text-xs font-medium text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* HyDE + RAG Pipeline */}
                <motion.div id="rag" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>RAG Pipeline</h2>
                    <p className="text-gray-500 mb-8">HyDE + 하이브리드 검색 + Reranker 9단계 파이프라인</p>

                    {/* HyDE Flow */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">HyDE (Hypothetical Document Embeddings)</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-700">
                            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">사용자 질의</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">HyDE 가설 문서 생성</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">BM25 + Vector 검색</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">RRF</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">Reranker</span>
                            <span className="text-slate-400">&rarr;</span>
                            <span className="px-3 py-1.5 bg-white rounded-lg border border-slate-200">Filter</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {RAG_STEPS.map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
                                <div className="w-8 h-8 rounded-full bg-[#5f7f95] text-white flex items-center justify-center mb-3 text-xs font-bold">{item.step}</div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Fine-tuning */}
                <motion.div id="finetuning" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Fine-tuning</h2>
                    <p className="text-gray-500 mb-8">5개 모듈 LoRA 파인튜닝 데이터셋 상세</p>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 font-bold text-gray-700">Model</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Task</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Train</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Eval</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">출처</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Metric</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {FINETUNING.map((row, i) => (
                                        <tr key={i} className={`border-b border-gray-50 last:border-0 ${i === 0 ? 'bg-[#5f7f95]/5' : ''}`}>
                                            <td className="px-5 py-3">
                                                <span className="font-semibold text-gray-900">{row.model}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{row.task}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{row.train}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{row.eval}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{row.source}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-700 rounded-md">{row.metric}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{row.detail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            <strong className="text-gray-900">Adversarial F1:</strong> Intent 분류 모델의 적대적 테스트에서 F1 87.58% 달성. 추론 속도 7.9ms로 실시간 분류 가능.
                        </p>
                    </div>
                </motion.div>

                {/* AS-IS → TO-BE */}
                <motion.div id="effects" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>기대 효과</h2>
                    <p className="text-gray-500 mb-8">AS-IS → TO-BE 업무 효율 비교</p>
                    <div className="space-y-3">
                        {AS_IS_TO_BE.map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-24 flex-shrink-0">
                                        <p className="text-sm font-bold text-gray-900">{item.task}</p>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="p-3 bg-red-50 rounded-xl">
                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">AS-IS</p>
                                            <p className="text-xs text-gray-700 font-medium">{item.asIs}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">TO-BE</p>
                                            <p className="text-xs text-gray-700 font-medium">{item.toBe}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* My Contributions */}
                <motion.div id="contributions" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>My Contributions</h2>
                    <p className="text-gray-500 mb-8">AI Engineer — 판단 Agent + RAG 파이프라인 담당</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CONTRIBUTIONS.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#5f7f95] text-white flex items-center justify-center flex-shrink-0 text-lg font-bold">{idx + 1}</div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Key Results */}
                <motion.div id="results" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Key Results</h2>
                    <p className="text-gray-500 mb-8">프로젝트 주요 성과 요약</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { label: 'Intent 분류', value: 'F1 97.88%', desc: 'KoELECTRA + Label Smoothing' },
                            { label: '파인튜닝', value: '5개 LoRA', desc: '판단 / 문서요약 / 문서생성 / Planner / Intent' },
                            { label: 'RAG', value: 'HyDE+Hybrid', desc: 'HyDE + BM25 + Vector + RRF + Reranker' },
                            { label: 'Google 연동', value: '4종 API', desc: 'Calendar + Tasks + Gmail + Sheets' },
                            { label: 'Backend', value: '12 테이블', desc: 'PostgreSQL + JWT + SSE' },
                            { label: 'Frontend', value: '11 페이지', desc: '카드 UI + FullCalendar' },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{item.label}</p>
                                <p className="text-xl font-bold text-[#5f7f95] mb-1">{item.value}</p>
                                <p className="text-xs font-medium text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Technical Challenges */}
                <motion.div id="challenges" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Technical Challenges</h2>
                    <p className="text-gray-500 mb-8">문제 인식 → 해결 과정</p>
                    <div className="space-y-4">
                        {CHALLENGES.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-start gap-5">
                                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">{idx + 1}</div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="p-3 bg-red-50 rounded-xl">
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Problem</p>
                                                <p className="text-xs text-gray-700 leading-relaxed">{item.problem}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Solution</p>
                                                <p className="text-xs text-gray-700 leading-relaxed">{item.solution}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Team */}
                <motion.div id="team" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Team</h2>
                    <p className="text-gray-500 mb-8">3팀 — 4명 구성</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TEAM_MEMBERS.map((member, idx) => (
                            <div key={idx} className={`bg-white p-5 rounded-2xl border shadow-sm flex gap-4 items-center ${member.name === '윤경은' ? 'border-slate-200 bg-slate-50/30' : 'border-gray-100'}`}>
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${member.name === '윤경은' ? 'bg-[#5f7f95] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-gray-900">{member.name}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${member.name === '윤경은' ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-500'}`}>{member.role}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{member.desc}</p>
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

                {/* Demo Video */}
                <CollapsibleSection id="demo" title="Demo" subtitle="시연 영상">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-black" style={{ aspectRatio: '16/9' }}>
                        <iframe
                            src="https://drive.google.com/file/d/1n2zznBdBTmiGNfgR_Ny88n_0AKZxUYrA/preview"
                            className="w-full h-full"
                            allow="autoplay"
                            allowFullScreen
                        />
                    </div>
                </CollapsibleSection>

                {/* Retrospective */}
                <motion.div id="retrospective" className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Retrospective</h2>
                    <p className="text-gray-500 mb-6">프로젝트를 마치며</p>
                    <div className="space-y-4">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#e27500' }}>핵심 인사이트</p>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">01</span>
                                    <span><strong className="text-gray-900">데이터 양 &lt; 데이터 질</strong> — 판단 Agent v2에서 98건을 추가 보강했지만 오히려 정확도가 -3.2%p 하락. 라벨 오염 때문이었고, v3에서 19건만 정밀 타겟팅하여 +2%p 회복. "많이 넣으면 좋아진다"는 가정이 틀렸음을 실험으로 증명</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">02</span>
                                    <span><strong className="text-gray-900">LLM을 맹신하지 않는 설계</strong> — sLLM이 confidence 0.95를 출력해도 실제로는 틀린 경우가 빈번. 4중 Guardrail(키워드 매칭, 조항 존재 검증, 카테고리 제한, 일관성 모니터링)로 과신을 보정하는 시스템 설계의 중요성 체감</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-bold text-gray-900 shrink-0">03</span>
                                    <span><strong className="text-gray-900">학습과 서빙의 분리</strong> — RAG 컨텍스트를 학습에 넣으면 노이즈로 인해 -9.8%p 급락. "학습은 하드코딩된 깨끗한 데이터로, 서빙은 RAG 정제 삽입으로" 분리하는 전략이 효과적이었음</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>conditional 정확도 78% — 목표 85% 대비 +7%p 부족. 재량적 표현("할 수 있다", "가능하다")의 경계가 모호하여 추가 데이터 수집 필요</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>멀티턴 미지원 — 현재 단건 질문-응답 구조로, 맥락을 유지한 연속 대화가 불가능. 세션 관리 구현 필요</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">-</span>
                                    <span>Reranker +5.7초 — 정확도와 속도의 트레이드오프. 비동기 Reranking이나 캐싱 전략으로 응답시간 개선 여지 있음</span>
                                </li>
                            </ul>
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
