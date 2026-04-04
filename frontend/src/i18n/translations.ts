export type TranslationKey =
    | 'nav.chat'
    | 'nav.disease'
    | 'nav.weather'
    | 'nav.market'
    | 'nav.schemes'
    | 'nav.youtube'
    | 'chat.placeholder'
    | 'chat.send'
    | 'chat.title'
    | 'chat.subtitle'
    | 'chat.empty'
    | 'disease.title'
    | 'disease.subtitle'
    | 'disease.dropzone'
    | 'disease.analyze'
    | 'disease.confidence'
    | 'disease.treatment'
    | 'weather.title'
    | 'weather.subtitle'
    | 'weather.temperature'
    | 'weather.humidity'
    | 'weather.rainfall'
    | 'weather.wind'
    | 'weather.advice'
    | 'weather.fetch'
    | 'market.title'
    | 'market.subtitle'
    | 'market.search'
    | 'market.analysis'
    | 'schemes.title'
    | 'schemes.subtitle'
    | 'schemes.search'
    | 'schemes.eligibility'
    | 'schemes.benefits'
    | 'schemes.apply'
    | 'youtube.title'
    | 'youtube.subtitle'
    | 'youtube.search'
    | 'common.loading'
    | 'common.error'
    | 'common.retry'
    | 'common.noResults'

type Translations = Record<TranslationKey, string>

const en: Translations = {
    'nav.chat': 'AI Assistant',
    'nav.disease': 'Disease Detection',
    'nav.weather': 'Weather',
    'nav.market': 'Market Prices',
    'nav.schemes': 'Gov Schemes',
    'nav.youtube': 'Learn',
    'chat.placeholder': 'Ask me anything about farming...',
    'chat.send': 'Send',
    'chat.title': 'AI Farming Assistant',
    'chat.subtitle': 'Powered by RAG + Groq LLaMA',
    'chat.empty': 'Ask me anything about crops, soil, weather, or farming practices.',
    'disease.title': 'Crop Disease Detection',
    'disease.subtitle': 'Upload a leaf image for AI-powered diagnosis',
    'disease.dropzone': 'Drag & drop a plant/leaf image here, or click to select',
    'disease.analyze': 'Analyze Disease',
    'disease.confidence': 'Confidence',
    'disease.treatment': 'Treatment',
    'weather.title': 'Weather Dashboard',
    'weather.subtitle': 'Real-time weather with farming recommendations',
    'weather.temperature': 'Temperature',
    'weather.humidity': 'Humidity',
    'weather.rainfall': 'Rainfall',
    'weather.wind': 'Wind Speed',
    'weather.advice': 'Farming Advice',
    'weather.fetch': 'Get Weather',
    'market.title': 'Market Prices',
    'market.subtitle': 'Live crop prices from Indian APMCs',
    'market.search': 'Search crop or state...',
    'market.analysis': 'Market Analysis',
    'schemes.title': 'Government Schemes',
    'schemes.subtitle': 'Find subsidies & welfare programs for farmers',
    'schemes.search': 'Search schemes...',
    'schemes.eligibility': 'Eligibility',
    'schemes.benefits': 'Benefits',
    'schemes.apply': 'How to Apply',
    'youtube.title': 'Farming Videos',
    'youtube.subtitle': 'Learn from expert farming tutorials',
    'youtube.search': 'Search farming videos...',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong. Please try again.',
    'common.retry': 'Retry',
    'common.noResults': 'No results found.',
}

const kn: Translations = {
    'nav.chat': 'AI ಸಹಾಯಕ',
    'nav.disease': 'ರೋಗ ಪತ್ತೆ',
    'nav.weather': 'ಹವಾಮಾನ',
    'nav.market': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ',
    'nav.schemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆ',
    'nav.youtube': 'ಕಲಿಯಿರಿ',
    'chat.placeholder': 'ಕೃಷಿ ಬಗ್ಗೆ ಯಾವುದಾದರೂ ಕೇಳಿ...',
    'chat.send': 'ಕಳಿಸಿ',
    'chat.title': 'AI ಕೃಷಿ ಸಹಾಯಕ',
    'chat.subtitle': 'RAG + Groq LLaMA ಮೂಲಕ',
    'chat.empty': 'ಬೆಳೆ, ಮಣ್ಣು, ಹವಾಮಾನ ಅಥವಾ ಕೃಷಿ ಪದ್ಧತಿಗಳ ಬಗ್ಗೆ ಕೇಳಿ.',
    'disease.title': 'ಬೆಳೆ ರೋಗ ಪತ್ತೆ',
    'disease.subtitle': 'AI ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಎಲೆ ಚಿತ್ರ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
    'disease.dropzone': 'ಸಸ್ಯ/ಎಲೆ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಡ್ರ್ಯಾಗ್ ಮಾಡಿ',
    'disease.analyze': 'ರೋಗ ವಿಶ್ಲೇಷಿಸಿ',
    'disease.confidence': 'ವಿಶ್ವಾಸ',
    'disease.treatment': 'ಚಿಕಿತ್ಸೆ',
    'weather.title': 'ಹವಾಮಾನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'weather.subtitle': 'ನೈಜ-ಸಮಯ ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ',
    'weather.temperature': 'ತಾಪಮಾನ',
    'weather.humidity': 'ತೇವಾಂಶ',
    'weather.rainfall': 'ಮಳೆ',
    'weather.wind': 'ಗಾಳಿ ವೇಗ',
    'weather.advice': 'ಕೃಷಿ ಸಲಹೆ',
    'weather.fetch': 'ಹವಾಮಾನ ತಿಳಿಯಿರಿ',
    'market.title': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ',
    'market.subtitle': 'ಭಾರತೀಯ APMC ನಿಂದ ನೇರ ಬೆಲೆ',
    'market.search': 'ಬೆಳೆ ಅಥವಾ ರಾಜ್ಯ ಹುಡುಕಿ...',
    'market.analysis': 'ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ',
    'schemes.title': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    'schemes.subtitle': 'ರೈತರಿಗಾಗಿ ಸಬ್ಸಿಡಿ ಮತ್ತು ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮ',
    'schemes.search': 'ಯೋಜನೆ ಹುಡುಕಿ...',
    'schemes.eligibility': 'ಅರ್ಹತೆ',
    'schemes.benefits': 'ಪ್ರಯೋಜನಗಳು',
    'schemes.apply': 'ಅರ್ಜಿ ಹೇಗೆ',
    'youtube.title': 'ಕೃಷಿ ವಿಡಿಯೋಗಳು',
    'youtube.subtitle': 'ತಜ್ಞ ಕೃಷಿ ಟ್ಯುಟೋರಿಯಲ್‌ಗಳಿಂದ ಕಲಿಯಿರಿ',
    'youtube.search': 'ಕೃಷಿ ವಿಡಿಯೋ ಹುಡುಕಿ...',
    'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    'common.error': 'ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    'common.retry': 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    'common.noResults': 'ಯಾವ ಫಲಿತಾಂಶಗಳೂ ಇಲ್ಲ.',
}

const translations = { en, kn }

export const t = (key: TranslationKey, lang: 'en' | 'kn' = 'en'): string => {
    return translations[lang][key] ?? translations.en[key] ?? key
}
