import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import TechnicalDrawer from '../components/TechnicalDrawer';
import SectionDotNav from '../components/SectionDotNav';
import ProjectFlowSection from '../components/ProjectFlowSection';
import webDemo from '../assets/subflow/subflow_web.mp4';
import webPoster from '../assets/subflow/subflow_web.png';
import mobileDemo from '../assets/subflow/subflow_mobile.gif';

const PRIMARY = '#14b8a6';
const SECONDARY = '#2563eb';
const INDIGO = '#4f46e5';
const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const sections = ['goal','problem','architecture','decisions','evaluation','contributions','challenges','demo','presentation','retrospective'].map((id) => ({ id, label: id === 'decisions' ? 'Approach' : id[0].toUpperCase() + id.slice(1), highlight: id === 'decisions' || id === 'demo' || id === 'presentation' || id === 'retrospective' }));
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
const stats = [['87 / 164','USD 요금제','절반 이상이 환율에 노출'], ['11','DB Tables','normalized schema'], ['7','Routers','/api/v1 core APIs'], ['41','Backend Tests','pytest 커버리지']];
const chips = ['FastAPI','SQLAlchemy 2.0 async','React 19','TypeScript','React Native','Expo','PostgreSQL 16','Zustand','Recharts','Railway','Cloudflare Pages','JWT'];

