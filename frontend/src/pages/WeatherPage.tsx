import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoThermometerOutline, IoWaterOutline, IoRainyOutline, IoSpeedometerOutline, IoLocationOutline, IoWarningOutline } from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n/translations'
import { getWeather } from '../services/weatherApi'
import type { WeatherResponse } from '../services/weatherApi'

interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    unit: string
    color: string
    delay?: number
}

function StatCard({ icon, label, value, unit, color, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/30 backdrop-blur-xl rounded-[1.5rem] p-6 border border-white/20 shadow-lg cursor-default transition-colors"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl border" style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
                    {icon}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-4xl font-bold font-display text-slate-800 transition-colors drop-shadow-sm">
                    {value}<span className="text-lg font-bold text-slate-500 ml-1.5">{unit}</span>
                </p>
                <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
            </div>
        </motion.div>
    )
}

export default function WeatherPage() {
    const { language } = useAppStore()
    const [city, setCity] = useState('Bengaluru')
    const [crop, setCrop] = useState('')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<WeatherResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const useMyLocation = () => {
        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    // Reverse geocode explicitly if they choose "Use Location"
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`)
                    const rev = await res.json()
                    const foundCity = rev.address.city || rev.address.state_district || rev.address.state || 'Unknown Location'
                    setCity(foundCity)

                    // Proceed to fetch weather immediately
                    const weatherRes = await getWeather(foundCity, crop || undefined)
                    setData(weatherRes)
                } catch (e: any) {
                    setError('Failed to resolve current location.')
                } finally {
                    setLoading(false)
                }
            },
            () => { setLoading(false); setError('Location access denied') }
        )
    }

    const fetchWeather = async () => {
        if (!city.trim()) return
        setLoading(true)
        setError(null)
        try {
            const res = await getWeather(city, crop || undefined)
            setData(res)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const w = data?.current_weather

    return (
        <div className="h-full overflow-y-auto px-6 py-6 scroll-smooth">
            <div className="max-w-5xl mx-auto">

                <div className="mb-8 pl-2">
                    <h1 className="font-display font-bold text-[1.6rem] text-white tracking-tight drop-shadow-md">{t('weather.title', language)}</h1>
                    <p className="text-[13px] font-medium text-white/90 mt-1 drop-shadow-md">{t('weather.subtitle', language)}</p>
                </div>

                {/* Controls */}
                <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 mb-8 shadow-lg transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2 block ml-1 drop-shadow-sm">City Location</label>
                            <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
                                className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm backdrop-blur-sm"
                                placeholder="e.g. Pune, Maharashtra"
                            />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-700 mb-2 block ml-1 drop-shadow-sm">Crop Context (Optional)</label>
                            <input
                                value={crop}
                                onChange={(e) => setCrop(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
                                className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition-all shadow-sm backdrop-blur-sm"
                                placeholder="e.g. Rice, Wheat"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={useMyLocation}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 rounded-[1.25rem] bg-white/80 dark:bg-black/40 text-slate-700 dark:text-white/90 font-semibold hover:bg-white dark:hover:bg-black/60 text-sm transition-colors border border-slate-200 dark:border-white/20 shadow-sm disabled:opacity-50"
                        >
                            <IoLocationOutline size={18} className="text-blue-500 dark:text-blue-400" /> Use Location
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={fetchWeather}
                            disabled={loading}
                            className="flex-1 gradient-green text-white font-bold py-3 rounded-[1.25rem] shadow-[0_8px_20px_rgba(22,163,74,0.2)] disabled:opacity-50 transition-all text-[15px] hover:shadow-[0_8px_25px_rgba(22,163,74,0.3)]"
                        >
                            {loading ? 'Fetching Forecast...' : t('weather.fetch', language)}
                        </motion.button>
                    </div>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 text-[13px] font-medium shadow-sm">⚠️ {error}</motion.div>
                )}

                <AnimatePresence>
                    {w && (
                        <div className="space-y-8">
                            {/* Description badge */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 bg-white/30 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-lg transition-colors">
                                <span className="text-6xl drop-shadow-lg">
                                    {w.weather_description.toLowerCase().includes('rain') ? '🌧️' :
                                        w.weather_description.toLowerCase().includes('cloud') ? '☁️' :
                                            w.weather_description.toLowerCase().includes('sunny') || w.temperature_c > 30 ? '☀️' : '⛅'}
                                </span>
                                <div>
                                    <p className="text-slate-800 font-display font-bold text-2xl capitalize tracking-tight transition-colors drop-shadow-sm">{w.weather_description || 'Current Conditions'}</p>
                                    {data?.location && <p className="text-slate-600 text-sm font-bold mt-1 tracking-wide">{data.location}</p>}
                                </div>
                            </motion.div>

                            {/* Stat grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                <StatCard icon={<IoThermometerOutline size={26} />} label={t('weather.temperature', language)} value={w.temperature_c.toFixed(1)} unit="°C" color="#f59e0b" delay={0} />
                                <StatCard icon={<IoWaterOutline size={26} />} label={t('weather.humidity', language)} value={w.humidity_pct.toFixed(0)} unit="%" color="#0ea5e9" delay={0.1} />
                                <StatCard icon={<IoRainyOutline size={26} />} label={t('weather.rainfall', language)} value={w.precipitation_mm.toFixed(1)} unit="mm" color="#6366f1" delay={0.2} />
                                <StatCard icon={<IoSpeedometerOutline size={26} />} label={t('weather.wind', language)} value={w.wind_speed_kmh.toFixed(0)} unit="km/h" color="#10b981" delay={0.3} />
                            </div>

                            {/* Farming recommendation */}
                            {data?.farming_recommendation && (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-green-50 to-emerald-100/80 backdrop-blur-xl rounded-[2rem] p-7 border border-green-200 shadow-lg transition-colors">
                                    <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2 text-[15px] drop-shadow-sm">
                                        <span className="text-xl">🌱</span> {t('weather.advice', language)}
                                    </h3>
                                    <p className="text-slate-800 text-[14px] leading-relaxed font-medium bg-white/70 p-5 rounded-2xl border border-white shadow-inner transition-colors">
                                        {data.farming_recommendation}
                                    </p>
                                </motion.div>
                            )}

                            {/* Alerts */}
                            {data?.alerts && data.alerts.length > 0 && (
                                <div className="space-y-3">
                                    {data.alerts.map((alert, i) => (
                                        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * i }} className="flex items-start gap-3 p-5 rounded-2xl bg-amber-50/90 backdrop-blur-md border border-amber-200 text-amber-800 text-sm font-bold shadow-lg transition-colors">
                                            <IoWarningOutline size={20} className="mt-0.5 shrink-0 text-amber-600 drop-shadow-sm" />
                                            {alert}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!data && !loading && (
                        <div className="text-center py-24 text-slate-700 bg-white/30 backdrop-blur-xl rounded-[2rem] border border-white/30 border-dashed transition-colors shadow-inner">
                            <div className="text-6xl mb-5 opacity-90 drop-shadow-lg">🌤️</div>
                            <p className="text-[15px] font-bold text-slate-800 drop-shadow-sm">Enter a city name to view forecast</p>
                            <p className="text-[13px] mt-1 text-slate-600 drop-shadow-sm">Default: Bengaluru, Karnataka</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
