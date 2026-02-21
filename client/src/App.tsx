import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spinner } from '@core/primitives/Spinner'
import { useAuthStore } from '@store/auth.store'
import { authService } from '@services/auth.service'
import ProtectedRoute from '@components/ProtectedRoute'

const LandingPage = lazy(() => import('@pages/LandingPage'))
const AuthLayout = lazy(() => import('@pages/auth/AuthLayout'))
const LoginPage = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'))
const ChatLayout = lazy(() => import('@pages/chat/ChatLayout'))

function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
      <Spinner size="lg" />
    </div>
  )
}

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

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Landing page (redirect to /chat if authenticated) */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/chat" replace /> : <LandingPage />}
        />

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
