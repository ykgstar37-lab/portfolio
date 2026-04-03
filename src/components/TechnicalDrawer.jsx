import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TechnicalDrawer({ tabs, accentColor = '#e27500' }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const contentRef = useRef(null);

    // body scroll lock
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const scrollToSection = (idx) => {
        setActive(idx);
        const el = document.getElementById(`drawer-section-${idx}`);
        if (el && contentRef.current) {
            const containerTop = contentRef.current.getBoundingClientRect().top;
            const elTop = el.getBoundingClientRect().top;
            contentRef.current.scrollTo({
                top: contentRef.current.scrollTop + (elTop - containerTop),
                behavior: 'smooth'
            });
        }
    };

    // track active section on scroll
    const handleScroll = () => {
        if (!contentRef.current) return;
        const containerTop = contentRef.current.getBoundingClientRect().top;
        const sections = contentRef.current.querySelectorAll('[data-drawer-section]');
        let current = 0;
        sections.forEach((section, idx) => {
            const sectionTop = section.getBoundingClientRect().top - containerTop;
            if (sectionTop < 100) current = idx;
        });
        setActive(current);
    };

    return (
        <>
            {/* Floating Trigger Button — 왼쪽 하단 고정 */}
            <button
                onClick={() => setOpen(true)}
                className="fixed left-6 bottom-6 z-40 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition-all cursor-pointer select-none text-sm font-bold text-white tracking-wide"
                style={{ backgroundColor: accentColor }}
            >
                README
            </button>

            {/* Drawer Overlay */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            className="fixed top-3 right-3 bottom-3 z-50 w-full max-w-4xl bg-white shadow-2xl flex flex-col rounded-3xl overflow-hidden"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: accentColor }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>README</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">Technical Details · {tabs.length} sections</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Mobile horizontal tabs */}
                            <div className="flex gap-1.5 px-4 py-2 border-b border-gray-100 overflow-x-auto md:hidden flex-shrink-0">
                                {tabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToSection(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                                            active === idx
                                                ? 'text-white'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                        style={active === idx ? { backgroundColor: accentColor } : undefined}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {/* Side Index — compact, desktop only */}
                                <div className="w-32 flex-shrink-0 border-r border-gray-100 py-3 overflow-y-auto hidden md:block">
                                    <nav className="space-y-0.5 px-2">
                                        {tabs.map((tab, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => scrollToSection(idx)}
                                                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer truncate ${
                                                    active === idx
                                                        ? 'font-bold text-gray-900 bg-gray-100'
                                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                                }`}
                                                title={tab.label}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Content */}
                                <div
                                    ref={contentRef}
                                    onScroll={handleScroll}
                                    className="drawer-content flex-1 overflow-y-auto px-6 sm:px-8 py-6"
                                >
                                    {tabs.map((tab, idx) => (
                                        <div
                                            key={idx}
                                            id={`drawer-section-${idx}`}
                                            data-drawer-section
                                            className="mb-12"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: accentColor }}>
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>{tab.label}</h3>
                                            </div>
                                            {tab.content}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
