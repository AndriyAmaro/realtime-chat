import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/auth.store'
import { authService } from '@services/auth.service'
import AuthLayout from '@pages/auth/AuthLayout'
import LoginPage from '@pages/auth/LoginPage'
import RegisterPage from '@pages/auth/RegisterPage'
import ProtectedRoute from '@components/ProtectedRoute'
import ChatLayout from '@pages/chat/ChatLayout'

export default function App() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)

  // Try restoring session from refresh token cookie on app load
  useEffect(() => {
    async function restoreSession() {
      try {
        const { accessToken } = await authService.refreshToken()
        const user = await authService.getProfile()
        setAuth(user, accessToken)
      } catch {
        logout()
      }
    }
    restoreSession()
  }, [setAuth, logout])

  return (
    <Routes>
      {/* Auth pages (public) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected pages */}
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatLayout />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
