import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { IoCloudUploadOutline, IoLeafOutline, IoCheckmarkCircle } from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n/translations'
import { detectDisease } from '../services/diseaseApi'
import type { DiseaseResponse } from '../services/diseaseApi'

function ConfidenceBar({ value }: { value: number }) {
    const pct = Math.round(value * 100)
    const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#22c55e'
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner transition-colors">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
            <span className="text-[13px] font-bold" style={{ color }}>{pct}%</span>
        </div>
    )
}

export default function DiseasePage() {
    const { language } = useAppStore()
    const [preview, setPreview] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<DiseaseResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback((accepted: File[]) => {
        const f = accepted[0]
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setResult(null)
        setError(null)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
        maxFiles: 1,
    })

    const analyze = async () => {
        if (!file) return
        setLoading(true)
        setError(null)
        try {
            const res = await detectDisease(file)
            setResult(res)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full overflow-y-auto px-6 py-6 scroll-smooth">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8 pl-2">
                    <h1 className="font-display font-bold text-[1.6rem] text-white tracking-tight drop-shadow-md">{t('disease.title', language)}</h1>
                    <p className="text-[13px] font-medium text-white/90 mt-1 drop-shadow-md">{t('disease.subtitle', language)}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Upload Panel */}
                    <div className="space-y-5">
                        <div
                            {...getRootProps()}
                            className={`relative rounded-[2rem] border-[1.5px] border-dashed p-10 text-center cursor-pointer transition-all duration-300 backdrop-blur-xl ${isDragActive
                                ? 'border-green-500 bg-green-50 scale-[1.02] shadow-2xl'
                                : 'border-white/30 bg-white/30 hover:border-white/50 hover:bg-white/40 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            <input {...getInputProps()} />
                            {preview ? (
                                <div className="space-y-4">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="mx-auto w-full max-w-xs h-56 object-cover rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-4 border-white dark:border-slate-700"
                                    />
                                    <div className="bg-white/80 dark:bg-slate-700/80 inline-block px-4 py-1.5 rounded-full border border-slate-100 dark:border-white/10 shadow-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        {file?.name}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5 py-6">
                                    <motion.div
                                        animate={isDragActive ? { scale: 1.15 } : { scale: 1 }}
                                        className="inline-flex p-5 rounded-[1.5rem] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-sm border border-green-100 dark:border-green-800/50"
                                    >
                                        <IoCloudUploadOutline size={40} />
                                    </motion.div>
                                    <div>
                                        <p className="text-slate-800 font-bold text-[15px]">{t('disease.dropzone', language)}</p>
                                        <p className="text-slate-500 font-medium text-[13px] mt-1.5">JPG, PNG, WEBP up to 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {file && (
                            <motion.button
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={analyze}
                                disabled={loading}
                                className="w-full gradient-green text-white font-bold py-4 rounded-[1.25rem] shadow-[0_8px_24px_rgba(22,163,74,0.25)] flex items-center justify-center gap-2.5 transition-all text-[15px]"
                            >
                                {loading ? (
                                    <>
                                        <motion.div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                                        Analyzing Image...
                                    </>
                                ) : (
                                    <>
                                        <IoLeafOutline size={22} />
                                        {t('disease.analyze', language)}
                                    </>
                                )}
                            </motion.button>
                        )}

                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-[1.25rem] bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium shadow-sm flex items-start gap-2">
                                <span>⚠️</span> {error}
                            </motion.div>
                        )}
                    </div>

                    {/* Results Panel */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-5"
                            >
                                <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-colors">
                                    <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-200/50">
                                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center border border-green-200">
                                            <IoCheckmarkCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-slate-800 text-lg drop-shadow-sm">Analysis Complete</h3>
                                        </div>
                                        {result.crop_name && (
                                            <span className="ml-auto text-xs font-bold uppercase tracking-wider bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 px-3 py-1.5 rounded-full shadow-sm">
                                                {result.crop_name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {result.predictions.slice(0, 3).map((pred, i) => (
                                            <div key={i} className={`p-4 rounded-[1.25rem] border ${i === 0 ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white/50 border-slate-200'} transition-colors backdrop-blur-md`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[15px] font-bold text-slate-800 drop-shadow-sm">{pred.disease_name}</p>
                                                    {i === 0 && <span className="text-[11px] font-bold bg-red-100 text-red-600 border border-red-200 px-2.5 py-1 rounded-md uppercase tracking-wide">Primary</span>}
                                                </div>
                                                <div className="mb-2.5">
                                                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">{t('disease.confidence', language)}</p>
                                                    <ConfidenceBar value={pred.confidence} />
                                                </div>
                                                {pred.description && <p className="text-[13px] text-slate-700 leading-relaxed font-medium mt-3 bg-white/80 p-3 rounded-xl border border-slate-200 transition-colors shadow-inner">{pred.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {result.predictions[0]?.treatment && (
                                    <div className="bg-amber-50 backdrop-blur-2xl rounded-[2rem] p-6 border border-amber-200 shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-colors">
                                        <h4 className="font-bold text-amber-700 text-[15px] mb-3 flex items-center gap-2 drop-shadow-sm">
                                            <span className="text-xl">💊</span> {t('disease.treatment', language)}
                                        </h4>
                                        <p className="text-amber-900 text-[14px] leading-relaxed font-medium bg-amber-100/50 p-4 rounded-2xl border border-amber-200 shadow-inner transition-colors">
                                            {result.predictions[0].treatment}
                                        </p>
                                    </div>
                                )}

                                {result.recommendation && (
                                    <div className="bg-green-50 backdrop-blur-2xl rounded-[2rem] p-6 border border-green-200 shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-colors">
                                        <h4 className="font-bold text-green-700 text-[15px] mb-3 flex items-center gap-2 drop-shadow-sm">
                                            <span className="text-xl">🌿</span> Recommendation
                                        </h4>
                                        <p className="text-green-900 text-[14px] leading-relaxed font-medium bg-green-100/50 p-4 rounded-2xl border border-green-200 shadow-inner transition-colors">
                                            {result.recommendation}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {!result && !loading && (
                            <div className="flex flex-col items-center justify-center h-[28rem] text-slate-800/80 bg-white/30 backdrop-blur-xl rounded-[2rem] border border-white/30 border-dashed transition-colors shadow-inner">
                                <IoLeafOutline size={64} className="mb-4 text-green-600 drop-shadow-lg" />
                                <p className="text-[15px] font-bold text-slate-800 drop-shadow-md">Scan results will appear here</p>
                                <p className="text-[13px] mt-1 text-slate-600 drop-shadow-sm">Upload a leaf image to begin</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
