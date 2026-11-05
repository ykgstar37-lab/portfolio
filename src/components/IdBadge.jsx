import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import profileImg from '../assets/profile.jpg';

/* 바코드 막대: 문자열에서 결정적으로 생성 (렌더마다 같은 모양) */
const BARS = (() => {
    const seed = 'YGE-SERVER-BACKEND-0307';
    const out = [];
    for (let i = 0; i < 46; i++) {
        const c = seed.charCodeAt(i % seed.length) + i * 7;
        out.push({ w: (c % 3) + 1, gap: ((c >> 2) % 2) + 1 });
    }
    return out;
})();

/* 끈 한 줄: 직조 결 + 가장자리 박음질 + 인쇄 로고 */
function Strap({ angle, side }) {
    return (
        <div
            className="absolute bottom-0 left-1/2 w-[22px] sm:w-6 h-52 sm:h-60 overflow-hidden"
            style={{
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${angle}deg)`,
                background:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px),' +
                    'repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 2px),' +
                    'linear-gradient(90deg, #0b0b0c 0%, #26272b 18%, #3a3b40 50%, #26272b 82%, #0b0b0c 100%)',
                boxShadow: side === 'left' ? '3px 2px 6px rgba(0,0,0,0.28)' : '-3px 2px 6px rgba(0,0,0,0.28)',
            }}
        >
            <div className="absolute inset-y-0 left-[3px] right-[3px] border-x border-dashed border-white/15" />
            <div
                className="absolute inset-0 flex items-center justify-center text-[8px] font-bold tracking-[0.5em] text-white/25"
                style={{ writingMode: 'vertical-rl', fontFamily: "'Syne', sans-serif" }}
            >
                YGE · YGE · YGE · YGE
            </div>
        </div>
    );
}

/* 금속 크림프 + 스위블 + 랍스터 고리 (SVG) */
function Clasp() {
    return (
        <svg width="46" height="78" viewBox="0 0 46 78" className="relative z-20 -mt-1 drop-shadow-[0_3px_3px_rgba(0,0,0,0.3)]" aria-hidden="true">
            <defs>
                <linearGradient id="metal-h" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#6b7280" />
                    <stop offset="0.25" stopColor="#f8fafc" />
                    <stop offset="0.5" stopColor="#a1a1aa" />
                    <stop offset="0.75" stopColor="#e5e7eb" />
                    <stop offset="1" stopColor="#52525b" />
                </linearGradient>
                <linearGradient id="metal-v" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#f4f4f5" />
                    <stop offset="0.45" stopColor="#a1a1aa" />
                    <stop offset="1" stopColor="#3f3f46" />
                </linearGradient>
            </defs>
            {/* 크림프 (끈 끝을 무는 금속판) */}
            <rect x="5" y="0" width="36" height="15" rx="3" fill="url(#metal-h)" stroke="#52525b" strokeWidth="0.6" />
            <line x1="8" y1="5" x2="38" y2="5" stroke="#3f3f46" strokeOpacity="0.35" strokeWidth="0.8" />
            <line x1="8" y1="10" x2="38" y2="10" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="0.8" />
            {/* 스위블 */}
            <rect x="18" y="15" width="10" height="6" fill="url(#metal-h)" stroke="#52525b" strokeWidth="0.5" />
            <ellipse cx="23" cy="23.5" rx="6.5" ry="3" fill="url(#metal-h)" stroke="#52525b" strokeWidth="0.5" />
            {/* 랍스터 고리 */}
            <path
                fillRule="evenodd"
                fill="url(#metal-v)"
                stroke="#3f3f46"
                strokeWidth="0.6"
                d="M23 26 C 34 26, 37 42, 33 55 C 30 64, 16 64, 13 55 C 9 42, 12 26, 23 26 Z
                   M23 33 C 29 33, 30 43, 28 51 C 26.5 56, 19.5 56, 18 51 C 16 43, 17 33, 23 33 Z"
            />
            {/* 개폐 레버 */}
            <path d="M31 36 L 36 38 L 35 41 L 30.5 40 Z" fill="#d4d4d8" stroke="#52525b" strokeWidth="0.5" />
            <path d="M15 40 C 14 34, 18 30, 22 29.5" fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round" />
            {/* 케이스 고정 탭 (투명 비닐) */}
            <rect x="13" y="54" width="20" height="24" rx="4" fill="rgba(226,232,240,0.55)" stroke="rgba(148,163,184,0.8)" strokeWidth="0.8" />
            <circle cx="23" cy="60" r="2.4" fill="#fff" stroke="rgba(100,116,139,0.6)" strokeWidth="0.8" />
        </svg>
    );
}

export default function IdBadge() {
    // 마우스 기울기 (3D) + 반사광 이동
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 140, damping: 16 });
    const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 140, damping: 16 });
    const glareX = useSpring(useTransform(mx, [-0.5, 0.5], [-35, 35]), { stiffness: 120, damping: 20 });

    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => { mx.set(0); my.set(0); };

    return (
        <motion.div
            animate={{ rotate: [-1.4, 1.4, -1.4] }}
            transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top center' }}
            className="relative flex flex-col items-center select-none"
        >
            {/* 끈 (V자로 모여 크림프로) */}
            <div className="relative w-48 sm:w-56 h-24 sm:h-28 flex justify-center">
                <Strap angle={15} side="left" />
                <Strap angle={-15} side="right" />
            </div>

            <Clasp />

            {/* 투명 비닐 케이스 + 카드 (마우스 기울기) */}
            <div style={{ perspective: 1000 }} className="-mt-[18px]">
                <motion.div
                    onMouseMove={onMove}
                    onMouseLeave={onLeave}
                    style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
                    className="relative w-[272px] sm:w-[340px] rounded-[22px] p-2.5 sm:p-3"
                >
                    {/* 케이스 몸체 */}
                    <div
                        className="absolute inset-0 rounded-[22px] border border-slate-300/70"
                        style={{
                            background: 'linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(241,245,249,0.45) 45%, rgba(226,232,240,0.55) 100%)',
                            boxShadow:
                                'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 6px rgba(148,163,184,0.25),' +
                                '0 30px 50px -22px rgba(15,23,42,0.38), 0 10px 18px -10px rgba(15,23,42,0.2)',
                        }}
                    />
                    {/* 케이스 상단 슬롯 */}
                    <div className="relative mx-auto mb-2.5 w-20 h-2.5 rounded-full bg-slate-300/70 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.35)]" />

                    {/* 인쇄된 카드 */}
                    <div className="relative rounded-[14px] overflow-hidden bg-white ring-1 ring-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.12)]">
                        {/* 헤더 밴드 */}
                        <div className="relative h-11 sm:h-12 bg-[#111214] flex items-center justify-between px-4">
                            <span className="text-white text-base sm:text-lg font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                YGE<span className="text-[#e27500]">.</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.3em] text-white/55 uppercase">Portfolio · ID</span>
                            <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#e27500]" />
                        </div>

                        <div className="p-3.5 sm:p-4">
                            {/* 사진 + 호버 오버레이 */}
                            <div className="relative rounded-lg overflow-hidden group cursor-pointer bg-slate-100 ring-1 ring-slate-200" style={{ aspectRatio: '4 / 5' }}>
                                <img src={profileImg} alt="Yoon Gyeongeun" className="w-full h-full object-cover block" />
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-all duration-500 hidden sm:flex flex-col justify-end p-6">
                                    <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                                        <span className="text-[10px] font-bold px-2.5 py-1 bg-[#e27500]/15 text-[#e27500] rounded-full uppercase tracking-widest">Server / Backend</span>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Gyeongeun Yoon</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">외부 장애 격리 · 배포 자동화 · API 설계</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['FastAPI', 'PostgreSQL', 'Docker', 'AWS'].map(t => <span key={t} className="px-2.5 py-1 bg-gray-900/10 text-gray-600 text-[10px] font-bold rounded-md">{t}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 이름 · 직무 */}
                            <div className="mt-3.5">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Gyeongeun Yoon</h3>
                                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 whitespace-nowrap"><span className="hidden sm:inline">윤경은 · </span>Server / Backend Developer</p>
                            </div>

                            {/* 바코드 */}
                            <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex items-end justify-between gap-3">
                                <div className="flex items-stretch h-7 sm:h-8 min-w-0 overflow-hidden" aria-hidden="true">
                                    {BARS.map((b, i) => (
                                        <span key={i} className="bg-gray-900" style={{ width: b.w, marginRight: b.gap }} />
                                    ))}
                                </div>
                                <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 tracking-wider whitespace-nowrap shrink-0">YGE-0307</span>
                            </div>
                        </div>
                    </div>

                    {/* 비닐 반사광 (기울기에 따라 이동) */}
                    <div className="pointer-events-none absolute inset-0 rounded-[22px] overflow-hidden">
                        <motion.div
                            className="absolute -inset-10"
                            style={{ x: glareX, background: 'linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.5) 42%, rgba(255,255,255,0.08) 48%, transparent 56%)' }}
                        />
                    </div>
                    <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/80" />
                </motion.div>
            </div>
        </motion.div>
    );
}
