import apiClient from './apiClient'

export interface ChatMessage {
    question: string
    language?: string
    farmer_id?: string
}

export interface ChatResponse {
    success: boolean
    answer: string
    language: string
    sources: string[]
}

export const askQuestion = async (payload: ChatMessage): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/ask', payload)
    return data
}
