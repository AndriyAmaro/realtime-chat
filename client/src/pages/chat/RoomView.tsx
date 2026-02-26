import { memo, useCallback, useState } from 'react'
import { Avatar } from '@core/primitives/Avatar'
import { Badge } from '@core/primitives/Badge'
import { Button } from '@core/primitives/Button'
import { Spinner } from '@core/primitives/Spinner'
import { EmptyState } from '@core/patterns/EmptyState'
import { Drawer } from '@core/organisms/Drawer/Drawer'
import { SimpleTooltip } from '@core/primitives/Tooltip'
import {
  useRoom,
  useRoomMembers,
  useLeaveRoom,
  useDeleteRoom,
  useRegenerateInviteCode,
} from '@hooks/useRooms'
import { useAuthStore } from '@store/auth.store'
import { useMediaQuery } from '@hooks/useMediaQuery'
import {
  Hash,
  Lock,
  Users,
  Crown,
  LogOut,
  Trash2,
  Circle,
  Search,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  Fingerprint,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '@hooks/useSocket'
import { useOnlineStatus } from '@hooks/useOnlineStatus'
import { ChatArea } from './ChatArea'
import { MessageSearch } from './MessageSearch'
import { UserProfileDrawer } from './UserProfileDrawer'
import type { RoomMember } from '@/types/room'

interface RoomViewProps {
  roomId: string
}

export function RoomView({ roomId }: RoomViewProps) {
  const { data: room, isLoading, error } = useRoom(roomId)
  const { data: members } = useRoomMembers(roomId)
  const userId = useAuthStore((s) => s.user?.id)
  const navigate = useNavigate()
  const goBack = () => navigate('/chat')
  const leaveRoom = useLeaveRoom()
  const deleteRoom = useDeleteRoom()
  const { socket, isConnected } = useSocket()
  const { getUserStatus, onlineCount } = useOnlineStatus({ socket, roomId, isConnected })
  const [searchOpen, setSearchOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  const isMobile = !useMediaQuery('(min-width: 768px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <EmptyState
          title="Sala não encontrada"
          description="A sala pode ter sido excluída ou você não tem acesso"
          action={
            <Button variant="outline" size="sm" onClick={goBack}>
              Voltar
            </Button>
          }
        />
      </div>
    )
  }

  const isOwner = room.ownerId === userId
  const currentMember = members?.find((m) => m.userId === userId)
  const canManage = isOwner || currentMember?.role === 'ADMIN'
  const memberCount = members?.length ?? room._count?.members ?? 0

  async function handleLeave() {
    await leaveRoom.mutateAsync(roomId)
    goBack()
  }

  async function handleDelete() {
    await deleteRoom.mutateAsync(roomId)
    goBack()
  }

  function handleSearchNavigate(messageId: string) {
    setHighlightedMessageId(messageId)
    setSearchOpen(false)
    setTimeout(() => setHighlightedMessageId(null), 3000)
  }

  // Member count display (shared between clickable and static variants)
  const memberCountContent = (
    <>
      <div className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5" />
        {memberCount}
      </div>
      {onlineCount > 0 && (
        <div className="flex items-center gap-1 text-[var(--success-base)]">
          <Circle className="h-2 w-2 fill-current" />
          {onlineCount}
        </div>
      )}
    </>
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Room Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] px-3 py-3 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Mobile back button */}
          {isMobile && (
            <Button variant="ghost" size="icon-sm" onClick={goBack} aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="bg-primary-500/10 hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex">
            {room.isPrivate ? (
              <Lock className="text-primary-500 h-5 w-5" />
            ) : (
              <Hash className="text-primary-500 h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">
                {room.name}
              </h2>
              {room.isPrivate && (
                <Badge variant="warning" size="sm">
                  Privada
                </Badge>
              )}
            </div>
            {room.description && (
              <p className="hidden truncate text-xs text-[var(--text-muted)] sm:block">
                {room.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Member count — clickable on non-desktop to open members drawer */}
          {isDesktop ? (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              {memberCountContent}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMembersOpen(true)}
              className="flex items-center gap-2 rounded-md px-1.5 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)]"
              aria-label="Ver membros"
            >
              {memberCountContent}
            </button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Buscar mensagens"
            className={searchOpen ? 'text-primary-500' : ''}
          >
            <Search className="h-4 w-4" />
          </Button>
          {!isOwner && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLeave}
              disabled={leaveRoom.isPending}
              aria-label="Sair da sala"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={deleteRoom.isPending}
              aria-label="Excluir sala"
              className="text-error-base hover:bg-error-base/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content: chat + inline panels */}
      <div className="flex flex-1 overflow-hidden">
        <ChatArea
          roomId={roomId}
          highlightedMessageId={highlightedMessageId}
          onUserClick={setProfileUserId}
        />

        {/* Desktop: inline search panel */}
        {isDesktop && searchOpen && (
          <div className="w-72 shrink-0 border-l border-[var(--border-default)]">
            <MessageSearch
              roomId={roomId}
              onClose={() => setSearchOpen(false)}
              onNavigate={handleSearchNavigate}
            />
          </div>
        )}

        {/* Desktop: inline members panel */}
        {isDesktop && !searchOpen && (
          <div className="w-60 shrink-0 overflow-y-auto border-l border-[var(--border-default)]">
            <div className="p-4">
              <RoomInfoSection
                roomId={roomId}
                inviteCode={room.inviteCode}
                isPrivate={room.isPrivate}
                canManage={canManage}
              />
            </div>
            <div className="mx-4 border-t border-[var(--border-default)]" />
            <div className="p-4">
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Membros — {memberCount}
              </h4>
              <MembersList
                members={members}
                ownerId={room.ownerId}
                getUserStatus={getUserStatus}
                onUserClick={setProfileUserId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet: search drawer */}
      {!isDesktop && (
        <Drawer open={searchOpen} onOpenChange={setSearchOpen}>
          <Drawer.Content side="right" size="sm" showCloseButton={false}>
            <Drawer.Title className="sr-only">Busca de mensagens</Drawer.Title>
            <MessageSearch
              roomId={roomId}
              onClose={() => setSearchOpen(false)}
              onNavigate={handleSearchNavigate}
            />
          </Drawer.Content>
        </Drawer>
      )}

      {/* Mobile/Tablet: members drawer */}
      {!isDesktop && (
        <Drawer open={membersOpen} onOpenChange={setMembersOpen}>
          <Drawer.Content side="right" size="sm">
            <Drawer.Header>
              <Drawer.Title>Sala</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body className="space-y-4 p-4">
              <RoomInfoSection
                roomId={roomId}
                inviteCode={room.inviteCode}
                isPrivate={room.isPrivate}
                canManage={canManage}
              />
              <div className="border-t border-[var(--border-default)]" />
              <div>
                <h4 className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  Membros — {memberCount}
                </h4>
                <MembersList
                  members={members}
                  ownerId={room.ownerId}
                  getUserStatus={getUserStatus}
                  onUserClick={setProfileUserId}
                />
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      )}

      {/* User Profile Drawer */}
      <UserProfileDrawer userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  )
}

// ============ COPY BUTTON ============

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  return (
    <SimpleTooltip content={copied ? 'Copiado!' : `Copiar ${label}`} side="top">
      <button
        type="button"
        onClick={handleCopy}
        className="group/copy relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-150 hover:bg-[var(--bg-emphasis)]"
        aria-label={`Copiar ${label}`}
      >
        <Copy
          className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-all duration-200 group-hover/copy:text-[var(--text-primary)] ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        />
        <Check
          className={`absolute h-3.5 w-3.5 text-[var(--success-base)] transition-all duration-200 ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        />
      </button>
    </SimpleTooltip>
  )
}

// ============ ROOM INFO SECTION ============

interface RoomInfoSectionProps {
  roomId: string
  inviteCode?: string
  isPrivate: boolean
  canManage: boolean
}

const RoomInfoSection = memo(function RoomInfoSection({
  roomId,
  inviteCode,
  isPrivate,
  canManage,
}: RoomInfoSectionProps) {
  const regenerate = useRegenerateInviteCode()

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
        Informações da sala
      </h4>

      {/* Room ID */}
      <div className="group rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3 transition-colors duration-150 hover:border-[var(--border-strong)]">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Fingerprint className="h-3 w-3 text-[var(--text-muted)]" />
          <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
            ID da sala
          </span>
        </div>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--text-secondary)]">
            {roomId}
          </code>
          <CopyButton value={roomId} label="ID" />
        </div>
      </div>

      {/* Invite Code — only for private rooms, visible to owner/admin */}
      {isPrivate && canManage && inviteCode && (
        <div className="group rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3 transition-colors duration-150 hover:border-[var(--border-strong)]">
          <div className="mb-1.5 flex items-center gap-1.5">
            <KeyRound className="h-3 w-3 text-[var(--text-muted)]" />
            <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
              Código de convite
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate font-mono text-sm font-semibold tracking-widest text-[var(--text-primary)]">
              {inviteCode}
            </code>
            <CopyButton value={inviteCode} label="código" />
          </div>
          <div className="mt-2 border-t border-[var(--border-default)] pt-2">
            <SimpleTooltip content="Gera um novo código e invalida o anterior" side="bottom">
              <button
                type="button"
                onClick={() => regenerate.mutate(roomId)}
                disabled={regenerate.isPending}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${regenerate.isPending ? 'animate-spin' : ''}`} />
                {regenerate.isPending ? 'Regenerando...' : 'Regenerar código'}
              </button>
            </SimpleTooltip>
          </div>
        </div>
      )}

      {/* Hint for non-private rooms */}
      {!isPrivate && (
        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
          Sala pública — qualquer pessoa pode entrar com o ID acima.
        </p>
      )}

      {/* Hint for private rooms where user is NOT admin */}
      {isPrivate && !canManage && (
        <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
          Sala privada — peça o código de convite ao administrador.
        </p>
      )}
    </div>
  )
})

// ============ MEMBERS LIST ============

interface MembersListProps {
  members: RoomMember[] | undefined
  ownerId: string
  getUserStatus: (userId: string, fallback: string) => string
  onUserClick?: (userId: string) => void
}

const MembersList = memo(function MembersList({
  members,
  ownerId,
  getUserStatus,
  onUserClick,
}: MembersListProps) {
  return (
    <div className="space-y-1">
      {members?.map((member) => (
        <button
          key={member.id}
          type="button"
          onClick={() => onUserClick?.(member.userId)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-subtle)]"
        >
          <Avatar
            fallback={member.user.name.slice(0, 2).toUpperCase()}
            src={member.user.avatar ?? undefined}
            size="xs"
            status={statusToAvatarStatus(getUserStatus(member.userId, member.user.status))}
          />
          <span className="flex-1 truncate text-sm text-[var(--text-primary)]">
            {member.user.name}
          </span>
          {member.userId === ownerId && (
            <Crown className="text-warning-base h-3.5 w-3.5 shrink-0" />
          )}
          {member.role === 'ADMIN' && member.userId !== ownerId && (
            <Badge variant="info" size="sm">
              admin
            </Badge>
          )}
        </button>
      ))}
    </div>
  )
})

// ============ HELPERS ============

function statusToAvatarStatus(status: string): 'online' | 'away' | 'offline' {
  if (status === 'ONLINE') return 'online'
  if (status === 'AWAY') return 'away'
  return 'offline'
}
