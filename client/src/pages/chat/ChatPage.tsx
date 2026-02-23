import { useNavigate } from 'react-router-dom'
import { Button } from '@core/primitives/Button'
import { Avatar } from '@core/primitives/Avatar'
import { Badge } from '@core/primitives/Badge'
import { ThemeToggle } from '@core/primitives/ThemeToggle'
import { useAuthStore } from '@store/auth.store'
import { authService } from '@services/auth.service'
import { LogOut } from 'lucide-react'
import { Logo } from '@components/Logo'

export default function ChatPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  async function handleLogout() {
    try {
      await authService.logout()
    } catch {
      // Logout even if request fails
    }
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-4">
        <div className="flex items-center gap-3">
          <Logo size={24} />
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Realtime Chat</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="flex items-center gap-2">
            <Avatar
              fallback={user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
              src={user?.avatar ?? undefined}
              size="sm"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>
          </div>

          <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content — placeholder */}
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
            <Logo size={56} />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Autenticação completa!
          </h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Bem-vindo, <span className="font-medium text-[var(--text-primary)]">{user?.name}</span>.
            As salas de chat serão implementadas nas próximas fases.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="success">Fase 6 ✓</Badge>
            <Badge variant="default">Fase 7 — Salas (próxima)</Badge>
          </div>
        </div>
      </main>
    </div>
  )
}
