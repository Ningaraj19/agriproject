import apiClient from './apiClient'

export interface CropPrice {
    crop_name: string
    market: string
    price_per_quintal: number
    unit: string
    trend: 'up' | 'down' | 'stable'
    last_updated: string
}

export interface MarketResponse {
    success: boolean
    prices: CropPrice[]
    analysis: string
}

export const getMarketPrices = async (
    crop?: string,
    state?: string,
): Promise<MarketResponse> => {
    const { data } = await apiClient.get<MarketResponse>('/market', {
        params: { crop, state },
    })
    return data
}