// 문제 → 의사결정 → 해결·결과 (PORTFOLIO.md 5개 서사, 실제 GitHub 구현 기준)
const narratives = [
  ['외부 구독 연동의 한계 → 카탈로그 기반 전환',
   '카드·앱스토어 결제 내역을 자동으로 긁어와 구독을 채우는 게 이상이지만, 실제 가능한지 검증이 필요했다.',
   '플랫폼별 API를 직접 조사 → 앱스토어·카드사 모두 제3자에게 구독 목록을 주지 않음(카드는 마이데이터 인가 필요). 자동 수집을 포기하고 카탈로그 선택 방식으로 전환.',
   '서비스 83종·요금제 164개·카테고리 12개 카탈로그 구축 → 검색·선택만으로 등록. 이 카탈로그가 이후 요금 인상 감지·중복 구독 판정의 전제 조건이 됨.'],
  ['수동 입력 UX → 카탈로그 + 요금제 재설계',
   '서비스명을 직접 타이핑하는 방식이라, 오타·표기 불일치로 중복 감지·분석 품질이 떨어졌다.',
   'services/service_plans를 추가하고 subscriptions에 FK를 nullable로 연결. service_name 컬럼을 남겨 카탈로그 등록 구독과 직접 입력 구독이 한 테이블에 공존하도록 설계.',
   '입력이 "타이핑→선택"으로 바뀌어 데이터 오류 감소. 가격 이력·중복 감지가 정확히 동작.'],
  ['"요금이 올랐다"를 어떻게 아는가 → 카탈로그를 구독과 분리',
   '사용자가 입력한 금액만 저장하면 요금이 인상됐는지 알 방법이 없다. 중복 구독 판정도 기준이 없으면 성립하지 않는다.',
   '카탈로그(services / service_plans)를 사용자 구독(subscriptions)과 분리하고, plan_price_history가 요금제별 가격 변동을 기록하도록 설계. 12개 카테고리는 단순 분류가 아니라 중복 구독 감지의 판정 기준으로 사용.',
   '"내가 쓰는 서비스의 요금이 인상됐다" 알림과 "같은 카테고리에 겹치는 구독이 있다" 경고가 비로소 성립. 서비스별 cancel_url을 저장해 알림에서 해지 페이지로 바로 연결.'],
  ['웹·모바일 이원화 위험 → API-first 백엔드',
   '웹·모바일 로직을 양쪽에 중복 구현하면 유지보수가 두 배가 된다.',
   '모든 도메인 로직을 FastAPI 서비스 계층에 두고, 두 클라이언트는 /api/v1만 소비하는 얇은 계층으로 유지.',
   '동일 백엔드·계약(JWT+Axios) 공유 → 로직 변경 시 한 곳만 수정.'],
  ['안 오는 알림 → 개인화 실발송 파이프라인',
   '알림 설정 UI만 있고 실제 발송 로직이 없었다(TODO). 외화 부담도 체감하기 어려웠다.',
   'Frankfurter로 KRW 변환 + 결제·환율·예산·중복·가격 인상을 설정 기반으로 개인화, APScheduler로 발송.',
   '알림 생성과 발송을 분리해(파생 알림 → DB 인박스 적재 → 10분 스케줄러가 미발송 건만 이메일·푸시로 전송) 발송 실패가 알림 데이터를 잃게 만들지 않도록 구성.'],
  ['금액 기준 통일 → 취향이 아니라 데이터가 강제한 요구사항',
   '요금제 164개 중 87개가 외화(USD) 기준이다. 카탈로그의 절반 이상이 환율에 노출돼 있어, 주기·통화를 각자 환산하면 총액과 비중이 조용히 어긋난다.',
   'utils/cost.py에 "월 단위 KRW" 단일 환산 함수를 두고 총액·비중·예산·분석이 전부 이 진입점을 거치게 하고, 전 구간 Decimal로 처리해 부동소수점 오차를 배제.',
   '"그렇게 하는 게 좋아 보여서"가 아니라 "안 하면 절반이 틀려서" 내린 결정. 이후 모든 집계 기능이 같은 기준을 공유.'],
  ['"실시간"이라고 말하지 않기 → 데이터 정직성 설계',
   '무료 환율 API(Frankfurter)는 ECB 고시 기준이라 영업일 1회만 갱신된다. 실시간처럼 보여주면 사용자가 잘못된 판단을 하게 된다.',
   '응답의 기준일(date)을 그대로 보관해 UI가 "언제 기준 환율인지" 밝히게 하고, 1시간 TTL 캐시로 호출량을 줄이며, API 장애 시 폴백 환율로 서비스가 죽지 않게 처리.',
   '정확하지 않은 값을 정확한 척 보여주지 않으면서 외부 API 장애에도 화면이 유지되는 구조.'],
  ['토큰 테이블 없이 1회용 링크 만들기',
   '비밀번호 재설정·이메일 인증에는 보통 토큰 테이블과 만료 토큰 청소 배치가 따라붙는다.',
   'JWT 서명 키에 "바뀌면 안 되는 값"을 혼합 — 재설정 토큰에는 현재 비밀번호 해시를, 인증 토큰에는 대상 이메일을 섞음.',
   '비밀번호가 바뀌는 순간 기존 토큰 서명이 스스로 깨져 1회용이 보장되고, 테이블 추가와 정리 배치가 모두 불필요해짐.'],
  ['개인 프로젝트라도 인증은 프로덕션 기준',
   '로그인·회원가입은 무차별 대입·사용자 열거 등 공격 표면. 데모가 아닌 배포 수준으로.',
   '401 통일(열거 방지) + 미가입 계정도 더미 해시로 bcrypt를 돌려 응답 시간 균일화(타이밍 공격 완화) + slowapi 제한(로그인 10회/분·가입 5회/분) + TRUST_PROXY 기본 off로 IP 스푸핑 우회 차단.',
   'Railway 프로덕션 배포 완료(api.mysubflow.app, 커스텀 도메인 + SSL). 보안이 기능이 아니라 기본값이 되도록 구성.'],
];

