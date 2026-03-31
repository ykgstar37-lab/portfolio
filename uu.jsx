import React from 'react';
import { motion } from 'framer-motion';

// 애니메이션 기본 설정 (아래에서 위로 부드럽게 나타남)
const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function PortfolioLayout() {
    return (
        <div className="min-h-screen bg-[#f9f9f9] text-gray-900 font-sans">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <header className="flex justify-between items-center py-8">
                    <div className="text-xl font-bold tracking-tighter">WorkFlow.</div>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
                        <a href="#about" className="hover:text-black transition">About</a>
                        <a href="#works" className="hover:text-black transition">Works</a>
                        <a href="#contact" className="hover:text-black transition">Contact</a>
                    </nav>
                </header>

                {/* Hero Section */}
                <motion.section
                    className="flex flex-col lg:flex-row items-center justify-between min-h-[60vh] py-20 gap-12"
                    initial="hidden" animate="visible" variants={fadeInUp}
                >
                    <div className="lg:w-1/2 space-y-6">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">+200 Projects | +50 Clients</p>
                        <h1 className="text-7xl font-light tracking-tight">Hello</h1>
                        <p className="text-lg text-gray-600 max-w-md">
                            I specialize in creating user-centric designs for small to medium-sized IT companies and startups.
                        </p>
                    </div>
                    <div className="lg:w-1/2 w-full h-[500px] bg-gray-200 rounded-2xl object-cover">
                        {/* 인물 사진 영역 */}
                    </div>
                </motion.section>

                {/* About Section */}
                <motion.section
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-20"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                >
                    <div>
                        <h2 className="text-3xl font-semibold mb-6">About Me</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Building simple, clean, and functional interfaces. I focus on optimizing the workflow and creating scalable digital products that drive growth.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-4xl font-light mb-2">120%</h3>
                            <p className="text-sm text-gray-500">Growth Driven Design & Output</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-black rounded-full"></span> Problem solving
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-black rounded-full"></span> Agile collaboration
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Journey Section */}
                <motion.section
                    className="py-20"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                >
                    <h2 className="text-3xl font-semibold mb-10">Explore My Design Journey</h2>
                    <div className="space-y-6">
                        {/* Experience Item 1 */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div>
                                <h3 className="text-lg font-medium">Lead Designer, WorkFlow</h3>
                                <p className="text-sm text-gray-500 mt-1">Feb 2026 - Present</p>
                            </div>
                            <div className="mt-4 sm:mt-0 flex gap-3">
                                <span className="px-4 py-1.5 bg-gray-100 text-xs rounded-full">Full-time</span>
                                <span className="px-4 py-1.5 bg-gray-100 text-xs rounded-full">Remote</span>
                            </div>
                        </div>
                        {/* Experience Item 2 */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div>
                                <h3 className="text-lg font-medium">UI/UX Designer, Team dudu (듀듀)</h3>
                                <p className="text-sm text-gray-500 mt-1">Jan 2025 - Jan 2026</p>
                            </div>
                            <div className="mt-4 sm:mt-0 flex gap-3">
                                <span className="px-4 py-1.5 bg-gray-100 text-xs rounded-full">Contract</span>
                                <span className="px-4 py-1.5 bg-gray-100 text-xs rounded-full">Seoul</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Latest Works Section */}
                <motion.section
                    className="py-20"
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                >
                    <h2 className="text-3xl font-semibold mb-10 text-center">Latest Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="group cursor-pointer">
                                <div className="w-full h-64 bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                                    {/* Hover effect overlay */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                </div>
                                <h4 className="font-medium">Project Name {item}</h4>
                                <p className="text-sm text-gray-500">Web Design</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

            </div>

            {/* Footer */}
            <footer className="bg-[#111] text-white py-20 mt-20 text-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-4xl font-light mb-6">Got a Vision? Let's Bring it to Life!</h2>
                    <p className="text-gray-400 mb-8">Ready to build something great for your startup?</p>
                    <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition">
                        hello@workflow.com
                    </button>
                </motion.div>
            </footer>
        </div>
    );
}