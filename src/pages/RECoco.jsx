import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FloatingNav from '../components/FloatingNav';
import ScrollToTop from '../components/ScrollToTop';
import TechnicalDrawer from '../components/TechnicalDrawer';
import SectionDotNav from '../components/SectionDotNav';
import ProjectFlowSection from '../components/ProjectFlowSection';
import PhoneFrame from '../components/PhoneFrame';
import headerVideo from '../assets/recoco/recoco_header.mp4';
import headerPoster from '../assets/recoco/recoco_header.jpg';
import mobileDemo from '../assets/recoco/recoco_mobile.mp4';
import mobilePoster from '../assets/recoco/recoco_mobile.jpg';

const PRIMARY = '#FF7A2F';     // 레코코 주황
const SECONDARY = '#3a2a22';   // 코코 눈 색 (먹색 갈색)
const BRAND_SOFT = '#FFE6D5';
const BRAND_INK = '#7a2e00';
const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const sections = ['goal','problem','architecture','decisions','evaluation','contributions','challenges','demo','presentation','retrospective'].map((id) => ({ id, label: id === 'decisions' ? 'Approach' : id[0].toUpperCase() + id.slice(1), highlight: id === 'decisions' || id === 'demo' || id === 'presentation' || id === 'retrospective' }));
const chart = String.raw`flowchart LR
  Input["빠르게 채우기 7가지<br/>검색 · ISBN/탑승권 바코드<br/>문자 붙여넣기 · 캡처 OCR<br/>포토부스 QR · 공유 확장"] --> Form["RecordForm<br/>12 카테고리"]
  API["Kakao 책·장소 검색<br/>TMDB 영화"] --> Input
  OCR["ML Kit 한국어<br/>폰 안에서 글자 읽기"] --> Input
  Form --> Store[("AsyncStorage<br/>+ 앱 photos 폴더<br/>서버 없음")]
  Store --> Tpl["SVG 양식 25종<br/>react-native-svg<br/>PHOTO_SLOT 사진 칸"]
  Tpl --> Print["코코 출력 애니메이션<br/>롤 이어 붙이기 · 뒤집기"]
  Print --> Out["view-shot<br/>공유 · 앨범 저장"]
  Store --> Backup["백업 파일<br/>내보내기 · 불러오기"]
  Shop["expo-iap 상품 26개<br/>FREE_FOR_ALL 스위치"] --> Tpl
  OTA["expo-updates<br/>runtime = appVersion"] -.-> Form
  style Input fill:#fff4ec,stroke:#FF7A2F
  style Form fill:#fff4ec,stroke:#FF7A2F
  style Store fill:#f0fdf4,stroke:#22c55e
  style Tpl fill:#fef3c7,stroke:#f59e0b
  style Shop fill:#eef2ff,stroke:#4f46e5
  style OTA fill:#eef2ff,stroke:#4f46e5`;
const stats = [['12','Categories','무료 5 · 유료 7'], ['25','Receipt Forms','SVG 양식 파일'], ['7','Quick Fill','검색·바코드·문자·OCR·QR·공유'], ['0원','Server Cost','로그인·서버 없이 폰 안에만']];
const chips = ['Expo SDK 57','React Native 0.86','TypeScript','react-native-svg','Reanimated 4','expo-camera','ML Kit OCR','expo-iap','expo-updates','EAS Build','Kakao API','TMDB'];

