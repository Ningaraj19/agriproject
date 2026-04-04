import apiClient from './apiClient'

export interface STTResponse {
    success: boolean
    transcribed_text: string
    detected_language: string
}

export interface TTSResponse {
    success: boolean
    audio_url: string
    language: string
}

export const speechToText = async (audioBlob: Blob): Promise<STTResponse> => {
    const form = new FormData()
    form.append('file', audioBlob, 'recording.wav')
    const { data } = await apiClient.post<STTResponse>('/voice/stt', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

export const textToSpeech = async (
    text: string,
    language = 'en',
): Promise<TTSResponse> => {
    const { data } = await apiClient.post<TTSResponse>('/voice/tts', { text, language })
    return data
}
