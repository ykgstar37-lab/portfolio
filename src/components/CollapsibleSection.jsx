import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollapsibleSection({ id, title, subtitle, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const ref = useRef(null);

    useEffect(() => {
        if (window.location.hash === `#${id}`) {
            setOpen(true);
            setTimeout(() => {
                ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [id]);

    return (
        <motion.div
            id={id}
            ref={ref}
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between group cursor-pointer"
            >
                <div className="text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h2>
                    {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#e27500] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pt-8">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
