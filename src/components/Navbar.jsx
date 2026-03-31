import { useState, useEffect } from 'react'
import './Navbar.css'

const NAV_ITEMS = [
    { id: 'hero', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'research', label: 'Research & More' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('hero')

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
        )

        window.addEventListener('scroll', handleScroll)

        // Observe sections after mount
        setTimeout(() => {
            NAV_ITEMS.forEach(({ id }) => {
                const el = document.getElementById(id)
                if (el) observer.observe(el)
            })
        }, 100)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            observer.disconnect()
        }
    }, [])

    const handleNavClick = (id) => {
        setMenuOpen(false)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar__inner">
                <a href="#" className="navbar__logo" onClick={() => handleNavClick('hero')}>
                    Portfolio<span style={{ color: 'var(--color-accent-warm)' }}>.</span>
                </a>

                <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
                    {NAV_ITEMS.map(({ id, label }) => (
                        <a
                            key={id}
                            className={`navbar__link ${activeSection === id ? 'active' : ''}`}
                            onClick={() => handleNavClick(id)}
                        >
                            {label}
                        </a>
                    ))}
                </div>

                <button
                    className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span />
                    <span />
                    <span />
                </button>

                <div
                    className={`navbar__overlay ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(false)}
                />
            </div>
        </nav>
    )
}