// 문제 → 의사결정 → 해결·결과 (RECoco 커밋 기록 기준)
const narratives = [
  ['로그인도 서버도 없이 → 기록은 폰 안에만',
   '하루 기록은 혼자 보는 개인 데이터다. 가입부터 시키면 첫 기록 전에 이탈하고, 서버를 두면 운영비와 개인정보 처리 책임이 함께 생긴다.',
   '기록은 AsyncStorage, 사진은 앱 photos 폴더에만 둔다. 대신 폰을 바꾸거나 앱을 지우면 사라지는 위험을 백업 파일 내보내기·불러오기로 막고, 영수증 10장부터 코코가 말풍선으로 백업을 권하게 했다.',
   '서버 비용 0원, 개인정보 처리방침은 "수집하지 않음". 구매 내역은 스토어가 기억하므로 서버 없이도 결제·복원 구조가 성립.'],
  ['입력이 귀찮으면 기록은 끊긴다 → 카테고리마다 "빠르게 채우기"',
   '영수증 모양이 예뻐도 칸을 손으로 다 채워야 하면 사흘을 못 간다. 기록할 거리는 이미 바코드·문자·캡처·QR 형태로 폰 안에 있다.',
   '책은 ISBN 바코드, 여행은 탑승권 바코드(IATA BCBP), 소비·영화는 카드 결제 문자·예매 알림 붙여넣기, 은행·예매 캡처는 ML Kit 한국어 OCR, 인생네컷은 포토부스 QR, 사진첩에서는 공유 확장으로 바로 들어오게 했다.',
   '입력 경로 7가지. 제목만 치거나 찍기만 하면 나머지 칸이 채워져, 기록 1건이 "타이핑"이 아니라 "확인" 작업이 됨.'],
  ['영수증 모양은 그림이 아니라 SVG 코드로',
   '고정 이미지 틀에 글자를 얹으면 글이 길어질 때 넘치고, 같은 카테고리 기록을 한 롤로 이어 붙일 수도 없다.',
   '양식 25종을 react-native-svg 컴포넌트로 그려 글자 길이만큼 종이가 늘어나게 하고, 양식마다 PHOTO_SLOT(사진 칸 비율)을 선언해 사진 자르기 화면 하나를 모든 양식이 같이 쓰게 했다.',
   '한 기록을 테마만 바꿔 다시 출력할 수 있고, 카테고리별 영수증이 끊김 없이 한 장의 긴 롤로 이어짐. 새 양식은 컴포넌트 하나 + PHOTO_SLOT 한 줄로 추가.'],
  ['유료 출시의 관문 → 무료로 먼저, 결제는 스위치로',
   '상품 26개(카테고리 7·테마 10·코코 옷 9)를 설계했지만, 유료 앱 계약에는 사업자등록번호가 필요해 출시가 묶일 상황이었다.',
   'lib/launch.ts 의 FREE_FOR_ALL 스위치로 전부 무료로 먼저 출시하되 결제 코드(expo-iap)와 상품 ID는 확정해 둔다. 유료화 뒤에도 초기 사용자를 지키려고 첫 실행 날짜와 iOS AppTransaction 의 "처음 받은 빌드 번호"를 함께 본다.',
   '출시 일정을 사업자 등록과 분리. 나중에 스위치 한 줄과 PAID_FROM_BUILD 값만 바꾸면 유료판으로 전환되고, 이전 사용자는 그때 있던 상품을 계속 무료로 씀.'],
  ['심사 없이 고치기 → OTA 와 네이티브 경계 나누기',
   '앱스토어 심사는 하루 이상 걸려 키보드가 링크 칸을 가리는 작은 버그도 바로 고칠 수 없다. 반대로 네이티브 모듈이 없는 옛 빌드에 새 JS를 보내면 켜자마자 죽는다.',
   'expo-updates 에 runtimeVersion = appVersion 을 걸어, 네이티브 모듈이 바뀌는 순간 앱 버전을 올려 OTA 채널을 1.0.0 / 1.0.1 로 나눈다. 공유 확장·결제처럼 네이티브가 필요한 기능은 require 로 감싸 모듈이 없으면 그 기능만 끈다.',
   'JS 수정은 심사 없이 당일 배포, 네이티브 변경은 새 빌드로만. 옛 빌드에 OTA 가 닿아도 앱이 죽지 않는 구조.'],
  ['포토부스 웹 페이지 대신 원본 사진을 바로',
   '포토그레이 QR 페이지는 앱 웹뷰에서 사진이 끝없이 로딩되고 광고 팝업과 배경 그림만 후보로 잡혔다.',
   'QR 주소의 id(base64)를 풀어 sessionId 를 꺼내고, 같은 서버의 원본 경로(image.jpg)를 직접 받는다. 실패하면 원래대로 페이지에서 사진을 찾는다. 받은 완성본은 가로/세로 비율(0.5 미만이면 1×4 띠, 아니면 2×2)로 컷 자리를 계산해 양식에 맞게 자른다.',
   '인화지 원본(2880×3600)을 광고 없이 바로 가져옴. 코코몬 카드·코코치는 한 컷만, 하우스네컷은 창마다 한 컷씩 자동 배치.'],
  ['만든 기능도 품질 기준에 못 미치면 뺀다 → 홈 화면 위젯 철수',
   '영수증 롤을 홈 화면에 띄우는 iOS 위젯을 expo-widgets 로 만들었지만, iOS 기본 위젯의 흰 판을 없앨 수 없어 영수증이 흰 상자 안에 갇혀 보였다.',
   '배경화면을 잘라 위젯 바탕에 깔아 보는 등 우회를 시도한 뒤, 레코코의 핵심인 "종이 느낌"을 해친다고 판단해 위젯·플러그인·네이티브 모듈을 통째로 걷어냈다.',
   '기능 수보다 첫인상을 택함. 걷어낸 덕에 네이티브 의존성이 줄어 빌드와 심사 위험도 함께 감소.'],
];

