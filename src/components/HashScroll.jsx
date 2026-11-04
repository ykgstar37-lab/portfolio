import { useEffect } from 'react';

/**
 * 링크에 #projects 같은 해시가 붙어 들어오면 해당 섹션으로 내려준다.
 * 브라우저 기본 동작은 React가 마운트되기 전에 일어나 대상 엘리먼트를 못 찾는다.
 */
export default function HashScroll() {
    useEffect(() => {
        const id = window.location.hash.replace('#', '');
        // 해시 없이 들어오면 맨 위에서 시작 (상세 페이지에서 내려온 스크롤 위치가 남지 않게)
        if (!id) {
            // html 에 scroll-behavior: smooth 가 걸려 있어 instant 를 줘야 바로 올라간다
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            return;
        }

        let tries = 0;
        const timer = setInterval(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                clearInterval(timer);
            } else if (++tries > 20) {
                clearInterval(timer);
            }
        }, 100);

        return () => clearInterval(timer);
    }, []);

    return null;
}
