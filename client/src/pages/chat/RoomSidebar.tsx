import { memo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SearchBar } from '@core/patterns/SearchBar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@core/patterns/Tabs'
import { Button } from '@core/primitives/Button'
import { Spinner } from '@core/primitives/Spinner'
import { EmptyState } from '@core/patterns/EmptyState'
import { Plus, Link2, Hash, Lock } from 'lucide-react'
import { useMyRooms, usePublicRooms, roomKeys } from '@hooks/useRooms'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@store/auth.store'
import { useNotificationStore } from '@store/notification.store'
import { roomService } from '@services/room.service'
import { Avatar } from '@core/primitives/Avatar'
import { Badge } from '@core/primitives/Badge'
import { CreateRoomModal } from './CreateRoomModal'
import { JoinRoomModal } from './JoinRoomModal'
import type { Room } from '@/types/room'

export function RoomSidebar() {
  const { roomId: selectedRoomId } = useParams<{ roomId?: string }>()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      {/* Header actions */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] p-3">
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)} className="flex-1">
          <Plus className="mr-1.5 h-4 w-4" />
          Criar sala
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setJoinOpen(true)}
          aria-label="Entrar com código"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <SearchBar
          size="sm"
          variant="filled"
          placeholder="Buscar salas..."
          onSearch={setSearch}
          debounceMs={300}
        />
      </div>

      {/* Tabs: My Rooms / Discover */}
      <Tabs
        defaultValue="my"
        variant="underline"
        size="sm"
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-3 mt-2">
          <TabsTrigger value="my">Minhas salas</TabsTrigger>
          <TabsTrigger value="public">Descobrir</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="flex-1 overflow-y-auto px-2 py-2">
          <MyRoomsList search={search} selectedRoomId={selectedRoomId} />
        </TabsContent>

        <TabsContent value="public" className="flex-1 overflow-y-auto px-2 py-2">
          <PublicRoomsList search={search} selectedRoomId={selectedRoomId} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateRoomModal open={createOpen} onOpenChange={setCreateOpen} />
      <JoinRoomModal open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  )
}

// ============ MY ROOMS LIST ============

function MyRoomsList({ search, selectedRoomId }: { search: string; selectedRoomId?: string }) {
  const { data: rooms, isLoading } = useMyRooms()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" />
      </div>
    )
  }

  const filtered = filterRooms(rooms, search)

  if (filtered.length === 0) {
    return (
      <EmptyState
        size="sm"
        title={search ? 'Nenhuma sala encontrada' : 'Nenhuma sala ainda'}
        description={
          search ? 'Tente outro termo de busca' : 'Crie uma sala ou entre em uma existente'
        }
      />
    )
  }

  return (
    <div className="space-y-0.5">
      {filtered.map((room) => (
        <RoomItem key={room.id} room={room} selectedRoomId={selectedRoomId} />
      ))}
    </div>
  )
}

// ============ PUBLIC ROOMS LIST ============

function PublicRoomsList({ search, selectedRoomId }: { search: string; selectedRoomId?: string }) {
  const { data: rooms, isLoading } = usePublicRooms(search || undefined)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" />
      </div>
    )
  }

  const filtered = rooms ?? []

  if (filtered.length === 0) {
    return (
      <EmptyState
        size="sm"
        title="Nenhuma sala pública"
        description="Todas as salas públicas aparecerão aqui"
      />
    )
  }

  return (
    <div className="space-y-0.5">
      {filtered.map((room) => (
        <RoomItem key={room.id} room={room} showJoinHint selectedRoomId={selectedRoomId} />
      ))}
    </div>
  )
}

// ============ ROOM ITEM ============

const RoomItem = memo(function RoomItem({
  room,
  showJoinHint,
  selectedRoomId,
}: {
  room: Room
  showJoinHint?: boolean
  selectedRoomId?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)
  const unreadCount = useNotificationStore((s) => s.unreadCounts[room.id] ?? 0)
  const clearUnread = useNotificationStore((s) => s.clearUnread)
  const isSelected = selectedRoomId === room.id
  const isOwner = room.ownerId === userId

  function handleSelect() {
    if (showJoinHint) {
      // Discover tab: join as member before navigating, then refresh sidebar
      roomService.joinRoom(room.id).catch(() => {})
      void queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() })
    }
    navigate(`/chat/${room.id}`)
    if (unreadCount > 0) {
      clearUnread(room.id)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? 'bg-primary-500/10 text-primary-500'
          : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
      }`}
    >
      <div className="relative">
        <Avatar fallback={room.name.slice(0, 2).toUpperCase()} size="sm" />
        {unreadCount > 0 && !isSelected && (
          <span className="bg-error-base absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {room.isPrivate ? (
            <Lock className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
          ) : (
            <Hash className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
          )}
          <span
            className={`truncate text-sm ${unreadCount > 0 && !isSelected ? 'font-semibold' : 'font-medium'}`}
          >
            {room.name}
          </span>
          {isOwner && (
            <Badge variant="primary" size="sm">
              dono
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-[var(--text-muted)]">
          {showJoinHint
            ? `${room._count?.members ?? 0} membros`
            : (room.description ?? `${room._count?.members ?? 0} membros`)}
        </p>
      </div>
      {room._count?.messages !== undefined && room._count.messages > 0 && !showJoinHint && (
        <span className="text-xs text-[var(--text-muted)]">{room._count.messages}</span>
      )}
    </button>
  )
})

// ============ HELPERS ============

function filterRooms(rooms: Room[] | undefined, search: string): Room[] {
  if (!rooms) return []
  if (!search) return rooms
  const lower = search.toLowerCase()
  return rooms.filter(
    (r) => r.name.toLowerCase().includes(lower) || r.description?.toLowerCase().includes(lower)
  )
}
