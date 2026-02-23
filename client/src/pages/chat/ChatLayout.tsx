import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ThemeToggle } from '@core/primitives/ThemeToggle'
import { Avatar } from '@core/primitives/Avatar'
import { Button } from '@core/primitives/Button'
import { Toast } from '@core/patterns/Toast'
import { useAuthStore } from '@store/auth.store'
import { useNotificationStore } from '@store/notification.store'
import { authService } from '@services/auth.service'
import { useSocket } from '@hooks/useSocket'
import { useToast } from '@hooks/useToast'
import { useNotifications } from '@hooks/useNotifications'
import { useMediaQuery } from '@hooks/useMediaQuery'
import { LogOut, PanelLeftClose, PanelLeft, Volume2, VolumeX } from 'lucide-react'
import { Logo } from '@components/Logo'
import { RoomSidebar } from './RoomSidebar'
import { RoomView } from './RoomView'
import { ProfileModal } from './ProfileModal'
import { setActiveRoomId } from '@hooks/useActiveRoomId'

export default function ChatLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { roomId: selectedRoomId } = useParams<{ roomId?: string }>()
  const soundEnabled = useNotificationStore((s) => s.soundEnabled)
  const toggleSound = useNotificationStore((s) => s.toggleSound)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  const isMobile = !useMediaQuery('(min-width: 768px)')

  // Keep module-level ref in sync for useNotifications event handlers
  setActiveRoomId(selectedRoomId ?? null)
  useEffect(() => {
    return () => setActiveRoomId(null)
  }, [])

  // Socket + notifications
  const { socket, isConnected } = useSocket()
  const { toasts, addToast, dismissToast } = useToast()
  useNotifications({ socket, isConnected, addToast })

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
    <div className="flex h-screen flex-col bg-[var(--bg-base)]">
      {/* Header — hidden on mobile when inside a room (room has its own header) */}
      {!(isMobile && selectedRoomId) && (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-default)] px-4">
          <div className="flex items-center gap-2">
            {/* Sidebar toggle — desktop only */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            )}
            <Logo size={24} />
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">Realtime Chat</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-[var(--text-muted)]" />
              )}
            </Button>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-[var(--bg-subtle)]"
              aria-label="Abrir configurações do perfil"
            >
              <Avatar
                fallback={user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
                src={user?.avatar ?? undefined}
                size="sm"
              />
              <span className="hidden text-sm font-medium text-[var(--text-primary)] sm:block">
                {user?.name}
              </span>
            </button>
            <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile: full-screen swap — sidebar OR room
          selectedRoomId ? (
            <main className="flex flex-1 flex-col overflow-hidden">
              <RoomView roomId={selectedRoomId} />
            </main>
          ) : (
            <div className="flex-1 overflow-hidden">
              <RoomSidebar />
            </div>
          )
        ) : (
          // Desktop: sidebar (collapsible) + main area
          <>
            {sidebarOpen && (
              <aside className="w-72 shrink-0 border-r border-[var(--border-default)] lg:w-80">
                <RoomSidebar />
              </aside>
            )}
            <main className="flex flex-1 flex-col overflow-hidden">
              {selectedRoomId ? (
                <RoomView roomId={selectedRoomId} />
              ) : (
                <div className="flex flex-1 items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl">
                      <Logo size={56} />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Selecione uma sala
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Escolha uma sala no menu lateral para começar a conversar
                    </p>
                  </div>
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onSuccess={(message) => addToast({ variant: 'success', title: message })}
        onError={(message) => addToast({ variant: 'error', title: message })}
      />

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          description={toast.description}
          duration={toast.duration ?? 4000}
          onOpenChange={(open) => {
            if (!open) dismissToast(toast.id)
          }}
        />
      ))}
    </div>
  )
}
