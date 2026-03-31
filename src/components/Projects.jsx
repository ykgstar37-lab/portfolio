import { useState } from 'react'
import './Projects.css'

const PROJECTS = [
    {
        id: 1,
        title: 'E-Commerce Platform',
        description:
            '풀스택 전자상거래 플랫폼. 사용자 인증, 장바구니, 결제 시스템, 관리자 대시보드를 포함합니다. RESTful API 설계 및 반응형 UI를 구현했습니다.',
        techs: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        type: 'personal',
        github: '#',
        demo: '#',
        placeholderIndex: 1,
    },
    {
        id: 2,
        title: 'Team Collaboration Tool',
        description:
            '실시간 협업 도구. WebSocket 기반 실시간 채팅, 칸반 보드, 파일 공유 기능을 구현했습니다. 팀원 4명과 애자일 방식으로 개발했습니다.',
        techs: ['React', 'Django', 'Redis', 'Docker'],
        type: 'team',
        github: '#',
        demo: '#',
        placeholderIndex: 2,
    },
    {
        id: 3,
        title: 'AI Quiz Generator',
        description:
            'OpenAI API를 활용한 AI 퀴즈 생성 앱. 사용자가 주제를 입력하면 AI가 문제를 생성하고, 결과를 분석해 학습 리포트를 제공합니다.',
        techs: ['Python', 'FastAPI', 'React', 'OpenAI'],
        type: 'personal',
        github: '#',
        demo: '#',
        placeholderIndex: 3,
    },
]

export default function Projects() {
    const [activeTab, setActiveTab] = useState('all')

    const filteredProjects =
        activeTab === 'all'
            ? PROJECTS
            : PROJECTS.filter((p) => p.type === activeTab)

    return (
        <section className="projects section" id="projects">
            <div className="section__container">
                <h2 className="section__title reveal">Projects</h2>
                <p className="section__subtitle reveal reveal-delay-1">
                    개인 프로젝트와 팀 프로젝트를 소개합니다
                </p>

                {/* Tabs */}
                <div className="projects__tabs reveal reveal-delay-1">
                    {['all', 'personal', 'team'].map((tab) => (
                        <button
                            key={tab}
                            className={`projects__tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'all' ? 'All' : tab === 'personal' ? 'Personal' : 'Team'}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="projects__grid">
                    {filteredProjects.map((project, index) => (
                        <div
                            key={project.id}
                            className={`projects__card reveal reveal-delay-${index + 1}`}
                        >
                            <div className="projects__card-image-wrapper">
                                <div
                                    className={`projects__card-placeholder projects__card-placeholder--${project.placeholderIndex}`}
                                >
                                    {`0${project.placeholderIndex}`}
                                </div>
                                <span
                                    className={`projects__card-badge projects__card-badge--${project.type}`}
                                >
                                    {project.type === 'personal' ? 'Personal' : 'Team'}
                                </span>
                            </div>

                            <div className="projects__card-body">
                                <h3 className="projects__card-title">{project.title}</h3>
                                <p className="projects__card-description">
                                    {project.description}
                                </p>

                                <div className="projects__card-techs">
                                    {project.techs.map((tech) => (
                                        <span key={tech} className="projects__card-tech">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="projects__card-links">
                                    <a
                                        href={project.github}
                                        className="projects__card-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        GitHub
                                    </a>
                                    <a
                                        href={project.demo}
                                        className="projects__card-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                            <polyline points="15 3 21 3 21 9" />
                                            <line x1="10" y1="14" x2="21" y2="3" />
                                        </svg>
                                        Live Demo
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