const SUBFLOW_TOTAL_SLIDES = 11;
function SubflowSlideViewer() {
  const [current, setCurrent] = useState(1);
  const prev = () => setCurrent(c => Math.max(1, c - 1));
  const next = () => setCurrent(c => Math.min(SUBFLOW_TOTAL_SLIDES, c + 1));
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative">
        <img
          src={`/slides-subflow/slide-${String(current).padStart(2, '0')}.png`}
          alt={`SubFlow 카드뉴스 ${current}`}
          className="w-full h-auto"
        />
        <button onClick={prev} disabled={current === 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={next} disabled={current === SUBFLOW_TOTAL_SLIDES}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-50">
        <span className="text-sm font-bold text-gray-900">{current}</span>
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(current / SUBFLOW_TOTAL_SLIDES) * 100}%`, backgroundColor: PRIMARY }}></div>
        </div>
        <span className="text-sm text-gray-400">{SUBFLOW_TOTAL_SLIDES}</span>
      </div>
    </div>
  );
}

const contributions = [
  ['흩어진 구독 지출을 한 화면으로 통합','서비스별 앱을 직접 열어야 총액을 알 수 없는 문제 -> 서비스 카탈로그와 결제 데이터를 묶어 월/연 지출, 다음 결제일, 예산 상태를 대시보드에 통합 -> 반복 결제 규모를 즉시 확인 가능한 구조로 전환.'],
  ['11개 테이블로 결제 도메인 정규화','구독·서비스·요금제·가격/결제/변경 이력이 한 모델에 섞일 위험 -> 11개 테이블로 정규화(가격 이력 plan_price_history, 변경 타임라인 subscription_history 포함) -> 가격 인상·해지까지 이력으로 추적 가능.'],
  ['수동 입력을 서비스 카탈로그 선택으로 전환','직접 타이핑으로 오타·표기 불일치가 분석 품질을 떨어뜨리던 문제 -> 기존 구독 데이터를 유지한 채 service_id·plan_id FK를 nullable로 추가하고 service_name을 남겨 두 방식이 공존하도록 설계 -> 입력 마찰과 데이터 오류를 동시에 감소.'],
  ['외화 원화 환산 + 개인화 알림 실발송','외화 결제는 환율에 따라 월 지출이 달라지고 알림은 설정만 있던 문제 -> Frankfurter KRW 변환 + APScheduler 기반 개인화 발송 파이프라인 구현 -> 환율 변동까지 반영해 알림을 먼저 전달.'],
  ['금액 환산 기준을 코드 한 곳으로 모음','결제 주기(주·월·분기·연)와 통화(KRW·USD·EUR·JPY)가 섞여 총액과 개별 카드가 다른 기준으로 계산되면 비중 계산이 조용히 틀어지는 문제 -> utils/cost.py에 "월 단위 KRW" 단일 환산 함수를 두고 총액·비중·예산·분석이 전부 이 진입점을 거치게 하고 전 구간 Decimal로 처리 -> 이후 모든 집계 기능이 같은 기준을 공유.'],
  ['프로덕션 배포와 출시 준비까지 완주','기능 구현에서 끝내면 실제 사용자가 쓸 수 없는 문제 -> Railway(백엔드+관리형 Postgres, 커스텀 도메인+SSL)·Cloudflare Pages(랜딩·약관)·EAS(Android 빌드) 배포와 Resend 메일 파이프라인(DKIM/SPF) 구성 -> 약 21,800줄 규모 서비스를 실제 접근 가능한 상태로 운영.'],
];

// 핵심 기능 (PORTFOLIO.md · 데모 영상 순서 기준)
const demoFeatures = [
  ['01','구독 관리','카탈로그에서 선택 추가 또는 커스텀 직접 입력. 활성·일시정지·해지·체험 상태와 주·월·분기·연 결제 주기 지원. 서비스마다 cancel_url을 저장해 알림에서 해지 페이지로 바로 이동.'],
  ['02','대시보드','월/연 총 지출·활성 구독 수·다음 결제일을 한 화면에 요약. 7일 내 결제 예정 위젯으로 임박 결제 강조.'],
  ['03','지출 분석','카테고리별 지출 비중 도넛 + 월별 추이 라인 차트. 다운그레이드·해지·주기 전환 절약 인사이트를 원클릭 적용.'],
  ['04','캘린더 · 타임라인','반복 결제를 달력에 자동 전개하고, 구독 생성·플랜 변경·해지 이력을 타임라인으로 추적.'],
  ['05','예산 · 알림','월 예산 초과 알림 + 결제 N일 전 이메일(SMTP)·푸시 실발송. 요금 인상·중복·환율 알림을 인박스로 통합 관리.'],
  ['06','고급 인사이트','같은 카테고리 중복 구독 감지, 외화 구독 환율 추적(KRW 환산), 요금 인상 이력(plan_price_history) 관리.'],
  ['07','뉴스 + AI 요약','내 구독 서비스 기준으로 뉴스 개인화 정렬, 기사 탭 시 OpenAI(gpt-4o-mini) AI 요약 모달 제공.'],
];

const challenges = [
  ['카탈로그 마이그레이션 중 데이터 보존','운영 중 subscriptions 테이블에 FK를 추가하면 기존 행 처리와 무결성이 문제','전면 재작성 대신 services/service_plans를 만든 뒤 FK를 nullable로 추가하고 service_name 컬럼을 유지','기존 데이터 유지한 채 카탈로그 도입'],
  ['외화 환율의 최신성 vs 호출 비용','환율은 계속 바뀌는데 매 요청마다 외부 API 호출은 비효율적','초기 환율을 저장하고 APScheduler로 주기 갱신 + 임계치 초과 시에만 알림 발송','비용 줄이며 최신 환율 유지'],
  ['JWT 만료 UX','토큰 만료 후 API 실패가 화면 오류처럼 보이는 문제','Axios 인터셉터에서 401을 캐치해 로그인 화면으로 자동 리다이렉트','인증 실패 흐름 명확화'],
  ['뉴스 AI 요약의 비용·지연','기사마다 OpenAI 요약을 호출하면 비용과 응답 지연이 커짐','news_cache 테이블로 요약 결과를 캐싱해 동일 기사 재요약 제거','중복 호출 없이 즉시 응답'],
  ['Railway가 준 DATABASE_URL을 그대로 못 씀','관리형 Postgres는 postgresql://...?sslmode=require 형식을 주는데, SQLAlchemy async는 postgresql+asyncpg://를 요구하고 sslmode 파라미터를 받지 않아 기동 실패','config.py에서 드라이버 스킴을 자동 정규화하고 sslmode를 제거, Dockerfile CMD가 $PORT를 주입받도록 수정','관리형 DB 연결 정상화 후 프로덕션 기동'],
  ['EAS Android 빌드 3회 연속 실패','원인이 여러 개 섞여 있어 로그만으로는 한 번에 특정할 수 없었음','원인을 하나씩 분리 — react-native-worklets 누락(Reanimated 4 필수 의존성) 설치 + babel plugin 등록, babel-preset-expo 직접 의존성 추가, 확장자만 .png이고 실제로는 JPEG였던 로고 6개를 Pillow로 재인코딩','빌드 성공. gradle 로그가 GraphQL → GCS 서명 URL → brotli 압축으로 내려온다는 점까지 파악해 로그 추적 경로 확보'],
  ['카탈로그가 코드 시드 방식이라는 한계','현재 카탈로그는 seed_data.py에 하드코딩돼 앱 기동 시 시드된다. 넷플릭스 요금이 바뀌면 코드를 고치고 재배포해야 한다','서비스 수가 늘수록 이 경로가 병목이 되므로, 관리자 API 또는 별도 데이터 소스로 분리하는 것을 다음 과제로 정의','한계를 인지한 상태로 남겨두고 개선 경로를 명시'],
  ['Cloudflare Pages SPA 폴백이 인증 링크를 삼킴','mysubflow.app/verify-email?token=... 이 HTTP 200을 반환하지만 내용은 랜딩 페이지 — 사용자가 인증 대신 마케팅 화면을 보게 됨','없는 경로를 index.html로 폴백하는 Pages 특성이 원인. 웹앱을 app.mysubflow.app 서브도메인으로 분리 배포하고 백엔드 APP_BASE_URL을 그쪽으로 지정','"200이 왔으니 정상"이 아니라 응답 내용을 확인해야 한다는 검증 기준 확보'],
];


function DrawerTabs(){return [{label:'About',content:<div className="space-y-4"><p className="rounded-2xl p-6 text-sm leading-relaxed text-white" style={{background:'linear-gradient(135deg,#14b8a6,#2563eb)',wordBreak:'keep-all'}}>흩어진 구독 지출을 Web/Mobile에서 한 번에 관리하는 플랫폼. 결제 내역 자동 수집이 현실적으로 불가능함을 사전 조사로 확인하고 카탈로그 선택 방식으로 전환해, 총액·결제일·예산 초과·중복·환율 같은 관리형 인사이트에 집중했습니다. 기획·설계·웹/모바일·백엔드·배포를 풀스택 단독으로 담당.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{stats.map(([v,l,s])=><div key={l} className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-xl font-black" style={{color:PRIMARY}}>{v}</p><p className="text-[10px] font-bold uppercase text-gray-400">{l}</p><p className="text-[10px] text-gray-500">{s}</p></div>)}</div></div>},{label:'Key Features',content:<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[['구독 관리','서비스 카탈로그에서 추가 + 커스텀 직접 입력'],['대시보드','월/연 총 지출·활성 구독 수·다음 결제일 요약'],['지출 분석','카테고리별 비중 + 월별 추이 차트'],['캘린더','과거/미래 결제일을 한눈에'],['변경 타임라인','생성·플랜 변경·해지 이력 추적'],['예산 관리','월 예산 설정 및 초과 알림'],['환율 추적','외화 구독 KRW 자동 변환 + 변동 알림'],['중복 감지','같은 카테고리 내 겹치는 서비스 탐지'],['절약 제안','불필요·중복 구독 기반 비용 절감 추천'],['알림 설정','결제 N일 전·이메일/푸시 실제 발송'],['뉴스 + AI 요약','구독 서비스 관련 뉴스 + OpenAI 기사 요약']].map(([t,d])=><div key={t} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><p className="text-sm font-bold text-gray-900 mb-1">{t}</p><p className="text-xs text-gray-500 leading-relaxed" style={{wordBreak:'keep-all'}}>{d}</p></div>)}</div>},{label:'Tech Stack',content:<div className="flex flex-wrap gap-2">{chips.concat(['SQLAlchemy 2.0(async)','Alembic','Pydantic','Docker','slowapi','APScheduler','OpenAI','Frankfurter API']).map(x=><span key={x} className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 shadow-sm">{x}</span>)}</div>},{label:'API',content:<div className="space-y-3">{['Auth: POST /auth/register, POST /auth/login','Services: GET /services, GET /services/{id}/plans','Subscriptions: GET /subscriptions, POST /subscriptions/from-catalog','Analytics: GET /analytics/overview, GET /analytics/spending-trend','Categories: GET /categories','Notifications: GET /notifications, PUT /notifications/settings','News: GET /news, POST /news/summary (AI 요약)'].map(x=><div key={x} className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600"><span className="font-bold" style={{color:PRIMARY}}>{x.split(':')[0]}</span>{':'+x.split(':').slice(1).join(':')}</div>)}</div>},{label:'DB Schema',content:<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{['users','categories','services','service_plans','plan_price_history','subscriptions','subscription_history','payment_history','notification_settings','notifications','news_cache'].map(x=><div key={x} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><p className="font-mono text-sm font-bold" style={{color:SECONDARY}}>{x}</p></div>)}</div>},{label:'Testing',content:<div className="space-y-3"><p className="text-sm text-gray-600 leading-relaxed" style={{wordBreak:'keep-all'}}>pytest 41개로 인증·구독 CRUD·분석 집계·카테고리·알림·자동 갱신을 커버합니다. 보안 하드닝(응답 통일·rate limit) 이후에는 변경된 보안 동작에 맞춰 테스트를 갱신했고, rate limiter는 테스트 환경에서 비활성화해 테스트 간 상태 오염을 막았습니다.</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{['test_auth','test_services','test_subscriptions','test_analytics','test_categories','test_notifications'].map(x=><div key={x} className="rounded-lg border border-gray-100 bg-white p-3 text-center"><p className="font-mono text-xs font-bold" style={{color:PRIMARY}}>{x}</p></div>)}</div></div>}];}

export default function SubFlow(){
  const navigate=useNavigate();
  useEffect(()=>{const h=window.location.hash;if(h)setTimeout(()=>document.querySelector(h)?.scrollIntoView({behavior:'smooth'}),500);else window.scrollTo(0,0)},[]);
  return <div className="bg-gradient-to-b from-white to-[#f8fbfd] min-h-screen text-gray-900" style={{fontFamily:"'Inter', sans-serif"}}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.button onClick={()=>navigate('/projects')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition mb-12 group" initial={{opacity:0}} animate={{opacity:1}}>← All Projects</motion.button>

      {/* Hero */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-20">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-[10px] font-bold px-3 py-1 bg-teal-50 text-teal-800 rounded-full tracking-wider uppercase">Full-Stack · Solo</span>
          <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">Web + Mobile</span>
          <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2026.03 ~ 진행 중</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-tight" style={{fontFamily:"'Syne', sans-serif",color:PRIMARY}}>SubFlow</h1>
        <p className="text-xl font-semibold mb-6 tracking-tight" style={{color:SECONDARY}}>구독 지출을 한 화면에서 관리하는 Web + Mobile 풀스택 플랫폼</p>
        <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6" style={{wordBreak:'keep-all'}}>결제 내역 자동 수집이 현실적으로 불가능함을 사전 조사로 확인하고, 방향을 바꿔 서비스 카탈로그(83종·요금제 164개) 기반으로 재설계했습니다. React Web과 Expo Mobile이 단일 FastAPI 백엔드를 공유하도록 API-first로 설계해, 11개 DB 테이블·7개 라우터 위에서 구독 등록·지출 분석·중복 감지·환율 추적·개인화 알림·뉴스 AI 요약을 하나의 흐름으로 묶었습니다.</p>
        <div className="flex gap-3 flex-wrap">
          <a href="https://mysubflow.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-full transition hover:opacity-90" style={{backgroundColor:PRIMARY}}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9" /></svg>
            mysubflow.app
          </a>
          <a href="https://github.com/hyebinhy/SubFlow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-full transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            GitHub
          </a>
          <button onClick={()=>document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})} className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-full transition" style={{backgroundColor:'#e27500'}}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Demo
          </button>
        </div>
      </motion.div>

      {/* README-style Overview / Role / Skills */}
      <motion.div id="overview" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:PRIMARY}}>Overview</p>
              <p className="text-gray-700 leading-relaxed" style={{wordBreak:'keep-all'}}>흩어진 개인 구독(Netflix·Spotify·ChatGPT 등)을 한곳에서 관리하고, 지출을 분석하고, 결제일·환율·중복 구독을 알려주는 Web + Mobile 풀스택 서비스입니다. 자동 수집이 불가능함을 사전 조사로 확인한 뒤 카탈로그 선택 방식으로 방향을 전환하고, 총액·결제일·예산·중복·환율 같은 관리형 인사이트에 집중했습니다.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
              <p className="text-gray-600 leading-relaxed" style={{wordBreak:'keep-all'}}>기획·설계부터 React 웹 대시보드, Expo 모바일, FastAPI 백엔드(11개 테이블·7개 라우터), 배포까지 풀스택을 단독으로 담당했습니다. 실현 가능성 조사, 점진적 스키마 마이그레이션, API-first 설계, 개인화 알림 파이프라인, 프로덕션 기준 보안 하드닝을 직접 결정하고 구현했습니다.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {['FastAPI','React 19','TypeScript','React Native','Expo','PostgreSQL','SQLAlchemy 2.0','Zustand','JWT','Docker','nginx','OpenAI'].map(t=>(
                  <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Section id="goal" title="Goal" sub="구독 관리를 기능 목록이 아니라 행동 지표 중심으로 재구성">
        <p><b>문제:</b> 구독 서비스가 여러 앱에 흩어져 월 지출, 다음 결제일, 무료체험 만료, 중복 구독을 사용자가 직접 기억해야 함.</p>
        <p><b>목표:</b> 카탈로그와 결제 데이터를 통합하고, 총액·예산·중복·만료 지표를 Web/Mobile에서 같은 API로 제공.</p>
      </Section>

      <Cards id="problem" title="Problem" items={[['가시성 부족','서비스별 앱을 열어야 월 지출 총액을 알 수 있음'],['중복 결제','YouTube Music + Spotify처럼 같은 목적의 구독이 겹쳐도 인지하기 어려움'],['환율 변동','외화 구독의 실제 원화 지출이 월 예산에 자동 반영되지 않음'],['무료체험·가격 인상 누락','trial 만료일이나 요금 인상을 놓치면 의도하지 않은 결제가 발생']]}/>

      <ProjectFlowSection id="architecture" title="Architecture" subtitle="Web/Mobile 클라이언트가 동일한 FastAPI API와 PostgreSQL 모델을 공유하도록 설계했습니다." accentColor={PRIMARY} variant={fadeInUp} charts={[{title:'System Architecture',description:'멀티 클라이언트 구독 관리 구조',chart}]} notes={[{label:'Deploy',value:'Railway + Cloudflare Pages + EAS'}, {label:'Clients',value:'React Web + Expo Mobile'}, {label:'Reliability',value:'JWT 인터셉터 + 401 리다이렉트'}]}/>

      {/* Approach — 문제 → 의사결정 → 해결·결과 (핵심 섹션) */}
      <motion.div id="decisions" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Approach</h2>
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Results</h2>
        <p className="text-gray-500 mb-8">구현 범위와 검증 가능한 산출물 (실제 레포 기준)</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{stats.map(([v,l,s])=><div key={l} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"><p className="text-3xl font-black" style={{color:PRIMARY}}>{v}</p><p className="text-xs font-bold uppercase text-gray-400 mt-1">{l}</p><p className="text-xs text-gray-500 mt-2">{s}</p></div>)}</div>
      </motion.div>

      <motion.div id="contributions" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>My Contributions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{contributions.map(([t,d],i)=><div key={t} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5"><div className="w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 text-lg font-bold" style={{backgroundColor:i%2?SECONDARY:PRIMARY}}>{i+1}</div><div><h3 className="text-base font-bold text-gray-900 mb-2">{t}</h3><p className="text-sm text-gray-500 leading-relaxed" style={{wordBreak:'keep-all',overflowWrap:'anywhere'}}>{d}</p></div></div>)}</div>
      </motion.div>

      <motion.div id="challenges" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Technical Challenges</h2>
        <p className="text-gray-500 mb-8">구현 단계에서 마주친 기술적 문제와 해결</p>
        <div className="space-y-4">{challenges.map(([t,p,s,r],i)=><div key={t} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><h3 className="font-bold mb-3">{i+1}. {t}</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"><Box label="Problem" text={p}/><Box label="Solution" text={s}/><Box label="Result" text={r} good/></div></div>)}</div>
      </motion.div>

      <motion.div id="demo" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Demo</h2>
        <p className="text-gray-500 mb-8">실제 화면 시연 — Web 우선, Mobile 동일 API 공유</p>
        {/* Web (primary) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{backgroundColor:PRIMARY}}>WEB</span><span className="text-sm font-semibold text-gray-500">React 대시보드 · 지출 분석 · 알림</span></div>
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-lg bg-slate-950">
            <video src={webDemo} poster={webPoster} autoPlay muted loop playsInline className="w-full block" />
          </div>
        </div>
        {/* Mobile + Feature Highlights (옆 공간 활용) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Phone */}
          <div className="w-full lg:w-auto flex justify-center shrink-0">
            <div className="rounded-[28px] overflow-hidden border-4 border-slate-900 shadow-xl max-w-[260px] bg-slate-950">
              <img src={mobileDemo} alt="SubFlow Mobile 시연" className="w-full block" loading="lazy" />
            </div>
          </div>
          {/* Right: mobile note + feature highlights */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{backgroundColor:INDIGO}}>MOBILE</span><span className="text-sm font-semibold text-gray-500">Expo · React Native</span></div>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6" style={{wordBreak:'keep-all'}}>웹과 동일한 <b className="text-gray-900">FastAPI /api/v1 백엔드</b>를 공유합니다. 목업 폴백을 제거하고 실데이터만 렌더링해, 총액·다음 결제일·중복·환율 같은 지표를 모바일에서도 같은 계약으로 보여줍니다.</p>
            <h3 className="text-base font-bold text-gray-900 mb-1 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Feature Highlights</h3>
            <p className="text-gray-400 text-xs mb-4">데모 영상 순서 기준 주요 기능</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
              {demoFeatures.map(([n,t,d])=>(
                <div key={n} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                  <span className="text-base font-black text-gray-200 shrink-0 leading-none pt-0.5" style={{fontFamily:"'Syne', sans-serif"}}>{n}</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{t}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed" style={{wordBreak:'keep-all'}}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div id="presentation" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Presentation</h2>
        <p className="text-gray-500 mb-8">프로젝트 소개 카드뉴스 — 화살표로 넘겨보세요</p>
        <SubflowSlideViewer />
      </motion.div>

      <motion.div id="retrospective" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Retrospective</h2>
        <p className="text-gray-500 mb-6">프로젝트를 마치며</p>
        <div className="space-y-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:PRIMARY}}>핵심 인사이트</p>
            <p className="text-gray-700 leading-relaxed mb-4" style={{wordBreak:'keep-all'}}>
              자동 수집이라는 이상을 <span className="font-semibold text-gray-900">실현 가능성부터 검증</span>해 카탈로그 방식으로 방향을 틀고, 웹·모바일이 하나의 백엔드를 공유하도록 설계하면서 <span className="font-semibold text-gray-900">"기능을 만드는 것"과 "운영 가능한 서비스로 만드는 것"의 차이</span>를 체감했습니다.
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">01</span><span><strong className="text-gray-900">검증 안 된 기능은 실현 가능성부터</strong> — 자동 수집을 구현하기 전에 API 제공 범위를 먼저 조사해 방향을 튼 것이 시간을 아꼈습니다.</span></li>
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">02</span><span><strong className="text-gray-900">Web/Mobile 공유 기준은 API 계약</strong> — UI는 달라도 인증·DTO·분석 응답은 같은 계약으로 묶어야 유지보수가 한 곳에서 끝납니다.</span></li>
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">03</span><span><strong className="text-gray-900">결제 도메인은 이력이 중요</strong> — 가격과 플랜은 계속 바뀌므로 plan_price_history·subscription_history로 변경 이력을 남겨야 인상 감지·타임라인이 가능합니다.</span></li>
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">04</span><span><strong className="text-gray-900">개인 프로젝트라도 인증은 프로덕션 기준</strong> — rate limiting·사용자 열거 방지·시크릿 분리는 데모와 배포를 가르는 기본기입니다.</span></li>
            </ul>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span><span className="line-through text-gray-400">알림 발송 로직 부재(TODO) → <strong className="text-gray-600 no-underline">APScheduler 기반 개인화 실발송 구현 완료</strong></span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span><span className="line-through text-gray-400">수동 입력 데이터 품질 저하 → <strong className="text-gray-600 no-underline">서비스 카탈로그 + FK 마이그레이션으로 정규화 완료</strong></span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 text-xs font-bold mt-0.5 w-14 shrink-0">높음</span><span>관측성(Observability) — 배포 후 로그로만 상태를 확인 중. 헬스체크·에러 트래킹·지표 대시보드 도입 필요</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 text-xs font-bold mt-0.5 w-14 shrink-0">중간</span><span>테스트 커버리지 — 현재 6개 스위트에서 알림·뉴스 등 엣지 케이스까지 확대 필요</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 text-xs font-bold mt-0.5 w-14 shrink-0">낮음</span><span>CI/CD — 현재 수동 배포, GitHub Actions 자동화 파이프라인 미구축</span></li>
            </ul>
          </div>
          <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-600 leading-relaxed italic" style={{wordBreak:'keep-all'}}>
              직접 만든 서비스를 처음으로 배포해 실제로 띄워보고, 컨테이너 상태와 스케줄러·알림 로그로 서비스가 살아 움직이는 것을 지켜보는 경험이 특히 신선했습니다. 코드를 완성하는 것과 운영 중인 시스템을 관찰하며 반응하는 것은 전혀 다른 감각이었고, 기능을 만드는 사람에서 배포·운영까지 책임지는 개발자로 관점이 넓어진 프로젝트였습니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
    <TechnicalDrawer accentColor={PRIMARY} tabs={DrawerTabs()} />
    <ScrollToTop/>
    <SectionDotNav sections={sections}/>
    <FloatingNav/>
  </div>;
}

function PDR({label,color,bg,text}){return <div className={bg+' rounded-xl p-4 sm:p-5'}><p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{color}}>{label}</p><p className="text-sm text-gray-700 leading-relaxed" style={{wordBreak:'keep-all',overflowWrap:'anywhere'}}>{text}</p></div>}
function Section({id,title,sub,children}){return <motion.div id={id} className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}><h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>{title}</h2>{sub&&<p className="text-gray-500 mb-6">{sub}</p>}<div className="bg-white p-6 sm:p-8 rounded-2xl border-l-4 shadow-sm space-y-4 text-gray-700 leading-relaxed" style={{borderColor:PRIMARY,wordBreak:'keep-all'}}>{children}</div></motion.div>}
function Cards({id,title,items}){return <motion.div id={id} className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}><h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>{title}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.map(([t,d],i)=><div key={t} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:i%2?SECONDARY:PRIMARY}}>0{i+1}</p><h3 className="font-bold text-gray-900 mb-2">{t}</h3><p className="text-sm text-gray-500 leading-relaxed" style={{wordBreak:'keep-all'}}>{d}</p></div>)}</div></motion.div>}
function Box({label,text,good}){return <div className={(good?'bg-emerald-50':'bg-slate-50')+' rounded-xl p-3'}><p className={(good?'text-emerald-600':'text-slate-500')+' text-[10px] font-bold uppercase mb-1'}>{label}</p><p className="text-gray-700 leading-relaxed">{text}</p></div>}
