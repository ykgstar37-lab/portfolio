// 아이폰 모양 틀 안에서 화면 녹화 영상을 돌린다 (다이내믹 아일랜드 포함).
// 아일랜드 크기·자리는 iPhone 15 Pro 기준 비율 (화면 폭 393pt 중 125×37pt, 위에서 11pt)
export default function PhoneFrame({ src, poster, className = '', radius = 'rounded-[28px]', border = 'border-4', preload = 'metadata' }) {
    return (
        <div className={`relative overflow-hidden ${radius} ${border} border-slate-900 shadow-xl bg-slate-950 ${className}`}>
            <video src={src} poster={poster} autoPlay muted loop playsInline preload={preload} className="w-full h-full object-cover block" />
            <div className="absolute left-1/2 -translate-x-1/2 bg-black rounded-full pointer-events-none" style={{ top: '1.3%', width: '32%', aspectRatio: '125 / 37' }} />
        </div>
    );
}
