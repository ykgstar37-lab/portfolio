import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FloatingNav() {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-3 sm:pb-5"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onTouchStart={() => setVisible(v => !v)}
        >
            {/* Hover trigger zone */}
            <div className="absolute bottom-0 left-0 right-0 h-12" />

            {/* Nav bar */}
            <div
                className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-2 sm:py-2.5 bg-[#1a1a1a] rounded-full shadow-2xl shadow-black/30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: visible ? 'auto' : 'none',
                }}
            >
                {/* Home */}
                <button
                    onClick={() => navigate('/')}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Home"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
                    </svg>
                </button>

                <div className="w-px h-5 bg-white/10 mx-0.5 sm:mx-1" />

                {/* Projects */}
                <button
                    onClick={() => navigate('/projects')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    Projects
                </button>

                {/* Study */}
                <button
                    onClick={() => {
                        navigate('/');
                        setTimeout(() => {
                            document.getElementById('research')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    Study
                </button>

                <div className="w-px h-5 bg-white/10 mx-0.5 sm:mx-1" />

                {/* Contact */}
                <button
                    onClick={() => {
                        navigate('/');
                        setTimeout(() => {
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-[#e27500] hover:bg-[#c96600] rounded-full transition-all"
                >
                    Contact
                </button>
            </div>
        </div>
    );
}
