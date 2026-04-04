import apiClient from './apiClient'

export interface YouTubeVideo {
    title: string
    video_id: string
    url: string
    thumbnail_url: string
    channel_name: string
    description: string
    published_at: string
}

export interface YouTubeResponse {
    success: boolean
    videos: YouTubeVideo[]
    query_used: string
}

export const searchVideos = async (
    query: string,
    language = 'en',
    max_results = 8,
): Promise<YouTubeResponse> => {
    const { data } = await apiClient.get<YouTubeResponse>('/youtube-videos', {
        params: { query, language, max_results },
    })
    return data
}
