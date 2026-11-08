import React, { useEffect, useRef, useState } from 'react';

// 앱 이름 알약 하나만 두고, 누르면 아래로 관련 링크(홈페이지·웹앱·문서·개인정보)가 펼쳐진다
export default function LinksMenu({ label, icon, items, soft, ink }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition hover:brightness-95"
        style={{ backgroundColor: soft, color: ink }}
      >
        {icon}
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full mt-2 z-30 min-w-[220px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
          {items.map(({ label: l, sub, href }) => (
            <a
              key={href}
              role="menuitem"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
            >
              <span>
                <span className="block font-semibold">{l}</span>
                {sub && <span className="block text-xs text-gray-400">{sub}</span>}
              </span>
              <svg className="w-3.5 h-3.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M9 7h8v8" /></svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
