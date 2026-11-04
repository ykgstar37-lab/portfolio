import { useEffect, useRef, useState } from 'react';

// 화면에 보일 때만 받아서 돌리고, 벗어나면 멈추는 반복 영상 (썸네일·데모용).
// 여러 개가 한 페이지에 있어도 보이는 것만 디코딩해서 스크롤이 버벅이지 않는다.
export default function LazyVideo({ src, poster, className = '', style }) {
    const ref = useRef(null);
    const [near, setNear] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                setNear(true);
                el.play?.().catch(() => {});
            } else {
                el.pause?.();
            }
        }, { rootMargin: '200px 0px' });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <video ref={ref} src={near ? src : undefined} poster={poster} muted loop playsInline autoPlay={near}
            preload={near ? 'auto' : 'none'} className={className} style={style} />
    );
}
