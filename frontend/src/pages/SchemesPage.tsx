import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoSearchOutline, IoOpenOutline, IoChevronDownOutline } from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n/translations'
import { searchSchemes } from '../services/schemesApi'
import type { SchemesResponse, GovernmentScheme } from '../services/schemesApi'

function SchemeCard({ scheme, i }: { scheme: GovernmentScheme; i: number }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white/40 backdrop-blur-md rounded-[1.5rem] border ${expanded ? 'border-purple-200 shadow-md' : 'border-white/40 hover:border-white/60 hover:shadow-sm'} overflow-hidden transition-all duration-300`}
        >
            <button
                className="w-full p-6 text-left focus:outline-none"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${expanded ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                🏛️
                            </div>
                            <h3 className="font-display font-bold text-slate-800 text-[16px] leading-tight pr-4 transition-colors">{scheme.name}</h3>
                        </div>
                        <p className={`text-[13.5px] font-medium leading-relaxed transition-all ${expanded ? 'text-slate-600 mt-4' : 'text-slate-500 line-clamp-2'}`}>
                            {scheme.description}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`shrink-0 mt-2 p-1.5 rounded-full transition-colors ${expanded ? 'bg-purple-50 text-purple-600' : 'text-slate-400 bg-slate-50'}`}
                    >
                        <IoChevronDownOutline size={20} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2 space-y-4">
                            <div className="h-px w-full bg-slate-100 mb-5 pl-14 transition-colors"></div>

                            <div className="pl-[3.25rem] space-y-5">
                                {scheme.eligibility && (
                                    <div className="bg-blue-50/50 p-4 rounded-[1.25rem] border border-blue-100/50 transition-colors">
                                        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <span>✅</span> Eligibility
                                        </p>
                                        <p className="text-slate-700 text-[13.5px] leading-relaxed font-medium transition-colors">{scheme.eligibility}</p>
                                    </div>
                                )}
                                {scheme.benefits && (
                                    <div className="bg-green-50/50 p-4 rounded-[1.25rem] border border-green-100/50 transition-colors">
                                        <p className="text-[11px] font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <span>🎁</span> Benefits
                                        </p>
                                        <p className="text-slate-700 text-[13.5px] leading-relaxed font-medium transition-colors">{scheme.benefits}</p>
                                    </div>
                                )}
                                {scheme.how_to_apply && (
                                    <div className="bg-amber-50/50 p-4 rounded-[1.25rem] border border-amber-100/50 transition-colors">
                                        <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <span>📋</span> How to Apply
                                        </p>
                                        <p className="text-slate-700 text-[13.5px] leading-relaxed font-medium transition-colors">{scheme.how_to_apply}</p>
                                    </div>
                                )}
                                {scheme.website && (
                                    <a
                                        href={scheme.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mt-2 transition-all shadow-sm hover:shadow-md hover:border-purple-300 group"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <IoOpenOutline size={16} className="text-purple-500 group-hover:text-purple-600" /> Visit Official Portal
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function SchemesPage() {
    const { language } = useAppStore()
    const [query, setQuery] = useState('')
    const [state, setState] = useState('')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<SchemesResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const search = async () => {
        if (!query.trim()) return
        setLoading(true)
        setError(null)
        try {
            const res = await searchSchemes(query.trim(), state || undefined)
            setData(res)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const quickSearches = ['PM-KISAN', 'Crop Insurance', 'Soil Health Card', 'Kisan Credit Card']

    return (
        <div className="h-full overflow-y-auto px-6 py-6 scroll-smooth">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 pl-2">
                    <h1 className="font-display font-bold text-[1.6rem] text-slate-800 tracking-tight">{t('schemes.title', language)}</h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">{t('schemes.subtitle', language)}</p>
                </div>

                <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] p-6 border border-white/30 mb-6 shadow-sm transition-colors">
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex-1 relative">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && search()}
                                placeholder={t('schemes.search', language)}
                                className="w-full bg-white border border-slate-200 rounded-[1.25rem] pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 font-medium outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                            />
                        </div>
                        <input
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State (optional)"
                            className="w-full sm:w-48 bg-white border border-slate-200 rounded-[1.25rem] px-5 py-3.5 text-sm text-slate-800 placeholder-slate-400 font-medium outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                        />
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={search}
                            disabled={loading || !query.trim()}
                            className="gradient-green text-white font-bold px-8 py-3.5 rounded-[1.25rem] shadow-[0_8px_20px_rgba(22,163,74,0.2)] disabled:opacity-50 text-[15px] whitespace-nowrap hover:shadow-[0_8px_25px_rgba(22,163,74,0.3)] transition-shadow"
                        >
                            {loading ? 'Searching...' : 'Find Schemes'}
                        </motion.button>
                    </div>

                    {/* Quick searches */}
                    <div className="flex gap-2.5 mt-5 flex-wrap">
                        {quickSearches.map((q) => (
                            <button
                                key={q}
                                onClick={() => { setQuery(q); }}
                                className="text-[12px] font-bold px-4 py-1.5 rounded-full border border-slate-200 text-slate-500 bg-white hover:text-green-700 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium shadow-sm">⚠️ {error}</motion.div>}

                <AnimatePresence>
                    {data && (
                        <div className="space-y-6">
                            {data.summary && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-purple-50/50 backdrop-blur-md rounded-[2rem] p-7 border border-purple-200/60 shadow-sm transition-colors">
                                    <h3 className="font-bold text-purple-700 mb-3 text-[15px] flex items-center gap-2">
                                        <span className="text-xl">✨</span> AI Summary
                                    </h3>
                                    <p className="text-slate-700 text-[14px] leading-relaxed font-medium bg-white/80 p-5 rounded-2xl border border-purple-100 transition-colors">
                                        {data.summary}
                                    </p>
                                </motion.div>
                            )}

                            <div className="flex items-center gap-2 pl-2">
                                <h2 className="font-display font-bold text-lg text-slate-800 transition-colors">Available Schemes</h2>
                                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors">{data.schemes.length}</span>
                            </div>

                            {data.schemes.length > 0 ? (
                                <div className="space-y-4">
                                    {data.schemes.map((s, i) => <SchemeCard key={i} scheme={s} i={i} />)}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500 font-semibold bg-white/30 backdrop-blur-sm rounded-[2rem] border border-white/30 border-dashed transition-colors">{t('common.noResults', language)}</div>
                            )}
                        </div>
                    )}

                    {!data && !loading && (
                        <div className="text-center py-24 text-slate-600 bg-white/30 backdrop-blur-sm rounded-[2rem] border border-white/30 border-dashed transition-colors">
                            <div className="text-6xl mb-5 opacity-80">🏛️</div>
                            <p className="text-[15px] font-bold text-slate-800">Discover farmer welfare programs</p>
                            <p className="text-[13px] mt-1 text-slate-500">Search by keyword or select a quick option above</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
