import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoTrendingUp, IoTrendingDown, IoRemoveOutline, IoSearchOutline } from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n/translations'
import { getMarketPrices } from '../services/marketApi'
import type { MarketResponse, CropPrice } from '../services/marketApi'

const TREND_MAP = {
    up: { icon: <IoTrendingUp size={16} />, color: '#16a34a', bg: '#16a34a1a', label: 'Rising' },
    down: { icon: <IoTrendingDown size={16} />, color: '#dc2626', bg: '#dc26261a', label: 'Falling' },
    stable: { icon: <IoRemoveOutline size={16} />, color: '#64748b', bg: '#64748b1a', label: 'Stable' },
}

function PriceCard({ crop, i }: { crop: CropPrice; i: number }) {
    const trend = TREND_MAP[crop.trend] ?? TREND_MAP.stable
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/30 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-default transition-all"
        >
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="font-display font-bold text-slate-800 text-lg transition-colors">{crop.crop_name}</p>
                    <p className="text-[13px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {crop.market}
                    </p>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm" style={{ color: trend.color, background: trend.bg, border: `1px solid ${trend.color}20` }}>
                    {trend.icon} {trend.label}
                </span>
            </div>
            <div className="flex items-end justify-between pt-1">
                <div>
                    <p className="text-3xl font-bold font-display tracking-tight text-slate-800 transition-colors">
                        <span className="text-xl text-slate-400 mr-1">₹</span>{crop.price_per_quintal.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-1 transition-colors">per {crop.unit}</p>
                </div>
                {crop.last_updated && (
                    <p className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 transition-colors">{crop.last_updated}</p>
                )}
            </div>
        </motion.div>
    )
}

export default function MarketPage() {
    const { language } = useAppStore()
    const [searchCrop, setSearchCrop] = useState('')
    const [searchState, setSearchState] = useState('')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<MarketResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const search = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getMarketPrices(searchCrop || undefined, searchState || undefined)
            setData(res)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full overflow-y-auto px-6 py-6 scroll-smooth">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 pl-2">
                    <h1 className="font-display font-bold text-[1.6rem] text-slate-800 tracking-tight">{t('market.title', language)}</h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">{t('market.subtitle', language)}</p>
                </div>

                {/* Search Controls */}
                <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 mb-8 shadow-sm transition-colors">
                    <div className="flex gap-4 flex-col md:flex-row">
                        <div className="flex-1 relative">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                value={searchCrop}
                                onChange={(e) => setSearchCrop(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && search()}
                                placeholder="Crop name (e.g. Rice)"
                                className="w-full bg-white border border-slate-200 rounded-[1.25rem] pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 font-medium outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <input
                                value={searchState}
                                onChange={(e) => setSearchState(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && search()}
                                placeholder="State (e.g. Karnataka)"
                                className="w-full bg-white border border-slate-200 rounded-[1.25rem] px-5 py-3.5 text-sm text-slate-800 placeholder-slate-400 font-medium outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all shadow-sm"
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={search}
                            disabled={loading}
                            className="gradient-green text-white font-bold px-8 py-3.5 rounded-[1.25rem] shadow-[0_8px_20px_rgba(22,163,74,0.2)] disabled:opacity-50 text-[15px] whitespace-nowrap hover:shadow-[0_8px_25px_rgba(22,163,74,0.3)] transition-shadow"
                        >
                            {loading ? 'Searching...' : 'View Prices'}
                        </motion.button>
                    </div>
                </div>

                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium shadow-sm">⚠️ {error}</motion.div>}

                <AnimatePresence>
                    {data && (
                        <div className="space-y-8">
                            {data.analysis && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50/50 backdrop-blur-md rounded-[2rem] p-7 border border-blue-200/60 shadow-sm transition-colors">
                                    <h3 className="font-bold text-blue-700 mb-3 text-[15px] flex items-center gap-2">
                                        <span className="text-xl">📊</span> {t('market.analysis', language)}
                                    </h3>
                                    <p className="text-slate-700 text-[14px] leading-relaxed font-medium bg-white/80 p-5 rounded-2xl border border-blue-100 transition-colors">
                                        {data.analysis}
                                    </p>
                                </motion.div>
                            )}
                            {data.prices.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {data.prices.map((c, i) => <PriceCard key={`${c.crop_name}-${i}`} crop={c} i={i} />)}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-500 font-semibold bg-white/30 backdrop-blur-sm rounded-[2rem] border border-white/30 border-dashed transition-colors">{t('common.noResults', language)}</div>
                            )}
                        </div>
                    )}

                    {!data && !loading && (
                        <div className="text-center py-24 text-slate-600 bg-white/30 backdrop-blur-sm rounded-[2rem] border border-white/30 border-dashed transition-colors">
                            <div className="text-6xl mb-5 opacity-80">📈</div>
                            <p className="text-[15px] font-bold text-slate-800">Search for live crop prices</p>
                            <p className="text-[13px] mt-1 text-slate-500">Leave blank to fetch all top market prices</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
