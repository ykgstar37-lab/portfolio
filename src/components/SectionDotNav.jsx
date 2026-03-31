import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ACCENT = '#e27500';
const BASE = '#444';

export default function SectionDotNav({ sections }) {
    const [active, setActive] = useState('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter(e => e.isIntersecting);
                if (visible.length > 0) {
                    const top = visible.reduce((a, b) =>
                        a.boundingClientRect.top < b.boundingClientRect.top ? a : b
                    );
                    setActive(top.target.id);
                }
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        );

        sections.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-1">
            {sections.map((s) => {
                const isActive = active === s.id;
                const color = s.highlight ? ACCENT : BASE;
                return (
                    <motion.button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className="text-right px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer"
                        style={{
                            color: isActive ? '#fff' : s.highlight ? ACCENT : '#9ca3af',
                            backgroundColor: isActive ? color : 'transparent',
                        }}
                        whileHover={{
                            color: isActive ? '#fff' : s.highlight ? ACCENT : color,
                            backgroundColor: isActive ? color : s.highlight ? `${ACCENT}15` : `${color}10`,
                        }}
                    >
                        {s.label}
                    </motion.button>
                );
            })}
        </nav>
    );
}
