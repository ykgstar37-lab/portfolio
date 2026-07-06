import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import TechnicalDrawer from '../components/TechnicalDrawer';
import SectionDotNav from '../components/SectionDotNav';
import ProjectFlowSection from '../components/ProjectFlowSection';

const PRIMARY = '#14b8a6';
const SECONDARY = '#2563eb';
const INDIGO = '#4f46e5';
const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const sections = ['goal','problem','architecture','decisions','evaluation','contributions','challenges','screenshots','retrospective'].map((id) => ({ id, label: id === 'screenshots' ? 'Preview' : id === 'decisions' ? 'Approach' : id[0].toUpperCase() + id.slice(1), highlight: id === 'decisions' || id === 'screenshots' || id === 'retrospective' }));
const chart = String.raw`flowchart LR
  Web["React Web\\nTS + Zustand"] --> API["FastAPI /api/v1\\n7 routers"]
  Mobile["Expo Mobile\\nReact Native"] --> API
  API --> Domain["Subscription / Analytics / Notification / News Services"]
  Domain --> DB[("PostgreSQL 16\\n11 normalized tables")]
  Domain --> FX["Frankfurter API\\nKRW conversion"]
  Domain --> AI["OpenAI\\nNews summary"]
  style Web fill:#ecfeff,stroke:#14b8a6
  style Mobile fill:#eef2ff,stroke:#4f46e5
  style API fill:#dbeafe,stroke:#2563eb
  style DB fill:#f0fdf4,stroke:#22c55e`;
const stats = [['2','Clients','React Web + Expo Mobile'], ['11','DB Tables','normalized schema'], ['7','Routers','/api/v1 core APIs'], ['83','Catalog','서비스 · 12 카테고리']];
const chips = ['FastAPI','React 19','TypeScript','React Native','Expo','PostgreSQL 16','Zustand','Recharts','nginx','JWT'];

// 문제 → 의사결정 → 해결·결과 (PORTFOLIO.md 5개 서사, 실제 GitHub 구현 기준)
const narratives = [
  ['외부 구독 연동의 현실적 한계 → 카탈로그 기반으로 전환',
   '카드·앱스토어·카카오 결제 내역을 자동으로 긁어와 구독을 채워주는 것이 "구독 관리 앱"의 이상. 하지만 이게 실제로 가능한지 검증이 필요했다.',
   '플랫폼별 연동 가능성을 직접 조사(INTEGRATION_RESEARCH). 앱스토어·플레이스토어·카카오는 제3자에게 전체 구독 목록 API를 주지 않고, 카드 내역은 마이데이터(금융위 인가)가 있어야 접근 가능. 남는 경로는 Gmail 파싱/IAP뿐 → 개인 범위 초과. 자동 수집을 포기하고 사전 구축 카탈로그에서 선택하는 방식으로 방향 전환.',
   '인기 서비스 83종(12카테고리)·요금제를 DB 카탈로그로 구축 → 검색 → 서비스 선택 → 요금제 선택만으로 등록. 자동 수집 대신 환율·중복·예산·가격 인상 알림 등 "관리형 인사이트"로 제품 가치를 재정의.'],
  ['수동 입력 UX 문제 → 카탈로그 + 요금제 모델로 재설계',
   '초기 버전은 서비스명·금액·결제주기를 직접 타이핑하는 방식. 오타·표기 불일치로 중복 감지·지출 분석 같은 기능의 데이터 품질이 떨어졌다.',
   '기존 인증·분석·알림 코드는 유지하면서 services/service_plans 테이블을 추가하고 subscriptions에 service_id·plan_id FK를 연결하는 점진적 마이그레이션 설계(CATALOG_MIGRATION_PLAN, Alembic 리비전 순차 적용). 전면 재작성이 아닌 스키마 확장으로 리스크 최소화.',
   '정규화된 데이터 위에서 카테고리별 중복 감지, 가격 인상 이력(plan_price_history), 로고·해지 링크가 정확히 동작. 입력이 "타이핑"에서 "선택"으로 바뀌어 입력 마찰과 데이터 오류를 동시에 감소.'],
  ['웹·모바일 코드 이원화 위험 → API-first 단일 백엔드',
   '웹(React)과 모바일(React Native)을 모두 지원해야 하는데, 비즈니스 로직을 양쪽에 중복 구현하면 유지보수가 두 배가 된다.',
   '설계 초기부터 API-first 원칙. 지출 분석·중복 감지·환율 변환 등 모든 도메인 로직을 FastAPI 서비스 계층(8개 service 모듈)에 두고, 웹·모바일은 /api/v1을 소비하는 얇은 클라이언트로만 유지.',
   '웹과 모바일이 동일한 백엔드·동일한 계약(JWT + Axios 인터셉터)을 공유 → 로직 변경 시 한 곳만 수정. 모바일 목업 폴백을 제거하고 실데이터만 렌더링해 두 클라이언트 동작을 일치.'],
  ['"설정만 있고 안 오는 알림" → 개인화 실발송 파이프라인',
   '알림 설정 UI는 있었지만 실제로 발송되는 로직이 없었다(TODO 명시). 외화 구독은 환율에 따라 실질 부담이 달라지는데 사용자가 이를 체감하기 어려웠다.',
   'Frankfurter 환율 API로 외화 구독을 KRW로 자동 변환하고, "결제 N일 전 / 환율 급등 / 예산 초과 / 중복 구독 / 가격 인상"을 notification_settings 기반으로 개인화. APScheduler로 주기 발송하고 발송 이력을 notifications 인박스에 적재.',
   '단순 CRUD를 넘어 선제적으로 돈 새는 지점을 알려주는 서비스로 차별화. 사용자별 설정으로 스팸이 아닌 유의미한 알림만 전달.'],
  ['개인 프로젝트라도 인증은 프로덕션 기준으로 → 보안 하드닝',
   '로그인·회원가입은 흔한 공격 표면(무차별 대입, 사용자 열거, 시크릿 노출). 데모 수준이 아니라 실제 배포 가능한 수준으로 만들고 싶었다.',
   '사용자 열거 방지(로그인 실패 401 통일 + 타이밍 완화), slowapi rate limiting(로그인 10회/분·가입 5회/분), 비밀번호 강도 검증(8자+영문+숫자), 시크릿 환경변수화(.env.example, 기본값 사용 시 기동 경고), 프록시 스푸핑 대비(TRUST_PROXY 기본 off).',
   '보안 동작에 맞춰 테스트를 갱신하고 nginx 컨테이너 + CORS/DB 비밀번호 환경변수화로 운영 배포 구성까지 완료. "돌아가는 데모"가 아니라 배포를 전제로 한 설계.'],
];

