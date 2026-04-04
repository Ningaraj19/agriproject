import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    IoChatbubblesOutline,
    IoLeafOutline,
    IoCloudyOutline,
    IoBarChartOutline,
    IoDocumentTextOutline,
    IoLogoYoutube,
    IoSunnyOutline,
    IoMoonOutline,
} from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n/translations'

export default function LandingPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme, language, setLanguage } = useAppStore()

    const cards = [
        {
            path: '/disease',
            icon: <IoLeafOutline size={48} className="text-green-600 drop-shadow-sm" />,
            title: t('nav.disease', language),
            // Top-Left in desktop
            styles: 'md:absolute md:top-[22%] md:left-[10%] lg:left-[15%] z-10',
        },
        {
            path: '/weather',
            icon: <IoCloudyOutline size={48} className="text-blue-500 drop-shadow-sm" />,
            title: t('nav.weather', language),
            // Bottom-Left
            styles: 'md:absolute md:top-[52%] md:left-[6%] lg:left-[10%] z-20',
        },
        {
            path: '/chat',
            icon: <IoChatbubblesOutline size={48} className="text-blue-600 drop-shadow-sm" />,
            title: t('nav.chat', language),
            // Center Overlapping
            styles: 'md:absolute md:top-[38%] md:left-[35%] lg:left-[38%] z-30 shadow-xl scale-105',
        },
        {
            path: '/market',
            icon: <IoBarChartOutline size={48} className="text-emerald-500 drop-shadow-sm" />,
            title: t('nav.market', language),
            // Bottom-Right center
            styles: 'md:absolute md:top-[64%] md:left-[48%] lg:left-[55%] z-20',
        },
        {
            path: '/schemes',
            icon: <IoDocumentTextOutline size={48} className="text-slate-600 dark:text-slate-400 drop-shadow-sm" />,
            title: t('nav.schemes', language),
            // Far-Right
            styles: 'md:absolute md:top-[45%] md:right-[5%] lg:right-[10%] z-10',
        },
        {
            path: '/youtube',
            icon: <IoLogoYoutube size={48} className="text-red-500 drop-shadow-sm" />,
            title: t('nav.youtube', language),
            // Top-Right
            styles: 'md:absolute md:top-[18%] md:right-[12%] lg:right-[18%] z-10',
        },
    ]

    return (
        <div className="min-h-screen relative overflow-x-hidden bg-[#f8fafc] dark:bg-[#0a0f1e] transition-colors duration-300 font-sans">
            {/* ── Background Image ──────────────────────────────────── */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-bg.jpg"
                    alt="Agricultural sunrise field"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* ── Top Navigation Bar ───────────────────────────────── */}
            <div className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-sm bg-white/30 border-b border-white/20 shadow-sm transition-colors">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        🌿
                    </div>
                    <span className="font-display font-bold text-xl text-slate-800 dark:text-white tracking-tight drop-shadow-sm">AgriAI</span>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Language Toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/30 border border-white/40 shadow-sm">
                        {(['en', 'kn'] as const).map((lang) => (
                            <motion.button
                                key={lang}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setLanguage(lang)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${language === lang
                                    ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                                    }`}
                            >
                                {lang.toUpperCase()}
                            </motion.button>
                        ))}
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-white/30 border border-white/40 text-amber-500 shadow-sm hover:scale-110 transition-all"
                    >
                        {theme === 'light' ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} className="text-amber-300" />}
                    </button>
                </div>
            </div>

            {/* ── Main Hero Content ─────────────────────────────────── */}
            <div className="relative z-10 w-full h-[calc(100vh-80px)]">
                {/* 
                    Mobile Layout: Scrollable flex block 
                    Desktop Layout: Absolute positioning container
                */}
                <div className="flex md:hidden flex-col items-center gap-4 py-8 px-6">
                    {cards.map((card, idx) => (
                        <motion.button
                            key={card.path}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(card.path)}
                            className="w-full max-w-sm glass rounded-[2rem] p-5 flex items-center gap-5 text-left bg-white/30 backdrop-blur-md shadow-md border border-white/30"
                        >
                            <div className="shrink-0">{card.icon}</div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-[16px] leading-snug whitespace-pre-line">
                                {card.title}
                            </h3>
                        </motion.button>
                    ))}
                </div>

                {/* Desktop scattered layout matching image */}
                <div className="hidden md:block relative w-full h-full max-w-7xl mx-auto">
                    {cards.map((card, idx) => (
                        <motion.button
                            key={card.path}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                            whileHover={{ y: -5, scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(card.path)}
                            className={`glass rounded-[1.75rem] p-6 flex items-center gap-5 text-left bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/40 w-64 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-300 group ${card.styles}`}
                        >
                            <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
                                {card.icon}
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-[16px] leading-snug tracking-tight whitespace-pre-line group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                                {card.title}
                            </h3>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    )
}
