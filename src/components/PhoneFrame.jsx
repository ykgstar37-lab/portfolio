import { useId } from 'react';
import LazyVideo from './LazyVideo';

// 아이폰 모양 틀 안에서 화면 녹화 영상을 돌린다.
// 틀 그림은 RECoco 스토어 스크린샷(marketing/store/make-svg.mjs) 의 기기 SVG 를 그대로 옮긴 것 — 좌표도 그 파일 기준.
// 화면 칸(893×1934)이 녹화 영상 비율(≈0.462)과 같아 영상이 그대로 꽉 찬다.
const VB = { x: 177, y: 760, w: 935, h: 1964 };
const SCREEN_BOX = { x: 198, y: 775, w: 893, h: 1934 };
const BODY = 'M 861.2 760 c 85.69 0 128.53 0 161.26 16.68 a 153 153 0 0 1 66.86 66.86 c 16.68 32.73 16.68 75.57 16.68 161.26 L 1106 2479.2 c 0 85.69 0 128.53 -16.68 161.26 a 153 153 0 0 1 -66.86 66.86 c -32.73 16.68 -75.57 16.68 -161.26 16.68 L 427.8 2724 c -85.69 0 -128.53 0 -161.26 -16.68 a 153 153 0 0 1 -66.86 -66.86 c -16.68 -32.73 -16.68 -75.57 -16.68 -161.26 L 183 1004.8 c 0 -85.69 0 -128.53 16.68 -161.26 a 153 153 0 0 1 66.86 -66.86 c 32.73 -16.68 75.57 -16.68 161.26 -16.68 Z';
const RIM = 'M 862.1 761.5 c 84.85 0 127.27 0 159.68 16.51 a 151.5 151.5 0 0 1 66.21 66.21 c 16.51 32.41 16.51 74.83 16.51 159.68 L 1104.5 2480.1 c 0 84.85 0 127.27 -16.51 159.68 a 151.5 151.5 0 0 1 -66.21 66.21 c -32.41 16.51 -74.83 16.51 -159.68 16.51 L 426.9 2722.5 c -84.85 0 -127.27 0 -159.68 -16.51 a 151.5 151.5 0 0 1 -66.21 -66.21 c -16.51 -32.41 -16.51 -74.83 -16.51 -159.68 L 184.5 1003.9 c 0 -84.85 0 -127.27 16.51 -159.68 a 151.5 151.5 0 0 1 66.21 -66.21 c 32.41 -16.51 74.83 -16.51 159.68 -16.51 Z';
const SCREEN = 'M 870.2 775 c 77.29 0 115.93 0 145.45 15.04 a 138 138 0 0 1 60.31 60.31 c 15.04 29.52 15.04 68.16 15.04 145.45 L 1091 2488.2 c 0 77.29 0 115.93 -15.04 145.45 a 138 138 0 0 1 -60.31 60.31 c -29.52 15.04 -68.16 15.04 -145.45 15.04 L 418.8 2709 c -77.29 0 -115.93 0 -145.45 -15.04 a 138 138 0 0 1 -60.31 -60.31 c -15.04 -29.52 -15.04 -68.16 -15.04 -145.45 L 198 995.8 c 0 -77.29 0 -115.93 15.04 -145.45 a 138 138 0 0 1 60.31 -60.31 c 29.52 -15.04 68.16 -15.04 145.45 -15.04 Z';
const pct = (v, total) => `${(v / total) * 100}%`;
// 영상 모서리를 화면 모양대로 깎는 마스크 (틀 크기가 바뀌어도 같이 늘어난다)
const SCREEN_MASK = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${SCREEN_BOX.w} ${SCREEN_BOX.h}' preserveAspectRatio='none'><path transform='translate(${-SCREEN_BOX.x} ${-SCREEN_BOX.y})' d='${SCREEN}'/></svg>`,
)}")`;