const contributions = [
  ['흩어진 구독 지출을 한 화면으로 통합','서비스별 앱을 직접 열어야 총액을 알 수 없는 문제 -> 83종 카탈로그와 결제 데이터를 묶어 월/연 지출, 다음 결제일, 예산 상태를 대시보드에 통합 -> 반복 결제 규모를 즉시 확인 가능한 구조로 전환.'],
  ['11개 테이블로 결제 도메인 정규화','구독, 서비스, 요금제, 가격/결제/변경 이력이 한 모델에 섞일 위험 -> users·services·service_plans·plan_price_history·subscriptions·subscription_history·payment_history 등 11개 테이블로 분리 -> 가격 인상·해지까지 이력으로 추적 가능.'],
  ['수동 입력을 83종 카탈로그 선택으로 전환','직접 타이핑으로 오타·표기 불일치가 분석 품질을 떨어뜨리던 문제 -> 기존 코드를 유지한 채 service_id·plan_id FK를 더하는 점진적 마이그레이션(Alembic 다중 리비전) -> 입력 마찰과 데이터 오류를 동시에 감소.'],
  ['외화 원화 환산 + 개인화 알림 실발송','외화 결제는 환율에 따라 월 지출이 달라지고 알림은 설정만 있던 문제 -> Frankfurter KRW 변환 + APScheduler 기반 개인화 발송 파이프라인 구현 -> 환율 변동까지 반영한 선제적 알림 전달.'],
];

const challenges = [
  ['카탈로그 마이그레이션 중 데이터 보존','운영 중 subscriptions 테이블에 FK를 추가하면 기존 행 처리와 무결성이 문제','전면 재작성 대신 Alembic 리비전으로 services/service_plans를 먼저 만들고 FK를 점진 연결','기존 데이터 유지한 채 스키마 확장'],
  ['외화 환율의 최신성 vs 호출 비용','환율은 계속 바뀌는데 매 요청마다 외부 API 호출은 비효율적','초기 환율을 저장하고 APScheduler로 주기 갱신 + 임계치 초과 시에만 알림 발송','비용 줄이며 최신 환율 유지'],
  ['JWT 만료 UX','토큰 만료 후 API 실패가 화면 오류처럼 보이는 문제','Axios 인터셉터에서 401을 캐치해 로그인 화면으로 자동 리다이렉트','인증 실패 흐름 명확화'],
  ['뉴스 AI 요약의 비용·지연','기사마다 OpenAI 요약을 호출하면 비용과 응답 지연이 커짐','news_cache 테이블로 요약 결과를 캐싱해 동일 기사 재요약 제거','중복 호출 없이 즉시 응답'],
];

