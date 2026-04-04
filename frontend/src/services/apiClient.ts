import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 180000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor – attach auth headers if needed in future
apiClient.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error),
)

// Response interceptor – normalize errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            'An unexpected error occurred'
        return Promise.reject(new Error(message))
    },
)

export default apiClient
