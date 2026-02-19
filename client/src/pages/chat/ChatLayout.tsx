import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { LogOut, MessageSquare, PanelLeftClose, PanelLeft, Volume2, VolumeX } from 'lucide-react'
import { RoomSidebar } from './RoomSidebar'
import { RoomView } from './RoomView'
import { useRoomStore } from '@store/room.store'

export default function ChatLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const selectedRoomId = useRoomStore((s) => s.selectedRoomId)
  const soundEnabled = useNotificationStore((s) => s.soundEnabled)
  const toggleSound = useNotificationStore((s) => s.toggleSound)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-default)] px-4">
        <div className="flex items-center gap-2">
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
          <MessageSquare className="text-primary-500 h-5 w-5" />
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
          <div className="flex items-center gap-2">
            <Avatar
              fallback={user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
              src={user?.avatar ?? undefined}
              size="sm"
            />
            <span className="hidden text-sm font-medium text-[var(--text-primary)] sm:block">
              {user?.name}
            </span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 shrink-0 border-r border-[var(--border-default)] lg:w-80">
            <RoomSidebar />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {selectedRoomId ? (
            <RoomView roomId={selectedRoomId} />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="text-center">
                <div className="bg-primary-500/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <MessageSquare className="text-primary-500 h-8 w-8" />
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
      </div>

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
