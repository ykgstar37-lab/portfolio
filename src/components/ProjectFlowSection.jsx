import { motion } from 'framer-motion';
import MermaidDiagram from './MermaidDiagram';

const defaultFade = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ProjectFlowSection({
    id = 'architecture',
    title = 'Architecture',
    subtitle,
    accentColor = '#e27500',
    charts = [],
    steps = [],
    notes = [],
    variant = defaultFade,
}) {
    const nodeIds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
        <motion.div id={id} className="mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variant}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h2>
            {subtitle && <p className="text-gray-500 mb-8" style={{ wordBreak: 'keep-all' }}>{subtitle}</p>}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3 border-b border-gray-100 bg-gray-950 text-white">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        <code className="ml-2 text-[11px] sm:text-xs font-bold text-white/70 truncate">{charts.length > 0 ? 'README.md / mermaid' : 'flowchart LR'}</code>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mermaid View</span>
                </div>

                <div className="p-5 sm:p-8">
                    {charts.length > 0 ? (
                        <div className="space-y-6">
                            {charts.map((diagram, idx) => (
                                <div key={diagram.title || idx} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                    <div className="flex flex-col gap-1 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{diagram.title}</p>
                                            {diagram.description && (
                                                <p className="mt-0.5 text-xs font-medium text-gray-500" style={{ wordBreak: 'keep-all' }}>
                                                    {diagram.description}
                                                </p>
                                            )}
                                        </div>
                                        <code className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            {diagram.type || 'mermaid'}
                                        </code>
                                    </div>
                                    <div className="overflow-x-auto p-4 sm:p-6">
                                        <MermaidDiagram chart={diagram.chart} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                    <>
                    <div className="hidden lg:flex items-stretch gap-0">
                        {steps.map((step, idx) => (
                            <div key={step.title} className="flex flex-1 items-center min-w-0">
                                <div className="relative flex-1 rounded-lg border-2 bg-white p-4 min-h-[172px]" style={{ borderColor: idx === 0 ? accentColor : '#e5e7eb' }}>
                                    <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-white text-[10px] font-bold border" style={{ color: accentColor, borderColor: `${accentColor}55` }}>
                                        {nodeIds[idx] || idx + 1}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">{step.title}</p>
                                    {step.subtitle && <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{step.subtitle}</p>}
                                    {step.items?.length > 0 && (
                                        <div className="space-y-1.5">
                                            {step.items.map((item) => (
                                                <div key={item} className="rounded-md bg-gray-50 px-2.5 py-1.5 text-[10px] font-bold text-gray-600 border border-gray-100">
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="relative w-12 flex-shrink-0">
                                        <div className="h-0.5 w-full bg-gray-300"></div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[9px] border-l-gray-300"></div>
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-7 rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-gray-400 border border-gray-100">
                                            {nodeIds[idx]}--&gt;{nodeIds[idx + 1]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="lg:hidden space-y-3">
                        {steps.map((step, idx) => (
                            <div key={step.title}>
                                <div className="rounded-lg border-2 bg-white p-4" style={{ borderColor: idx === 0 ? accentColor : '#e5e7eb' }}>
                                    <div className="flex items-start gap-3">
                                        <div className="px-2 py-1 rounded text-[10px] font-bold text-white flex-shrink-0" style={{ backgroundColor: accentColor }}>
                                            {nodeIds[idx] || idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900">{step.title}</p>
                                            {step.subtitle && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{step.subtitle}</p>}
                                        </div>
                                    </div>
                                    {step.items?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {step.items.map((item) => (
                                                <span key={item} className="px-2.5 py-1 rounded-md bg-gray-50 text-[10px] font-bold text-gray-600 border border-gray-100">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="flex justify-center py-1 text-gray-300">
                                        <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    </>
                    )}

                    {notes.length > 0 && (
                        <div className="mt-8 border-t border-dashed border-gray-200 pt-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {notes.map((note, idx) => (
                                    <div key={note.label} className="rounded-lg border bg-gray-50 px-4 py-3" style={{ borderColor: idx === notes.length - 1 ? `${accentColor}55` : '#e5e7eb' }}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accentColor }}>class {note.label}</p>
                                        <p className="text-sm font-semibold text-gray-800 leading-relaxed" style={{ wordBreak: 'keep-all' }}>{note.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
