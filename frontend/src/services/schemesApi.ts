import apiClient from './apiClient'

export interface GovernmentScheme {
    name: string
    description: string
    eligibility: string
    benefits: string
    how_to_apply: string
    website: string
}

export interface SchemesResponse {
    success: boolean
    schemes: GovernmentScheme[]
    summary: string
}

export const searchSchemes = async (
    query: string,
    state?: string,
): Promise<SchemesResponse> => {
    const { data } = await apiClient.get<SchemesResponse>('/schemes', {
        params: { query, state },
    })
    return data
}
