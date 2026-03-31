import './Research.css'

const RESEARCH_ITEMS = [
    {
        id: 1,
        title: 'Attention Is All You Need',
        summary:
            'Transformer 아키텍처의 핵심 논문을 정리했습니다. Self-Attention 메커니즘, Multi-Head Attention, Positional Encoding의 동작 원리를 분석하고 직접 구현해보았습니다.',
        tags: ['NLP', 'Transformer', 'Deep Learning'],
        type: 'paper',
        date: '2025.12',
    },
    {
        id: 2,
        title: 'Django REST Framework 심층 스터디',
        summary:
            'DRF의 Serializer, ViewSet, Permission 시스템을 깊이 있게 학습하고, 실제 프로젝트에 적용한 경험을 정리했습니다. 인증/인가 패턴과 성능 최적화를 다루었습니다.',
        tags: ['Django', 'REST API', 'Backend'],
        type: 'study',
        date: '2025.10',
    },
    {
        id: 3,
        title: 'React 렌더링 최적화 패턴',
        summary:
            'React의 리렌더링 메커니즘을 분석하고, useMemo, useCallback, React.memo를 활용한 최적화 패턴을 정리했습니다. Virtual DOM의 Reconciliation 알고리즘도 함께 다루었습니다.',
        tags: ['React', 'Performance', 'Frontend'],
        type: 'study',
        date: '2025.08',
    },
    {
        id: 4,
        title: 'Retrieval-Augmented Generation (RAG)',
        summary:
            'RAG 시스템의 아키텍처와 구현 방법을 학습했습니다. Vector DB, Embedding, Chunking 전략을 분석하고, LangChain을 활용한 파이프라인을 구축해보았습니다.',
        tags: ['AI', 'RAG', 'LLM'],
        type: 'paper',
        date: '2025.06',
    },
    {
        id: 5,
        title: 'AWS Solutions Architect 학습',
        summary:
            'AWS의 핵심 서비스(EC2, S3, RDS, Lambda, API Gateway)를 학습하고, 3-Tier 아키텍처 설계 패턴을 정리했습니다. 비용 최적화 및 고가용성 전략을 다루었습니다.',
        tags: ['AWS', 'Cloud', 'Architecture'],
        type: 'course',
        date: '2025.04',
    },
]

const TYPE_LABELS = {
    paper: '논문',
    study: '스터디',
    course: '코스',
}

export default function Research() {
    return (
        <section className="research section" id="research">
            <div className="section__container">
                <span className="research__label reveal">Etc.</span>
                <h2 className="section__title reveal">Research & More</h2>
                <p className="section__subtitle reveal reveal-delay-1">
                    논문 리뷰, 기술 스터디, 학습 기록을 정리합니다
                </p>

                <div className="research__list">
                    {RESEARCH_ITEMS.map((item, index) => (
                        <div
                            key={item.id}
                            className={`research__card reveal reveal-delay-${Math.min(index + 1, 4)}`}
                        >
                            <div className="research__card-number">
                                {String(item.id).padStart(2, '0')}
                            </div>

                            <div className="research__card-content">
                                <h3 className="research__card-title">{item.title}</h3>
                                <p className="research__card-summary">{item.summary}</p>
                                <div className="research__card-tags">
                                    {item.tags.map((tag) => (
                                        <span key={tag} className="research__card-tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="research__card-meta">
                                <span className="research__card-date">{item.date}</span>
                                <span
                                    className={`research__card-type research__card-type--${item.type}`}
                                >
                                    {TYPE_LABELS[item.type]}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