const TOTAL_SLIDES = 9;
function RecocoSlideViewer() {
  const [current, setCurrent] = useState(1);
  const prev = () => setCurrent(c => Math.max(1, c - 1));
  const next = () => setCurrent(c => Math.min(TOTAL_SLIDES, c + 1));
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative flex items-center justify-center bg-gray-50">
        <img
          src={`/slides-recoco/slide-${String(current).padStart(2, '0')}.jpg`}
          alt={`RECoco 인스타그램 게시물 ${current}`}
          className="max-h-[72vh] w-auto max-w-full object-contain"
        />
        <button onClick={prev} disabled={current === 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={next} disabled={current === TOTAL_SLIDES}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition disabled:opacity-20 backdrop-blur-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-50">
        <span className="text-sm font-bold text-gray-900">{current}</span>
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(current / TOTAL_SLIDES) * 100}%`, backgroundColor: PRIMARY }}></div>
        </div>
        <span className="text-sm text-gray-400">{TOTAL_SLIDES}</span>
      </div>
    </div>
  );
}

const contributions = [
  ['기록을 "출력"하는 경험으로 재정의','메모·사진첩 기록은 쌓여도 다시 보지 않는 문제 -> 기록을 영수증·티켓·카드로 뽑아 모으는 컨셉과 마스코트 코코(입에서 영수증을 뱉는 출력 애니메이션)를 기획 -> 12개 카테고리·25종 양식을 한 흐름으로 묶음.'],
  ['입력 마찰을 카테고리별로 제거','칸을 손으로 채우면 기록이 끊기는 문제 -> ISBN·탑승권 바코드 파싱, 카드 결제·예매 문자 정규식 파서, ML Kit 한국어 OCR, 포토부스 QR 원본 추출, 공유 확장까지 7가지 빠르게 채우기 구현 -> 기록 1건을 "확인" 작업으로 단축.'],
  ['서버 없는 데이터 안정성','폰 안이 유일한 원본인데 저장 실패를 .catch(() => {}) 로 버리고 있던 문제 -> retryOnce(테스트 포함) 후에도 실패하면 홈에 "다시 저장" 띠를 띄우고, 백업 파일 + 10장부터 백업 권유를 추가 -> 기록이 조용히 사라지는 경로를 차단.'],
  ['수익화 구조를 출시 일정과 분리','유료 계약에 사업자등록이 필요해 출시가 묶이는 문제 -> 상품 26개 ID·expo-iap 결제를 붙인 채 FREE_FOR_ALL 스위치로 무료 출시, 첫 실행 날짜·첫 빌드 번호로 초기 사용자 보호 -> 스위치 한 줄로 유료 전환 가능.'],
  ['배포 파이프라인과 스토어 제출까지 단독 완주','기능만 만들고 끝나면 실제 사용자가 못 쓰는 문제 -> EAS Build·Submit, expo-updates OTA 채널, Cloudflare Pages 지원·개인정보 페이지(한/영), 스크린샷·헤더 동영상까지 직접 제작 -> iOS 1.0.1 심사 제출, Android 빌드 진행.'],
  ['마케팅 소재도 코드로 생성','디자인 툴로 만들면 수정할 때마다 처음부터 다시 그려야 하는 문제 -> 앱의 코코 SVG를 그대로 가져와 resvg로 프레임을 그리고 ffmpeg로 묶는 스크립트 작성 -> 앱스토어 헤더(3840×1646)와 인스타 스토리(1080×1920)를 같은 움직임으로 한 번에 생성.'],
];

// 핵심 기능 (인스타 게시물 순서 기준)
const demoFeatures = [
  ['01','홈 · 코코','주황 화면 한가운데 코코와 주간 도장 달력. ＋를 누르면 카테고리 알약이 펼쳐지고, 대사는 한 글자씩 진동과 함께 나온다.'],
  ['02','빠르게 채우기','책 바코드·탑승권·결제 문자·예매 캡처·포토부스 QR로 칸을 채우고, 책·영화·가게는 이름 검색(Kakao·TMDB)으로 찾는다.'],
  ['03','영수증 출력','코코가 덜덜 떨다 입을 벌려 영수증을 뱉어 내는 출력 애니메이션. 크게 보기에서 카드를 누르면 뒷면으로 뒤집힌다.'],
  ['04','롤 이어 붙이기','같은 카테고리 영수증을 한 장의 긴 롤처럼 이어 붙여 보고, 인덱스 스티커 탭으로 소분류·읽은 상태별로 나눠 본다.'],
  ['05','양식 · 테마','같은 기록도 종이를 바꿔 다시 출력. 밤하늘 티켓·팔찌 티켓·사진 영수증·하우스네컷 등 25종, 모양을 고른 뒤 색을 고른다.'],
  ['06','코코몬 카드 · 코코치','인생네컷 한 컷을 수집 카드로. 등급(C~R)은 고를 수 없고 기록 id 로 뽑히며, 열쇠고리 코코치는 뒷면에 적은 것만 남는다.'],
  ['07','달력 · 도장','기록한 날에 도장이 쌓이고, 날짜를 누르면 그날 영수증이 아래로 줄줄이 펼쳐진다.'],
  ['08','코코 옷장','영수증 장수에 따라 모자·안경·목도리 등 옷을 하나씩 받는다. 기록을 계속할 이유를 보상으로.'],
];

const challenges = [
  ['앱 업데이트 뒤 사진·책 표지가 사라짐','iOS 는 앱을 업데이트하면 앱 폴더 경로(Application/<UUID>)가 바뀔 수 있는데, 기록에는 저장 당시의 전체 경로가 들어 있었다','불러올 때 …/Documents/photos/<이름> 부분만 남겨 지금 앱의 photos 폴더로 다시 잇고, 백업 복원과 같은 함수(mapPhotos)를 공유','업데이트·백업 복원 어느 쪽에서도 사진이 끊기지 않음'],
  ['저장 실패가 조용히 삼켜짐','화면엔 영수증이 보이는데 앱을 껐다 켜면 사라지고 이유도 안 뜸 — saveRecords 실패를 빈 catch 로 버리고 있었다','retryOnce 로 한 번 더 시도하고 그래도 실패하면 던져서, 홈에 "지금 앱을 끄면 사라질 수 있어요 [다시 저장]" 띠를 저장될 때까지 유지. retry 는 node --test 로 의존성 없이 테스트','유일한 원본이 사라지는 경로를 사용자에게 드러내고 복구 수단 제공'],
  ['옛 개발 빌드에서 켜자마자 종료','공유 확장 넣기 전 빌드에 새 JS 가 닿자 "Cannot find native module ExpoLinking" 으로 크래시','expo-share-intent·expo-iap 을 정적 import 대신 require 로 불러와 실패하면 그 기능만 끔. 이후 네이티브 추가 시 앱 버전을 올려 OTA runtime 을 분리하는 규칙으로 정착','OTA 가 옛 빌드에 닿아도 앱이 죽지 않음'],
  ['앱 심사 자동 반려 — 쓰지도 않는 마이크 권한','녹음 기능이 없는데 NSMicrophoneUsageDescription 이 "Allow app to access your microphone" 기본 영어 문구로 들어가 자동 검사에서 막힘','expo-camera·expo-image-picker 플러그인이 기본값으로 넣는 것을 찾아 두 곳 모두 microphonePermission: false. expo config introspect 로 Info.plist 권한 문구가 전부 한국어 실사용 설명인지 확인 후 빌드 13 재제출','Android RECORD_AUDIO 까지 함께 제거. 플러그인 추가 시 권한 문구를 점검하는 절차 확보'],
  ['키보드가 QR 링크 칸을 가림','포토부스 링크를 붙여넣으려 해도 키보드가 입력칸을 덮고 내려가지도 않아 가져오기 자체가 막힘','KeyboardAvoidingView 로 칸을 밀어 올리고, 카메라 영역을 누르거나 이동 키를 누르면 키보드를 내림. 같은 구조를 바코드 책 찾기 화면에도 적용','네이티브 변경 없이 OTA 로 당일 배포'],
  ['하우스네컷은 1×4 인데 QR 은 2×2 로 올 수도','네컷 완성본은 업체·프레임마다 1×4 띠 또는 2×2 격자로 와서, 한 가지로 자르면 다른 쪽이 깨짐','가로/세로 비율 0.5 를 기준으로 띠와 격자를 판별하고, i번째 컷 자리를 계산해 양식 칸 비율에 맞게 가운데 잘라 내는 cutOf 함수 하나로 통일','어떤 완성본이 와도 양식별로 한 컷 또는 네 컷을 자동 배치'],
];

function DrawerTabs(){return [{label:'About',content:<div className="space-y-4"><p className="rounded-2xl p-6 text-sm leading-relaxed text-white" style={{background:'linear-gradient(135deg,#FF9150,#FF7A2F)',wordBreak:'keep-all'}}>책·영화·소비·여행·인생네컷 같은 하루 기록을 영수증·티켓·카드로 "출력"해 모으는 iOS/Android 앱. 로그인·서버 없이 기록은 폰 안에만 두고, 바코드·문자·캡처 OCR·포토부스 QR로 입력 마찰을 줄였습니다. 기획·캐릭터·앱·스토어 출시·마케팅 소재까지 단독으로 진행.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{stats.map(([v,l,s])=><div key={l} className="bg-gray-50 p-4 rounded-xl text-center"><p className="text-xl font-black" style={{color:PRIMARY}}>{v}</p><p className="text-[10px] font-bold uppercase text-gray-400">{l}</p><p className="text-[10px] text-gray-500">{s}</p></div>)}</div></div>},{label:'Categories',content:<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[['독서 (무료)','ISBN 바코드·Kakao 책 검색, 완독·읽는 중·잠시 멈춤'],['영화 (무료)','TMDB 검색, 예매 문자·캡처로 극장·좌석 채우기'],['소비 (무료)','카드 결제 문자·은행 캡처, 여러 건을 영수증 한 장에'],['여행 (무료)','탑승권 바코드(BCBP)로 공항·편명·좌석, 한글 도시명 → 공항 코드'],['인생네컷 (무료)','포토부스 QR 원본 가져오기, 코코몬 카드·코코치·하우스네컷'],['선물','받은·보낸 선물을 모바일 교환권처럼'],['카페맛집','Kakao 장소 검색, 주문서·집 모양'],['공연전시 · 콘서트','밤하늘·레트로·팔찌·포토·별빛 티켓'],['운동','러닝·헬스·요가·등산·수영, 사진 위 기록'],['음악','앨범 카드·플레이리스트 영수증'],['일상','사진첩 공유 확장으로 바로, 사진 롤 + 뒷면 글']].map(([t,d])=><div key={t} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"><p className="text-sm font-bold text-gray-900 mb-1">{t}</p><p className="text-xs text-gray-500 leading-relaxed" style={{wordBreak:'keep-all'}}>{d}</p></div>)}</div>},{label:'Tech Stack',content:<div className="flex flex-wrap gap-2">{chips.concat(['AsyncStorage','expo-file-system','react-native-view-shot','react-native-webview','expo-share-intent','expo-media-library','resvg','ffmpeg','Cloudflare Pages']).map(x=><span key={x} className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200 shadow-sm">{x}</span>)}</div>},{label:'Products',content:<div className="space-y-3"><p className="text-sm text-gray-600 leading-relaxed" style={{wordBreak:'keep-all'}}>스토어 상품 ID 는 한 번 등록하면 바꿀 수 없어 출시 전에 26개를 확정했습니다. v1.0 은 FREE_FOR_ALL 로 전부 무료이며, 상점에서 하나씩 "무료 받기"로 열어 사용자가 무엇을 쓰는지 남깁니다.</p>{['recoco.category.* — 카테고리 7개 (선물·카페맛집·공연전시·콘서트·운동·음악·일상)','recoco.theme.* — 영수증 테마 10개 (코코몬 카드·코코치·하우스네컷·사진 영수증·별빛 티켓 …)','recoco.outfit.* — 코코 옷 9개 (영수증 장수로 해금, 판매는 보류)'].map(x=><div key={x} className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600"><span className="font-mono font-bold" style={{color:PRIMARY}}>{x.split(' — ')[0]}</span>{' — '+x.split(' — ')[1]}</div>)}</div>}];}

export default function RECoco(){
  const navigate=useNavigate();
  useEffect(()=>{const h=window.location.hash;if(h)setTimeout(()=>document.querySelector(h)?.scrollIntoView({behavior:'smooth'}),500);else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })},[]);
  return <div className="bg-gradient-to-b from-white to-[#fffaf6] min-h-screen text-gray-900" style={{fontFamily:"'Inter', sans-serif"}}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.button onClick={()=>navigate('/projects')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition mb-12 group" initial={{opacity:0}} animate={{opacity:1}}>← All Projects</motion.button>

      {/* Hero */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-12">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase" style={{backgroundColor:BRAND_SOFT,color:BRAND_INK}}>Mobile · Solo</span>
          <span className="text-[10px] font-bold px-3 py-1 bg-gray-900 text-white rounded-full tracking-wider uppercase">iOS + Android</span>
          <span className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full tracking-wider uppercase">2026.09 — 2026.11</span>
          <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full tracking-wider uppercase">iOS App Store 심사 · Android 준비 중</span>
        </div>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-tight" style={{fontFamily:"'Syne', sans-serif",color:PRIMARY}}>RECoco <span className="text-gray-300 font-semibold">레코코</span></h1>
        <p className="text-xl font-semibold mb-6 tracking-tight" style={{color:SECONDARY}}>오늘 하루를 영수증으로 뽑아 모으는 기록 앱</p>
        <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6" style={{wordBreak:'keep-all'}}>기록 앱이 사흘을 못 가는 이유를 "칸 채우기가 귀찮아서"와 "쌓여도 다시 안 봐서"로 보고, 입력은 바코드·결제 문자·캡처 OCR·포토부스 QR로 줄이고 결과물은 마스코트 코코가 뱉어 주는 영수증·티켓·카드로 바꿨습니다. 로그인·서버 없이 폰 안에서만 동작하는 Expo 앱으로, 12개 카테고리·25종 양식·상품 26개를 7주(커밋 265개) 동안 단독으로 만들어 App Store 에 제출했습니다.</p>
        <div className="flex gap-3 flex-wrap">
          <a href="https://github.com/ykgstar37-lab/RECoco" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-full transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            GitHub
          </a>
          <button onClick={()=>document.getElementById('presentation')?.scrollIntoView({behavior:'smooth'})} className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-full transition" style={{backgroundColor:'#e27500'}}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Presentation
          </button>
          <a href="https://recoco.pages.dev" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition hover:brightness-95" style={{backgroundColor:BRAND_SOFT,color:BRAND_INK}}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z" /></svg>
            RECoco
          </a>
          <a href="https://recoco.pages.dev/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-full transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Privacy
          </a>
        </div>
      </motion.div>

      {/* 앱스토어 헤더 동영상 */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-6">
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{backgroundColor:PRIMARY}}>
          <video src={headerVideo} poster={headerPoster} autoPlay muted loop playsInline className="w-full block" />
        </div>
      </motion.div>

      {/* README-style Overview / Role / Skills */}
      <motion.div id="overview" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:PRIMARY}}>Overview</p>
              <p className="text-gray-700 leading-relaxed" style={{wordBreak:'keep-all'}}>읽은 책, 본 영화, 오늘 쓴 돈, 다녀온 여행, 찍은 인생네컷을 적으면 흰 만두 캐릭터 코코가 영수증으로 뽑아 주는 앱입니다. 같은 카테고리 영수증은 한 장의 긴 롤로 이어지고, 달력에는 도장이 쌓이며, 영수증 장수만큼 코코 옷이 하나씩 열립니다. 계정도 서버도 없이 기록은 내 폰 안에만 남습니다.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Role</p>
              <p className="text-gray-600 leading-relaxed" style={{wordBreak:'keep-all'}}>기획·캐릭터·UI 부터 Expo 앱 구현, 문자·바코드·OCR 파서, 인앱 결제 구조, EAS 빌드·OTA·App Store 제출, 지원 페이지와 스토어·인스타 소재 제작까지 단독으로 진행했습니다. 코코몬 카드 틀 그림은 직접 그린 원본을 스크립트로 다듬어 앱 에셋으로 만들었습니다.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {['React Native','Expo','TypeScript','SVG','Reanimated','ML Kit','expo-iap','EAS','OTA','Kakao API','TMDB','Node.js'].map(t=>(
                  <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Section id="goal" title="Goal" sub="기록을 쓰는 일이 아니라 뽑아서 모으는 일로">
        <p><b>문제:</b> 기록 앱은 칸 채우기가 귀찮아 금방 끊기고, 쌓인 기록은 목록 속 글자라 다시 보지 않는다.</p>
        <p><b>목표:</b> 이미 폰 안에 있는 바코드·문자·캡처·QR 로 입력을 줄이고, 결과물을 손에 쥐고 싶은 영수증·티켓·카드로 바꿔 "모으는 재미"로 기록을 이어 가게 한다.</p>
      </Section>

      <Cards id="problem" title="Problem" items={[['입력 마찰','책 제목·저자·출판사, 영화관·좌석, 가게·금액을 매번 손으로 쳐야 함'],['다시 안 보는 기록','메모·사진첩에 쌓인 기록은 목록 속 글자일 뿐 꺼내 볼 이유가 없음'],['흩어진 원본','결제 문자, 예매 알림, 탑승권, 포토부스 QR 사진이 앱마다 흩어져 있음'],['계정 부담','혼자 보는 개인 기록인데 가입·로그인부터 요구하면 첫 기록 전에 이탈']]}/>

      <ProjectFlowSection id="architecture" title="Architecture" subtitle="서버 없이 폰 안에서 입력 → 저장 → SVG 출력까지 끝나도록 설계했습니다." accentColor={PRIMARY} variant={fadeInUp} charts={[{title:'On-device Architecture',description:'입력 경로 7가지 → 로컬 저장 → SVG 양식 출력',chart}]} notes={[{label:'Deploy',value:'EAS Build · Submit + expo-updates OTA'}, {label:'Storage',value:'AsyncStorage + 앱 photos 폴더 + 백업 파일'}, {label:'Billing',value:'expo-iap 상품 26개 · FREE_FOR_ALL'}]}/>

      {/* Approach — 문제 → 의사결정 → 해결·결과 (핵심 섹션) */}
      <motion.div id="decisions" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Approach</h2>
        <p className="text-gray-500 mb-8">문제 → 의사결정 → 해결·결과 · 실제 커밋 기준 {narratives.length}개 의사결정 스토리</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">{[['265','Commits','2026.09.17 — 11.04 · 7주'],['26','Store Products','카테고리 7 · 테마 10 · 옷 9'],['~20k','Lines of TS','app/src'],['1.0.1','iOS Version','빌드 13 App Store 심사 제출']].map(([v,l,s])=><div key={l} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"><p className="text-3xl font-black" style={{color:SECONDARY}}>{v}</p><p className="text-xs font-bold uppercase text-gray-400 mt-1">{l}</p><p className="text-xs text-gray-500 mt-2">{s}</p></div>)}</div>
      </motion.div>

      <motion.div id="contributions" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>My Contributions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{contributions.map(([t,d],i)=><div key={t} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-5"><div className="w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 text-lg font-bold" style={{backgroundColor:i%2?SECONDARY:PRIMARY}}>{i+1}</div><div><h3 className="text-base font-bold text-gray-900 mb-2">{t}</h3><p className="text-sm text-gray-500 leading-relaxed" style={{wordBreak:'keep-all',overflowWrap:'anywhere'}}>{d}</p></div></div>)}</div>
      </motion.div>

      <motion.div id="challenges" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Technical Challenges</h2>
        <p className="text-gray-500 mb-8">구현·출시 단계에서 마주친 기술적 문제와 해결</p>
        <div className="space-y-4">{challenges.map(([t,p,s,r],i)=><div key={t} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"><h3 className="font-bold mb-3">{i+1}. {t}</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"><Box label="Problem" text={p}/><Box label="Solution" text={s}/><Box label="Result" text={r} good/></div></div>)}</div>
      </motion.div>

      <motion.div id="demo" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Demo</h2>
        <p className="text-gray-500 mb-8">실제 화면 시연 — iOS</p>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Phone */}
          <div className="w-full lg:w-auto flex justify-center shrink-0">
            <PhoneFrame src={mobileDemo} poster={mobilePoster} className="w-[260px] max-w-full" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{backgroundColor:BRAND_SOFT,color:BRAND_INK}}>MOBILE</span><span className="text-sm font-semibold text-gray-500">Expo · React Native</span></div>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6" style={{wordBreak:'keep-all'}}>모든 기록과 사진은 <b className="text-gray-900">폰 안에만</b> 저장됩니다. 검색(Kakao·TMDB)·QR 가져오기·버그 신고를 빼면 서버와 주고받는 데이터가 없고, 글자 읽기(OCR)도 폰 안에서 처리합니다.</p>
            <h3 className="text-base font-bold text-gray-900 mb-1 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Feature Highlights</h3>
            <p className="text-gray-400 text-xs mb-4">인스타그램 소개 순서 기준 주요 기능</p>
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
        <p className="text-gray-500 mb-8">인스타그램 소개 게시물 — 화살표로 넘겨보세요</p>
        <RecocoSlideViewer />
      </motion.div>

      <motion.div id="retrospective" className="mb-20" initial="hidden" whileInView="visible" viewport={{once:true}} variants={fadeInUp}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{fontFamily:"'Syne', sans-serif"}}>Retrospective</h2>
        <p className="text-gray-500 mb-6">프로젝트를 마치며</p>
        <div className="space-y-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:PRIMARY}}>핵심 인사이트</p>
            <p className="text-gray-700 leading-relaxed mb-4" style={{wordBreak:'keep-all'}}>
              SubFlow 가 "서버를 운영하는 서비스"였다면 레코코는 <span className="font-semibold text-gray-900">서버 없이 사용자 폰이 유일한 원본인 앱</span>이었습니다. 데이터를 잃는 순간 복구할 곳이 없어서, 기능보다 <span className="font-semibold text-gray-900">"조용히 실패하는 경로"를 없애는 일</span>이 더 중요했습니다.
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">01</span><span><strong className="text-gray-900">입력을 줄이는 게 가장 큰 기능</strong> — 예쁜 양식보다 바코드·문자·QR 로 칸을 채워 주는 쪽이 기록을 이어 가게 만듭니다.</span></li>
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">02</span><span><strong className="text-gray-900">OTA 와 네이티브의 경계는 규칙으로</strong> — 네이티브 모듈이 바뀌면 버전을 올려 runtime 을 나누는 규칙 하나로 옛 빌드 크래시를 막았습니다.</span></li>
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">03</span><span><strong className="text-gray-900">플랫폼 기본값을 믿지 말 것</strong> — 쓰지도 않는 마이크 권한, 업데이트로 바뀌는 앱 폴더 경로처럼 라이브러리·OS 기본 동작이 심사와 데이터를 깨뜨렸습니다.</span></li>
              <li className="flex gap-3"><span className="font-bold text-gray-900 shrink-0">04</span><span><strong className="text-gray-900">출시 일정과 수익화를 분리</strong> — 결제 코드는 붙여 두고 스위치로 무료 출시해, 행정 절차가 출시를 막지 않게 했습니다.</span></li>
            </ul>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">아쉬운 점 & 다음에 하고 싶은 것</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span><span className="line-through text-gray-400">저장 실패를 조용히 버림 → <strong className="text-gray-600 no-underline">재시도 + 다시 저장 띠 + 백업 권유</strong></span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 text-xs font-bold mt-0.5 w-14 shrink-0">해결</span><span className="line-through text-gray-400">예시 사진이 남의 게임 캡처 → <strong className="text-gray-600 no-underline">코코 그림 20장으로 교체</strong></span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 text-xs font-bold mt-0.5 w-14 shrink-0">높음</span><span>테스트 — 문자·탑승권 파서처럼 입력 형식이 자주 바뀌는 부분에 실제 샘플 기반 테스트가 필요</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 text-xs font-bold mt-0.5 w-14 shrink-0">다음</span><span>Android 출시 — Play Console 비공개 테스트(12명 × 14일) 후 정식 출시, 사진 권한 정리</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 text-xs font-bold mt-0.5 w-14 shrink-0">다음</span><span>운동 건강 연동(HealthKit · Health Connect), 포토부스 업체별 원본 사진 주소 확대</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 text-xs font-bold mt-0.5 w-14 shrink-0">낮음</span><span>유료화 — 사업자 등록 후 FREE_FOR_ALL 을 끄고 신규 상품부터 판매</span></li>
            </ul>
          </div>
          <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-600 leading-relaxed italic" style={{wordBreak:'keep-all'}}>
              캐릭터 하나를 정하고 나니 로딩 표시, 백업 권유, 심사용 헤더 영상까지 모든 화면이 "코코라면 어떻게 할까"로 정리됐습니다. 기능을 나열하는 앱이 아니라 하나의 성격을 가진 제품을 만든다는 감각을 처음 얻은 프로젝트였습니다.
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
