import { useNavigate } from 'react-router-dom'
import { UserPlus, UserMinus, Clock, Check, X, Hash, Lock, Calendar } from 'lucide-react'
import { Drawer } from '@core/organisms/Drawer/Drawer'
import { Avatar } from '@core/primitives/Avatar'
import { Badge } from '@core/primitives/Badge'
import { Button } from '@core/primitives/Button'
import { Spinner } from '@core/primitives/Spinner'
import { EmptyState } from '@core/patterns/EmptyState'
import {
  useUserProfile,
  useSendFriendRequest,
  useRespondToRequest,
  useRemoveFriend,
} from '@hooks/useFriends'
import { useAuthStore } from '@store/auth.store'

// ============ TYPES ============

interface UserProfileDrawerProps {
  userId: string | null
  onClose: () => void
}

// ============ HELPERS ============

function statusToAvatarStatus(status: string): 'online' | 'away' | 'offline' {
  if (status === 'ONLINE') return 'online'
  if (status === 'AWAY') return 'away'
  return 'offline'
}

function statusLabel(status: string): string {
  if (status === 'ONLINE') return 'Online'
  if (status === 'AWAY') return 'Ausente'
  return 'Offline'
}

function statusBadgeVariant(status: string): 'success' | 'warning' | 'default' {
  if (status === 'ONLINE') return 'success'
  if (status === 'AWAY') return 'warning'
  return 'default'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ============ COMPONENT ============

export function UserProfileDrawer({ userId, onClose }: UserProfileDrawerProps) {
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)

  // Don't query the current user's own profile
  const effectiveUserId = userId && userId !== currentUserId ? userId : null
  const { data: profile, isLoading } = useUserProfile(effectiveUserId)

  const sendRequest = useSendFriendRequest()
  const respondToRequest = useRespondToRequest()
  const removeFriend = useRemoveFriend()

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  // ---- Friendship action buttons ----

  function renderFriendshipActions() {
    if (!profile) return null

    const { friendship } = profile

    // No existing friendship
    if (!friendship) {
      return (
        <Button
          variant="primary"
          fullWidth
          leftIcon={<UserPlus />}
          loading={sendRequest.isPending}
          onClick={() => sendRequest.mutate(profile.id)}
        >
          Adicionar amigo
        </Button>
      )
    }

    // Pending - current user sent the request
    if (friendship.status === 'PENDING' && friendship.isSender) {
      return (
        <Button variant="secondary" fullWidth disabled leftIcon={<Clock />}>
          Pedido enviado
        </Button>
      )
    }

    // Pending - current user received the request
    if (friendship.status === 'PENDING' && !friendship.isSender) {
      return (
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1"
            leftIcon={<Check />}
            loading={respondToRequest.isPending}
            onClick={() =>
              respondToRequest.mutate({
                friendshipId: friendship.id,
                action: 'accept',
              })
            }
          >
            Aceitar
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            leftIcon={<X />}
            loading={respondToRequest.isPending}
            onClick={() =>
              respondToRequest.mutate({
                friendshipId: friendship.id,
                action: 'decline',
              })
            }
          >
            Recusar
          </Button>
        </div>
      )
    }

    // Accepted
    if (friendship.status === 'ACCEPTED') {
      return (
        <Button
          variant="danger-outline"
          fullWidth
          leftIcon={<UserMinus />}
          loading={removeFriend.isPending}
          onClick={() => removeFriend.mutate(friendship.id)}
        >
          Remover amigo
        </Button>
      )
    }

    return null
  }

  // ---- Shared rooms ----

  function renderSharedRooms() {
    if (!profile) return null

    const { sharedRooms } = profile

    if (sharedRooms.length === 0) {
      return (
        <EmptyState
          size="sm"
          icon={<Hash className="h-5 w-5" />}
          title="Nenhuma sala em comum"
          description="Vocês ainda não compartilham nenhuma sala."
        />
      )
    }

    return (
      <div className="flex flex-col gap-2">
        {sharedRooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => {
              navigate(`/chat/${room.id}`)
              onClose()
            }}
            className={
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ' +
              'bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] ' +
              'border border-[var(--border-default)]'
            }
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--bg-muted)] text-[var(--text-muted)]">
              {room.isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{room.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {room._count.members} {room._count.members === 1 ? 'membro' : 'membros'}
              </p>
            </div>
          </button>
        ))}
      </div>
    )
  }

  // ---- Main render ----

  return (
    <Drawer open={!!userId && userId !== currentUserId} onOpenChange={handleOpenChange}>
      <Drawer.Content side="right" size="sm">
        <Drawer.Header>
          <Drawer.Title>Perfil do usu&#225;rio</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" label="Carregando perfil..." />
            </div>
          ) : !profile ? (
            <EmptyState
              size="sm"
              title="Usu&#225;rio n&#227;o encontrado"
              description="N&#227;o foi poss&#237;vel carregar o perfil deste usu&#225;rio."
            />
          ) : (
            <div className="flex flex-col gap-6">
              {/* Avatar + status */}
              <div className="flex flex-col items-center gap-3">
                <Avatar
                  size="2xl"
                  src={profile.avatar ?? undefined}
                  initials={profile.name}
                  alt={profile.name}
                  status={statusToAvatarStatus(profile.status)}
                />

                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{profile.name}</h2>
                  <Badge variant={statusBadgeVariant(profile.status)} size="sm" dot>
                    {statusLabel(profile.status)}
                  </Badge>
                </div>

                {profile.bio && (
                  <p className="text-center text-sm text-[var(--text-muted)]">{profile.bio}</p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Membro desde {formatDate(profile.createdAt)}</span>
                </div>
              </div>

              {/* Friendship actions */}
              <div>{renderFriendshipActions()}</div>

              {/* Shared rooms */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Salas em comum</h3>
                {renderSharedRooms()}
              </div>
            </div>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  )
}
