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

  // Try restoring session on app load using stored refresh token.
  // Must wait for Zustand persist to hydrate from localStorage first,
  // otherwise refreshToken is null and we'd incorrectly call logout().
  useEffect(() => {
    async function restoreSession() {
      const storedRefreshToken = useAuthStore.getState().refreshToken
      if (!storedRefreshToken) {
        logout()
        return
      }

      try {
        const { accessToken, refreshToken } = await authService.refreshToken(storedRefreshToken)
        const user = await authService.getProfile()
        setAuth(user, accessToken, refreshToken)
      } catch {
        logout()
      }
    }

    // If already hydrated from localStorage, restore now
    if (useAuthStore.persist.hasHydrated()) {
      restoreSession()
      return
    }

    // Otherwise wait for hydration to complete, then restore
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      restoreSession()
    })

    return unsub
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
