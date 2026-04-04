import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    IoHomeOutline,
    IoSunnyOutline,
    IoMoonOutline,
} from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'

export default function MainLayout({ children }: { children: ReactNode }) {
    const { language, setLanguage, theme, toggleTheme } = useAppStore()
    const location = useLocation()
    const navigate = useNavigate()

    const isYoutube = location.pathname.startsWith('/youtube')
    const isDisease = location.pathname.startsWith('/disease')
    const isWeather = location.pathname.startsWith('/weather')

    let bgImage = 'url(/hero-bg.jpg)'
    if (isYoutube) bgImage = 'url(/youtube-bg.jpg)'
    if (isDisease) bgImage = 'url(/disease-bg.jpg)'
    if (isWeather) bgImage = 'url(/weather-bg.jpg)'

    return (
        <div className="flex h-screen overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl transition-colors" style={{ backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Frosted overlay for the app shell - less blur on youtube/disease to show image clearer */}
            <div className={`absolute inset-0 z-0 transition-colors duration-300 ${(isYoutube || isDisease || isWeather)
                ? 'bg-black/20 dark:bg-black/60 backdrop-blur-sm'
                : 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl'
                }`} />

            {/* ── Main area ─────────────────────────────────────────────── */}
            <div className="relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="flex items-center justify-between px-6 py-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-white/60 dark:border-white/10 shrink-0 z-10 transition-colors">
                    <div className="flex gap-2 items-center">
                        <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/20 mr-2 md:hidden">
                            🌾
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/')}
                            title="Go to Home"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 shadow-sm transition-all font-bold text-sm"
                        >
                            <IoHomeOutline size={20} className="shrink-0" />
                            <span className="hidden sm:inline">Return Home</span>
                        </motion.button>
                        {!isYoutube && (
                            <h2 className="ml-4 font-display font-bold text-xl text-slate-800 dark:text-white hidden md:block">AgriAI Capabilities</h2>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 shadow-sm">
                            {(['en', 'kn'] as const).map((lang) => (
                                <motion.button
                                    key={lang}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setLanguage(lang)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${language === lang
                                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </motion.button>
                            ))}
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            title="Toggle Theme"
                            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 text-amber-500 dark:text-white shadow-sm transition-all"
                        >
                            {theme === 'light' ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} className="text-amber-300" />}
                        </motion.button>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 tracking-wide uppercase transition-colors">System Active</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`h-full ${(isYoutube || isDisease || isWeather) ? 'bg-white/20 dark:bg-slate-900/40 text-white backdrop-blur-lg' : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl'} border ${(isYoutube || isDisease || isWeather) ? 'border-white/20 dark:border-white/10' : 'border-white/80 dark:border-white/10'} rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden transition-colors`}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
