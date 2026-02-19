import { Avatar } from '@core/primitives/Avatar'
import { Badge } from '@core/primitives/Badge'
import { Button } from '@core/primitives/Button'
import { Spinner } from '@core/primitives/Spinner'
import { EmptyState } from '@core/patterns/EmptyState'
import { useRoom, useRoomMembers, useLeaveRoom, useDeleteRoom } from '@hooks/useRooms'
import { useAuthStore } from '@store/auth.store'
import { useRoomStore } from '@store/room.store'
import { Hash, Lock, Users, Crown, LogOut, Trash2 } from 'lucide-react'
import { ChatArea } from './ChatArea'

interface RoomViewProps {
  roomId: string
}

export function RoomView({ roomId }: RoomViewProps) {
  const { data: room, isLoading, error } = useRoom(roomId)
  const { data: members } = useRoomMembers(roomId)
  const userId = useAuthStore((s) => s.user?.id)
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const leaveRoom = useLeaveRoom()
  const deleteRoom = useDeleteRoom()

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
            <Button variant="outline" size="sm" onClick={clearRoom}>
              Voltar
            </Button>
          }
        />
      </div>
    )
  }

  const isOwner = room.ownerId === userId
  const memberCount = members?.length ?? room._count?.members ?? 0

  async function handleLeave() {
    await leaveRoom.mutateAsync(roomId)
    clearRoom()
  }

  async function handleDelete() {
    await deleteRoom.mutateAsync(roomId)
    clearRoom()
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Room Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
            {room.isPrivate ? (
              <Lock className="text-primary-500 h-5 w-5" />
            ) : (
              <Hash className="text-primary-500 h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">{room.name}</h2>
              {room.isPrivate && (
                <Badge variant="warning" size="sm">
                  Privada
                </Badge>
              )}
            </div>
            {room.description && (
              <p className="text-xs text-[var(--text-muted)]">{room.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Users className="h-3.5 w-3.5" />
            {memberCount}
          </div>
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

      {/* Content: two panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <ChatArea roomId={roomId} />

        {/* Members panel */}
        <div className="hidden w-60 shrink-0 border-l border-[var(--border-default)] lg:block">
          <div className="p-4">
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Membros — {memberCount}
            </h4>
            <div className="space-y-1">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                  <Avatar
                    fallback={member.user.name.slice(0, 2).toUpperCase()}
                    src={member.user.avatar ?? undefined}
                    size="xs"
                    status={
                      member.user.status === 'ONLINE'
                        ? 'online'
                        : member.user.status === 'AWAY'
                          ? 'away'
                          : 'offline'
                    }
                  />
                  <span className="flex-1 truncate text-sm text-[var(--text-primary)]">
                    {member.user.name}
                  </span>
                  {member.userId === room.ownerId && (
                    <Crown className="text-warning-base h-3.5 w-3.5 shrink-0" />
                  )}
                  {member.role === 'ADMIN' && member.userId !== room.ownerId && (
                    <Badge variant="info" size="sm">
                      admin
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
