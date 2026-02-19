import { Outlet, Navigate } from 'react-router-dom'
import { AuthBackground } from '@core/patterns/AuthBackground'
import { ThemeToggle } from '@core/primitives/ThemeToggle'
import { useAuthStore } from '@store/auth.store'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Left panel — AuthBackground (hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <AuthBackground />
        <div className="absolute right-8 bottom-8 left-8">
          <p className="text-lg font-semibold text-white/90">Conecte-se em tempo real</p>
          <p className="mt-1 text-sm text-white/60">
            Chat com salas, mensagens instantâneas e muito mais.
          </p>
        </div>
      </div>

      {/* Right panel — Auth form */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Top bar */}
        <div className="flex items-center justify-end p-4">
          <ThemeToggle />
        </div>

        {/* Form area — centered */}
        <div className="flex flex-1 items-center justify-center px-4 pb-8">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
