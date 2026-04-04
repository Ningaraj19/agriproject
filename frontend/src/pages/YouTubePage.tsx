import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoSearchOutline, IoPlayCircleOutline } from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'
import { searchVideos } from '../services/youtubeApi'
import type { YouTubeVideo } from '../services/youtubeApi'

export default function YouTubePage() {
    const { language } = useAppStore()
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [videos, setVideos] = useState<YouTubeVideo[]>([])
    const [error, setError] = useState<string | null>(null)

    const search = async (q?: string) => {
        const searchQuery = q || query
        if (!searchQuery.trim()) return
        setLoading(true)
        setError(null)
        try {
            const res = await searchVideos(searchQuery.trim(), language)
            setVideos(res.videos)
            setQuery(searchQuery)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    // Default load some videos
    useEffect(() => {
        search('farming best practices')
    }, [])

    const topics = ['organic farming', 'drip irrigation', 'tractor maintenance', 'pest control']

    return (
        <div className="h-full overflow-y-auto px-6 py-6 scroll-smooth">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 pl-2">
                    <h1 className="font-display font-bold text-[1.6rem] tracking-tight text-white drop-shadow-md">Agricultural Videos</h1>
                    <p className="text-[13px] font-medium text-white/90 mt-1 drop-shadow-sm">Curated YouTube farming guides and tutorials</p>
                </div>

                <div className="bg-white/30 backdrop-blur-xl rounded-[2rem] p-6 border border-white/30 mb-8 shadow-lg transition-colors">
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex-1 relative">
                            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && search()}
                                placeholder="Search farming videos..."
                                className="w-full bg-white/90 border border-slate-200 rounded-[1.25rem] pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-500 font-medium outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/30 transition-all shadow-sm backdrop-blur-md"
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => search()}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3.5 rounded-[1.25rem] shadow-[0_8px_20px_rgba(239,68,68,0.2)] disabled:opacity-50 text-[15px] whitespace-nowrap transition-all"
                        >
                            {loading ? 'Searching...' : 'Find Videos'}
                        </motion.button>
                    </div>
                    <div className="flex gap-2.5 mt-5 flex-wrap">
                        {topics.map((topic) => (
                            <button
                                key={topic}
                                onClick={() => search(topic)}
                                className="text-[12px] font-bold px-4 py-1.5 rounded-full border border-slate-200 text-slate-800 bg-white/80 hover:text-red-600 hover:border-red-300 hover:bg-white transition-all shadow-sm backdrop-blur-sm"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-100 text-red-600 text-[13px] font-medium shadow-sm">⚠️ {error}</motion.div>}

                <AnimatePresence>
                    {videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {videos.map((vid, i) => (
                                <motion.a
                                    key={vid.video_id}
                                    href={vid.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -4 }}
                                    className="bg-white/30 backdrop-blur-md rounded-[1.5rem] overflow-hidden border border-white/30 shadow-lg hover:shadow-2xl transition-all group block"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <IoPlayCircleOutline size={48} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">{vid.title}</h3>
                                        <p className="text-slate-600 text-[12px] font-medium mt-2">{vid.channel_name}</p>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    ) : (
                        !loading && (
                            <div className="text-center py-24 text-slate-600 dark:text-white/70 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-[2rem] border border-white dark:border-white/10 border-dashed transition-colors shadow-inner">
                                <div className="text-6xl mb-5 opacity-90 drop-shadow-md">📺</div>
                                <p className="text-[15px] font-bold text-slate-800 dark:text-white drop-shadow-md">Search for educational farming videos</p>
                            </div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
