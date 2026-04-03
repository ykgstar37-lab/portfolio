import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TechnicalTabs({ tabs }) {
    const [active, setActive] = useState(0);

    return (
        <motion.div
            id="technical-details"
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Technical Details</h2>
            <p className="text-gray-500 mb-6">기술 상세 — 탭을 클릭하여 확인</p>

            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActive(idx)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            active === idx
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {tabs[active].content}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
