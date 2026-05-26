import './Hero.css'
import profileImg from '../assets/profile.jpg'

export default function Hero() {
    const handleCopyEmail = (e) => {
        e.preventDefault()
        navigator.clipboard.writeText('yge0307@gmail.com')
        alert('Email copied!')
    }

    return (
        <section className="hero" id="hero">
            <div className="hero__container">

                {/* Main Content (Title & Portrait) */}
                <div className="hero__main">
                    <div className="hero__text-wrap">
                        <div className="hero__top-stats reveal">
                            <div className="hero__stat">
                                <h2 className="hero__stat-number">+8</h2>
                                <p className="hero__stat-text">TECH STACKS</p>
                            </div>
                            <div className="hero__stat">
                                <h2 className="hero__stat-number">100%</h2>
                                <p className="hero__stat-text">COMMITMENT</p>
                            </div>
                        </div>

                        <h1 className="hero__title-huge reveal reveal-delay-1">Hello</h1>
                        <p className="hero__subtitle reveal reveal-delay-2">
                            — I'm <strong>Yoon Gyeongeun</strong>, AI DevOps / ML Systems Engineer
                        </p>

                        <div className="hero__social reveal reveal-delay-3">
                            <a href="https://github.com/ykgstar37-lab" target="_blank" rel="noopener noreferrer" className="hero__social-link" aria-label="GitHub">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                            </a>
                            <a href="#" onClick={handleCopyEmail} className="hero__social-link" aria-label="Email">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                </svg>
                            </a>
                            <a href="https://www.notion.so/Portfolio-0f5bec2d3d5183c59c0781ef20c9988a?source=copy_link" target="_blank" rel="noopener noreferrer" className="hero__social-link" aria-label="Notion">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.29 2.09c-.42-.326-.98-.7-2.055-.607L3.01 2.721c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.046-.747.326-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.726l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM2.332 1.68l13.582-.934c1.682-.14 2.101.093 2.801.606l3.876 2.708c.466.326.606.746.606 1.26l-.001 15.38c0 .793-.28 1.26-1.26 1.353l-15.457.933c-.746.047-1.12-.046-1.54-.56L2.03 19.052c-.466-.606-.653-1.073-.653-1.72V2.94c0-.84.28-1.213 1.12-1.26z"/>
                                </svg>
                            </a>
                            <a href="https://www.linkedin.com/in/%EA%B2%BD%EC%9D%80-%EC%9C%A4-7218b73b1/" target="_blank" rel="noopener noreferrer" className="hero__social-link" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="hero__portrait-wrap reveal reveal-delay-3">
                        <div className="hero__portrait-card">
                            <img src={profileImg} alt="윤경은 프로필" className="hero__portrait-img" />
                            <div className="hero__portrait-overlay">
                                <span className="hero__portrait-badge">AI DevOps Engineer</span>
                                <h3 className="hero__portrait-name">Gyeongeun Yoon</h3>
                                <p className="hero__portrait-desc">
                                    Delivering reliable AI services with serving, API, and deployment systems
                                </p>
                                <div className="hero__portrait-tags">
                                    <span>Python</span>
                                    <span>vLLM</span>
                                    <span>FastAPI</span>
                                    <span>Docker</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hero__scroll-indicator reveal reveal-delay-4">
                    <span>SCROLL</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M19 12l-7 7-7-7"/>
                    </svg>
                </div>
            </div>
        </section>
    )
}
