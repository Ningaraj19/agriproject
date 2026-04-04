import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import MainLayout from './layouts/MainLayout'
import { useAppStore } from './store/useAppStore'

const ChatPage = lazy(() => import('./pages/ChatPage'))
const DiseasePage = lazy(() => import('./pages/DiseasePage'))
const WeatherPage = lazy(() => import('./pages/WeatherPage'))
const MarketPage = lazy(() => import('./pages/MarketPage'))
const SchemesPage = lazy(() => import('./pages/SchemesPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const YouTubePage = lazy(() => import('./pages/YouTubePage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#f8fafc] dark:bg-[#0a0f1e] transition-colors">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-green-500 animate-bounce shadow-sm"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function AppLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

export default function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/disease" element={<DiseasePage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/youtube" element={<YouTubePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
