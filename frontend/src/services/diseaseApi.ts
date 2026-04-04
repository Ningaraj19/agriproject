import apiClient from './apiClient'

export interface DiseasePrediction {
    disease_name: string
    confidence: number
    description: string
    treatment: string
}

export interface DiseaseResponse {
    success: boolean
    predictions: DiseasePrediction[]
    crop_name: string
    recommendation: string
}

export const detectDisease = async (file: File): Promise<DiseaseResponse> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<DiseaseResponse>('/detect-disease', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}