export default function PhoneFrame({ src, poster, className = '' }) {
    const id = useId().replace(/:/g, '');
    const g = (name) => `${name}-${id}`;
    return (
        <div className={`relative ${className}`} style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
            {/* 그림자는 영상과 떨어진 판에 — 영상을 감싼 filter 는 매 프레임 다시 그려 스크롤이 버벅인다 */}
            <div className="absolute pointer-events-none" style={{ left: '1%', right: '1%', top: '0.5%', bottom: '0.5%', borderRadius: '17% / 8%', boxShadow: '0 18px 36px rgba(60,40,20,0.22), 0 3px 8px rgba(60,40,20,0.14)' }} />
            <LazyVideo src={src} poster={poster}
                className="absolute object-cover block bg-slate-950"
                style={{
                    left: pct(SCREEN_BOX.x - VB.x, VB.w), top: pct(SCREEN_BOX.y - VB.y, VB.h),
                    width: pct(SCREEN_BOX.w, VB.w), height: pct(SCREEN_BOX.h, VB.h),
                    WebkitMaskImage: SCREEN_MASK, maskImage: SCREEN_MASK,
                    WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
                }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
                <defs>
                    {/* 기기 테두리: 양쪽 끝(옆면)이 밝게 깎여 보인다 */}
                    <linearGradient id={g('rail')} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#f3eee9" /><stop offset="0.04" stopColor="#b3aaa2" /><stop offset="0.16" stopColor="#635a53" />
                        <stop offset="0.5" stopColor="#3a342f" /><stop offset="0.84" stopColor="#635a53" /><stop offset="0.96" stopColor="#b3aaa2" /><stop offset="1" stopColor="#f3eee9" />
                    </linearGradient>
                    <linearGradient id={g('rim')} x1="0" y1="0" x2="0.7" y2="1">
                        <stop offset="0" stopColor="#fff" stopOpacity="0.70" /><stop offset="0.24" stopColor="#fff" stopOpacity="0.10" />
                        <stop offset="0.58" stopColor="#fff" stopOpacity="0.46" /><stop offset="1" stopColor="#fff" stopOpacity="0.08" />
                    </linearGradient>
                    <linearGradient id={g('btn')} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#26211d" /><stop offset="0.35" stopColor="#978d84" /><stop offset="0.6" stopColor="#544c45" /><stop offset="1" stopColor="#26211d" />
                    </linearGradient>
                    <linearGradient id={g('glare')} x1="0" y1="0" x2="0.75" y2="1">
                        <stop offset="0" stopColor="#fff" stopOpacity="0.16" /><stop offset="0.16" stopColor="#fff" stopOpacity="0.05" /><stop offset="0.34" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id={g('lens')} cx="0.34" cy="0.28" r="0.8">
                        <stop offset="0" stopColor="#5a4638" /><stop offset="0.55" stopColor="#14100d" /><stop offset="1" stopColor="#070605" />
                    </radialGradient>
                </defs>
                <g>
                    <rect x="177" y="1099" width="13" height="73" rx="5.06" fill={`url(#${g('btn')})`} />
                    <rect x="177" y="1224" width="13" height="140" rx="5.06" fill={`url(#${g('btn')})`} />
                    <rect x="177" y="1403" width="13" height="140" rx="5.06" fill={`url(#${g('btn')})`} />
                    <rect x="1099" y="1244" width="13" height="242" rx="5.06" fill={`url(#${g('btn')})`} />
                </g>
                {/* 몸통에서 화면 자리만 뚫어 아래 영상이 보이게 */}
                <path d={`${BODY} ${SCREEN}`} fill={`url(#${g('rail')})`} fillRule="evenodd" />
                <path d={RIM} fill="none" stroke={`url(#${g('rim')})`} strokeWidth="2" />
                {/* 유리 안쪽 그림자 (테두리 쪽만 살짝 어둡게) */}
                <path d={SCREEN} fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="8" />
                <rect x="502" y="802" width="286" height="72" rx="36" fill="#0a0806" />
                <circle cx="748.4" cy="838" r="18.72" fill={`url(#${g('lens')})`} />
                <circle cx="742.78" cy="832.38" r="5.24" fill="#FF7A2F" fillOpacity="0.45" />
                <path d={SCREEN} fill={`url(#${g('glare')})`} />
            </svg>
        </div>
    );
}
