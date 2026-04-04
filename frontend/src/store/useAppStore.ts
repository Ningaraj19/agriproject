import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'kn'
export type Theme = 'light' | 'dark'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    sources?: string[]
    language?: string
}

interface AppState {
    // Language
    language: Language
    setLanguage: (lang: Language) => void

    // Theme
    theme: Theme
    toggleTheme: () => void

    // Chat
    messages: ChatMessage[]
    addMessage: (msg: ChatMessage) => void
    clearMessages: () => void


    // Loading states
    isTyping: boolean
    setIsTyping: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            language: 'en',
            setLanguage: (language) => set({ language }),

            theme: 'light',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

            messages: [{
                id: 'default-greeting',
                role: 'assistant',
                content: 'Hello! I am your AI Farming Assistant. How can I help you with your agriculture questions today?',
                timestamp: new Date()
            }],
            addMessage: (msg) =>
                set((state) => ({ messages: [...state.messages, msg] })),
            clearMessages: () => set({
                messages: [{
                    id: 'default-greeting',
                    role: 'assistant',
                    content: 'Hello! I am your AI Farming Assistant. How can I help you with your agriculture questions today?',
                    timestamp: new Date()
                }]
            }),


            isTyping: false,
            setIsTyping: (isTyping) => set({ isTyping }),
        }),
        {
            name: 'agri-ai-store',
            partialize: (state) => ({
                language: state.language,
                theme: state.theme,
                messages: state.messages,
            }),
        },
    ),
)
