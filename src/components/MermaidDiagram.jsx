import { useEffect, useId, useMemo, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    themeVariables: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        primaryBorderColor: '#d1d5db',
        lineColor: '#64748b',
    },
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
    },
});

export default function MermaidDiagram({ chart }) {
    const reactId = useId();
    const diagramId = useMemo(() => `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [reactId]);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function renderDiagram() {
            try {
                const { svg: renderedSvg } = await mermaid.render(diagramId, chart);
                if (!cancelled) {
                    setSvg(renderedSvg);
                    setError('');
                }
            } catch (err) {
                if (!cancelled) {
                    setSvg('');
                    setError(err?.message || 'Mermaid render failed');
                }
            }
        }

        renderDiagram();

        return () => {
            cancelled = true;
        };
    }, [chart, diagramId]);

    if (error) {
        return (
            <pre className="max-h-[520px] overflow-auto rounded-lg bg-gray-950 p-4 text-xs leading-relaxed text-red-100">
                {error}
                {'\n\n'}
                {chart}
            </pre>
        );
    }

    return (
        <div
            className="mermaid-diagram text-center [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
