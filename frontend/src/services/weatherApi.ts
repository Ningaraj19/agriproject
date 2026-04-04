import apiClient from './apiClient'

export interface WeatherData {
    temperature_c: number
    humidity_pct: number
    precipitation_mm: number
    wind_speed_kmh: number
    weather_description: string
}

export interface WeatherResponse {
    success: boolean
    location: string
    current_weather: WeatherData | null
    farming_recommendation: string
    alerts: string[]
}

export const getWeather = async (
    city: string,
    crop?: string,
): Promise<WeatherResponse> => {
    // 1. Convert City to Lat/Long using Open-Meteo Geocoding (Free)
    const geocodeRaw = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
    const geocodeData = await geocodeRaw.json()

    if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('City not found. Please try a valid city name.')
    }

    const { latitude, longitude, name, admin1, country } = geocodeData.results[0]

    // 2. Fetch the actual weather and AI farming recommendation from our backend
    const { data } = await apiClient.get<WeatherResponse>('/weather', {
        params: { latitude, longitude, crop },
    })

    // Attach the resolved beautiful location name explicitly
    return {
        ...data,
        location: `${name}, ${admin1 ? admin1 + ', ' : ''}${country}`
    }
}
