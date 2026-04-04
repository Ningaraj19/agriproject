import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoSend, IoMic, IoMicOff, IoTrash } from 'react-icons/io5'
import { useAppStore } from '../store/useAppStore'
import type { ChatMessage } from '../store/useAppStore'
import { t } from '../i18n/translations'
import { askQuestion } from '../services/chatApi'
import { speechToText } from '../services/voiceApi'

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                />
            ))}
        </div>
    )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
    const isUser = msg.role === 'user'
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center text-sm mr-3 shrink-0 mt-1 shadow-md">
                    🌾
                </div>
            )}
            <div
                className={`max-w-[75%] rounded-[1.25rem] px-5 py-3.5 text-sm leading-relaxed ${isUser
                    ? 'gradient-green text-white rounded-tr-sm shadow-md'
                    : 'bg-white border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-slate-800 rounded-tl-sm transition-colors'
                    }`}
            >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                        <p className="text-[10px] text-slate-400 font-bold mb-1.5 uppercase tracking-wider">Sources:</p>
                        {msg.sources.slice(0, 3).map((src, i) => (
                            <p key={i} className="text-xs text-slate-500 font-medium truncate">• {src}</p>
                        ))}
                    </div>
                )}
                <p className={`text-[10px] font-medium mt-2 text-right ${isUser ? 'text-green-100/90' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm ml-3 shrink-0 mt-1 shadow-sm transition-colors">
                    👤
                </div>
            )}
        </motion.div>
    )
}

export default function ChatPage() {
    const { language, messages, addMessage, clearMessages, isTyping, setIsTyping } = useAppStore()
    const [input, setInput] = useState('')
    const [recording, setRecording] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const mediaRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    useEffect(() => {
        if (messages.length === 0) {
            clearMessages()
        }
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping, clearMessages])

    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return
        setError(null)
        const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: new Date() }
        addMessage(userMsg)
        setInput('')
        setIsTyping(true)

        try {
            const res = await askQuestion({ question: text.trim(), language })
            const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: res.answer, timestamp: new Date(), sources: res.sources, language: res.language }
            addMessage(assistantMsg)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    }

    const toggleRecording = async () => {
        if (recording) { mediaRef.current?.stop(); setRecording(false); }
        else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const recorder = new MediaRecorder(stream)
                chunksRef.current = []
                recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
                recorder.onstop = async () => {
                    const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
                    stream.getTracks().forEach((t) => t.stop())
                    try {
                        const res = await speechToText(blob)
                        setInput(res.transcribed_text)
                    } catch (e: any) { setError('Voice transcription failed') }
                }
                recorder.start()
                mediaRef.current = recorder
                setRecording(true)
            } catch { setError('Microphone access denied') }
        }
    }

    const pl = t('chat.placeholder', language)
    const chatMessages = messages

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 bg-slate-800/60 shrink-0 transition-colors backdrop-blur-md">
                <h1 className="font-display font-bold text-[1.6rem] text-white tracking-tight">{t('chat.title', language)}</h1>
                <p className="text-[13px] text-white/70 mt-1 font-medium">{t('chat.subtitle', language)}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
                {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl drop-shadow-sm">🌾</motion.div>
                        <div>
                            <p className="text-white font-bold text-xl mb-2">{t('chat.title', language)}</p>
                            <p className="text-white/70 text-sm max-w-sm">{t('chat.empty', language)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-w-xl w-full mt-4">
                            {['Best crops for Karnataka soil', 'How to treat tomato blight?', 'PM-KISAN scheme eligibility', 'Irrigation tips for summer'].map((q) => (
                                <motion.button
                                    key={q}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => sendMessage(q)}
                                    className="bg-slate-800/60 backdrop-blur-md p-4 rounded-[1.25rem] text-left text-[13px] font-semibold text-white/90 hover:text-green-400 hover:bg-slate-700/80 hover:border-white/20 transition-all border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                                >
                                    {q}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto w-full">
                        {chatMessages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                        {isTyping && (
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center text-sm mr-3 shrink-0 shadow-sm">🌾</div>
                                <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                                    <TypingIndicator />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-6 max-w-4xl mx-auto mb-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium w-full">⚠️ {error}</motion.div>
                )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="px-6 pb-6 shrink-0 bg-transparent flex justify-center">
                <div className="bg-slate-800/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-[1.25rem] p-2.5 flex items-end gap-2 max-w-4xl w-full transition-colors">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={pl}
                        rows={1}
                        className="flex-1 bg-transparent text-sm text-white placeholder-white/50 resize-none outline-none px-3 py-2.5 max-h-32 font-medium"
                        style={{ lineHeight: '1.5' }}
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                        {chatMessages.length > 0 && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={clearMessages} title="Clear chat" className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <IoTrash size={20} />
                            </motion.button>
                        )}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleRecording} className={`p-2.5 rounded-xl transition-colors ${recording ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}>
                            {recording ? <IoMicOff size={22} /> : <IoMic size={22} />}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} disabled={!input.trim() || isTyping} onClick={() => sendMessage(input)} className="p-2.5 rounded-xl gradient-green text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            <IoSend size={20} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )
}