function Mockup(){return <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70"><div className="rounded-[22px] bg-slate-950 p-5 text-white"><div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">SubFlow Dashboard</p><p className="mt-1 text-lg font-black">KRW 128,400 / month</p></div><div className="rounded-full bg-teal-400 px-3 py-1 text-[10px] font-black text-slate-950">D-3 billing</div></div><div className="grid grid-cols-3 gap-2">{[['Active','12','bg-cyan-400'],['Overlap','2','bg-indigo-400'],['Trial','1','bg-teal-300']].map(([a,b,c])=><div key={a} className="rounded-2xl bg-white/10 p-3"><p className="text-[10px] font-bold text-slate-400">{a}</p><p className="mt-2 text-2xl font-black">{b}</p><div className={'mt-3 h-1.5 rounded-full '+c}></div></div>)}</div><div className="mt-3 grid grid-cols-5 items-end gap-2 rounded-2xl bg-white/10 p-4">{[30,58,42,74,50].map((h,i)=><div key={i} className="rounded-full bg-gradient-to-t from-teal-300 to-sky-300" style={{height:h}} />)}</div></div></div>}

function DrawerTabs(){return [{label:'About',content:<div className="space-y-4"><p className="rounded-2xl p-6 text-sm leading-relaxed text-white" style={{background:'linear-gradient(135deg,#14b8a6,#2563eb)',wordBreak:'keep-all'}}>흩어진 구독 지출을 Web/Mobile에서 한 번에 관리하는 플랫폼. 결제 내역 자동 수집이 현실적으로 불가능함을 사전 조사로 확인하고 83종(12카테고리) 서비스 카탈로그 선택 방식으로 전환해, 총액·결제일·예산 초과·중복·환율 같은 관리형 인사이트에 집중했습니다. 기획·설계·웹/모바일·백엔드·배포를 풀스택 단독으로 담당.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{stats.map(([v,l,s])=><div key={l} className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-xl font-black" style={{color:PRIMARY}}>{v}</p><p className="text-[10px] font-bold uppercase text-gray-400">{l}</p><p className="text-[10px] text-gray-500">{s}</p></div>)}</div></div>},{label:'Tech Stack',content:<div className="flex flex-wrap gap-2">{chips.concat(['SQLAlchemy 2.0(async)','Alembic','Pydantic','Docker','slowapi','APScheduler','OpenAI','Frankfurter API']).map(x=><span key={x} className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 shadow-sm">{x}</span>)}</div>},{label:'API',content:<div className="space-y-3">{['Auth: POST /auth/register, POST /auth/login','Services: GET /services, GET /services/{id}/plans','Subscriptions: GET /subscriptions, POST /subscriptions/from-catalog','Analytics: GET /analytics/overview, GET /analytics/spending-trend','Categories: GET /categories','Notifications: GET /notifications, PUT /notifications/settings','News: GET /news, POST /news/summary (AI 요약)'].map(x=><div key={x} className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600"><span className="font-bold" style={{color:PRIMARY}}>{x.split(':')[0]}</span>{':'+x.split(':').slice(1).join(':')}</div>)}</div>},{label:'DB Schema',content:<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{['users','categories','services','service_plans','plan_price_history','subscriptions','subscription_history','payment_history','notification_settings','notifications','news_cache'].map(x=><div key={x} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><p className="font-mono text-sm font-bold" style={{color:SECONDARY}}>{x}</p></div>)}</div>}];}

export default function SubFlow(){
  const navigate=useNavigate();
  useEffect(()=>{const h=window.location.hash;if(h)setTimeout(()=>document.querySelector(h)?.scrollIntoView({behavior:'smooth'}),500);else window.scrollTo(0,0)},[]);
  return <div className="bg-gradient-to-b from-white to-[#f8fbfd] min-h-screen text-gray-900" style={{fontFamily:"'Inter', sans-serif"}}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.button onClick={()=>navigate('/projects')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition mb-12 group" initial={{opacity:0}} animate={{opacity:1}}>← All Projects</motion.button>

      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-16 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="text-[10px] font-bold px-3 py-1 bg-teal-50 text-teal-800 rounded-full uppercase">Full-Stack · Solo</span>
            <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full uppercase">2026.03 - 2026.04</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4" style={{fontFamily:"'Syne', sans-serif",color:PRIMARY}}>SubFlow</h1>
          <p className="text-xl font-semibold mb-5" style={{color:SECONDARY}}>구독 지출을 한 화면에서 관리하는 Web + Mobile 풀스택 플랫폼</p>
          <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6" style={{wordBreak:'keep-all'}}>React Web과 Expo Mobile이 단일 FastAPI 백엔드를 공유하는 구독 관리 플랫폼입니다. 결제 내역 자동 수집이 현실적으로 불가능함을 사전 조사로 확인하고, 83종(12카테고리) 서비스 카탈로그, 11개 DB 테이블, 7종 API 라우터로 구독 등록, 지출 분석, 중복 감지, 환율 추적, 가격 인상 알림, 뉴스 AI 요약을 하나의 흐름으로 묶었습니다. 기획·설계·웹/모바일·백엔드·배포를 풀스택 단독으로 담당했습니다.</p>
          <div className="flex gap-3">
            <a href="https://github.com/hyebinhy/SubFlow" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full">GitHub</a>
            <button onClick={()=>document.getElementById('screenshots')?.scrollIntoView({behavior:'smooth'})} className="px-4 py-2 text-white text-sm font-medium rounded-full" style={{backgroundColor:PRIMARY}}>Preview</button>
          </div>
        </div>
        <Mockup />
      </motion.div>

      <Section id="goal" title="Goal" sub="구독 관리를 기능 목록이 아니라 행동 지표 중심으로 재구성">
        <p><b>문제:</b> 구독 서비스가 여러 앱에 흩어져 월 지출, 다음 결제일, 무료체험 만료, 중복 구독을 사용자가 직접 기억해야 함.</p>
        <p><b>목표:</b> 83종(12카테고리) 서비스 카탈로그와 결제 데이터를 통합하고, 총액·예산·중복·만료 지표를 Web/Mobile에서 같은 API로 제공.</p>
      </Section>

      <Cards id="problem" title="Problem" items={[['가시성 부족','서비스별 앱을 열어야 월 지출 총액을 알 수 있음'],['중복 결제','YouTube Music + Spotify처럼 같은 목적의 구독이 겹쳐도 인지하기 어려움'],['환율 변동','외화 구독의 실제 원화 지출이 월 예산에 자동 반영되지 않음'],['무료체험·가격 인상 누락','trial 만료일이나 요금 인상을 놓치면 의도하지 않은 결제가 발생']]}/>

      <ProjectFlowSection id="architecture" title="Architecture" subtitle="Web/Mobile 클라이언트가 동일한 FastAPI API와 PostgreSQL 모델을 공유하도록 설계했습니다." accentColor={PRIMARY} variant={fadeInUp} charts={[{title:'System Architecture',description:'멀티 클라이언트 구독 관리 구조',chart}]} notes={[{label:'Catalog',value:'83종 · 12 카테고리'}, {label:'Clients',value:'React Web + Expo Mobile'}, {label:'Reliability',value:'JWT 인터셉터 + 401 리다이렉트'}]}/>

      {/* Approach — 문제 → 의사결정 → 해결·결과 (핵심 섹션) */}
      <motion.div id="decisions" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{fontFamily:"'Syne', sans-serif"}}>Approach</h2>
        <p className="text-gray-500 mb-8">문제 → 의사결정 → 해결·결과 · 실제 구현 기준 5개 의사결정 스토리</p>
        <div className="space-y-5">
          {narratives.map(([t,p,d,r],i)=>(
            <div key={t} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center text-sm font-bold shrink-0" style={{backgroundColor:i%2?SECONDARY:PRIMARY}}>{i+1}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug" style={{wordBreak:'keep-all'}}>{t}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <PDR label="Problem · 문제" color="#ef4444" bg="bg-red-50" text={p}/>
                <PDR label="Decision · 의사결정" color="#64748b" bg="bg-slate-50" text={d}/>
                <PDR label="Result · 해결·결과" color="#10b981" bg="bg-emerald-50" text={r}/>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div id="evaluation" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{fontFamily:"'Syne', sans-serif"}}>Results</h2>
        <p className="text-gray-500 mb-8">구현 범위와 검증 가능한 산출물 (실제 레포 기준)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map(([v,l,s])=><div key={l} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"><p className="text-3xl font-black" style={{color:PRIMARY}}>{v}</p><p className="text-xs font-bold uppercase text-gray-400 mt-1">{l}</p><p className="text-xs text-gray-500 mt-2">{s}</p></div>)}</div>
      </motion.div>

      <motion.div id="contributions" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{fontFamily:"'Syne', sans-serif"}}>My Contributions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{contributions.map(([t,d],i)=><div key={t} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5"><div className="w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 text-lg font-bold" style={{backgroundColor:i%2?SECONDARY:PRIMARY}}>{i+1}</div><div><h3 className="text-base font-bold text-gray-900 mb-2">{t}</h3><p className="text-sm text-gray-500 leading-relaxed" style={{wordBreak:'keep-all'}}>{d}</p></div></div>)}</div>
      </motion.div>

      <motion.div id="challenges" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{fontFamily:"'Syne', sans-serif"}}>Technical Challenges</h2>
        <p className="text-gray-500 mb-8">구현 단계에서 마주친 기술적 문제와 해결</p>
        <div className="space-y-4">{challenges.map(([t,p,s,r],i)=><div key={t} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><h3 className="font-bold mb-3">{i+1}. {t}</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"><Box label="Problem" text={p}/><Box label="Solution" text={s}/><Box label="Result" text={r} good/></div></div>)}</div>
      </motion.div>

      <motion.div id="screenshots" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{fontFamily:"'Syne', sans-serif"}}>Interface Preview</h2>
        <p className="text-gray-500 mb-8">SubFlow 포인트 색상: teal + sky blue + indigo</p>
        <Mockup />
      </motion.div>

      <Section id="retrospective" title="Retrospective" sub="프로젝트를 진행하며 얻은 판단 기준">
        <ul className="space-y-3 text-sm text-gray-600">
          <li><b className="text-gray-900">검증 안 된 기능은 실현 가능성부터</b> — 자동 수집을 구현하기 전에 API 제공 범위를 먼저 조사해 방향을 튼 것이 시간을 아꼈습니다.</li>
          <li><b className="text-gray-900">Web/Mobile 공유 기준은 API 계약</b> — UI는 달라도 인증, DTO, 분석 응답은 같은 계약으로 묶어야 합니다.</li>
          <li><b className="text-gray-900">결제 도메인은 이력이 중요</b> — 가격과 플랜은 계속 바뀌므로 plan_price_history·subscription_history로 변경 이력을 남겨야 합니다.</li>
          <li><b className="text-gray-900">개인 프로젝트라도 인증은 프로덕션 기준</b> — rate limiting, 사용자 열거 방지, 시크릿 분리는 데모와 배포를 가르는 기본기입니다.</li>
        </ul>
      </Section>
    </div>
    <TechnicalDrawer accentColor={PRIMARY} tabs={DrawerTabs()} />
    <ScrollToTop/>
    <SectionDotNav sections={sections}/>
    <FloatingNav/>
  </div>;
}

function PDR({label,color,bg,text}){return <div className={bg+' rounded-xl p-4'}><p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color}}>{label}</p><p className="text-xs sm:text-sm text-gray-700 leading-relaxed" style={{wordBreak:'keep-all'}}>{text}</p></div>}
function Section({id,title,sub,children}){return <motion.div id={id} className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}><h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{fontFamily:"'Syne', sans-serif"}}>{title}</h2>{sub&&<p className="text-gray-500 mb-6">{sub}</p>}<div className="bg-white p-6 sm:p-8 rounded-2xl border-l-4 shadow-sm space-y-4 text-gray-700 leading-relaxed" style={{borderColor:PRIMARY,wordBreak:'keep-all'}}>{children}</div></motion.div>}
function Cards({id,title,items}){return <motion.div id={id} className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}><h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{fontFamily:"'Syne', sans-serif"}}>{title}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.map(([t,d],i)=><div key={t} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:i%2?SECONDARY:PRIMARY}}>0{i+1}</p><h3 className="font-bold text-gray-900 mb-2">{t}</h3><p className="text-sm text-gray-500 leading-relaxed" style={{wordBreak:'keep-all'}}>{d}</p></div>)}</div></motion.div>}
function Box({label,text,good}){return <div className={(good?'bg-emerald-50':'bg-slate-50')+' rounded-xl p-3'}><p className={(good?'text-emerald-600':'text-slate-500')+' text-[10px] font-bold uppercase mb-1'}>{label}</p><p className="text-gray-700 leading-relaxed">{text}</p></div>}
