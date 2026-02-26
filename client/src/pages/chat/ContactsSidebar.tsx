import { useState } from 'react'
import { SearchBar } from '@core/patterns/SearchBar'
import { Avatar } from '@core/primitives/Avatar'
import { Button } from '@core/primitives/Button'
import { Spinner } from '@core/primitives/Spinner'
import { EmptyState } from '@core/patterns/EmptyState'
import {
  useFriends,
  usePendingReceived,
  useUserSearch,
  useSendFriendRequest,
  useRespondToRequest,
} from '@hooks/useFriends'
import { useAuthStore } from '@store/auth.store'
import { UserPlus, Check, X, ChevronDown, ChevronRight, Circle } from 'lucide-react'
import type { Friendship, SearchUser } from '@/types/friendship'

// ============ TYPES ============

interface ContactsSidebarProps {
  onUserClick: (userId: string) => void
}

// ============ MAIN COMPONENT ============

export function ContactsSidebar({ onUserClick }: ContactsSidebarProps) {
  const [search, setSearch] = useState('')

  const currentUserId = useAuthStore((s) => s.user?.id)
  const { data: friends } = useFriends()
  const { data: pendingReceived } = usePendingReceived()
  const { data: searchResults, isLoading: isSearching } = useUserSearch(search)
  const sendRequest = useSendFriendRequest()
  const respondToRequest = useRespondToRequest()

  const [pendingOpen, setPendingOpen] = useState(true)

  // Derive friend user objects
  const friendUsers = (friends ?? []).map((f) =>
    f.senderId === currentUserId ? f.receiver : f.sender
  )

  const onlineFriends = friendUsers.filter((u) => u.status === 'ONLINE')
  const offlineFriends = friendUsers.filter((u) => u.status === 'OFFLINE' || u.status === 'AWAY')

  // Filter out users who are already friends or have pending requests from search results
  const friendIds = new Set(friendUsers.map((u) => u.id))
  const pendingIds = new Set((pendingReceived ?? []).flatMap((f) => [f.senderId, f.receiverId]))
  const filteredSearch = (searchResults ?? []).filter(
    (u) => u.id !== currentUserId && !friendIds.has(u.id) && !pendingIds.has(u.id)
  )

  const hasFriends = friendUsers.length > 0
  const hasPending = (pendingReceived ?? []).length > 0
  const isSearchActive = search.length >= 2

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="px-3 pt-3">
        <SearchBar
          size="sm"
          variant="filled"
          placeholder="Buscar usuários..."
          onSearch={setSearch}
          debounceMs={300}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Search results */}
        {isSearchActive && (
          <SearchResults
            results={filteredSearch}
            isLoading={isSearching}
            onAdd={(userId) => sendRequest.mutate(userId)}
            onUserClick={onUserClick}
            pendingMutationId={sendRequest.variables}
            isSending={sendRequest.isPending}
          />
        )}

        {/* Pending received requests */}
        {!isSearchActive && hasPending && (
          <PendingSection
            requests={pendingReceived!}
            isOpen={pendingOpen}
            onToggle={() => setPendingOpen((v) => !v)}
            onAccept={(friendshipId) => respondToRequest.mutate({ friendshipId, action: 'accept' })}
            onDecline={(friendshipId) =>
              respondToRequest.mutate({ friendshipId, action: 'decline' })
            }
          />
        )}

        {/* Online friends */}
        {!isSearchActive && onlineFriends.length > 0 && (
          <FriendsSection
            label={`Online \u2014 ${onlineFriends.length}`}
            friends={onlineFriends}
            status="online"
            onUserClick={onUserClick}
          />
        )}

        {/* Offline friends */}
        {!isSearchActive && offlineFriends.length > 0 && (
          <FriendsSection
            label={`Offline \u2014 ${offlineFriends.length}`}
            friends={offlineFriends}
            status="offline"
            onUserClick={onUserClick}
          />
        )}

        {/* Empty state */}
        {!isSearchActive && !hasFriends && !hasPending && (
          <EmptyState
            size="sm"
            icon={<UserPlus className="h-5 w-5" />}
            title="Nenhum contato"
            description="Adicione amigos para vê-los aqui"
          />
        )}
      </div>
    </div>
  )
}

// ============ SEARCH RESULTS ============

function SearchResults({
  results,
  isLoading,
  onAdd,
  onUserClick,
  pendingMutationId,
  isSending,
}: {
  results: SearchUser[]
  isLoading: boolean
  onAdd: (userId: string) => void
  onUserClick: (userId: string) => void
  pendingMutationId: string | undefined
  isSending: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <EmptyState
        size="sm"
        title="Nenhum usuário encontrado"
        description="Tente outro termo de busca"
      />
    )
  }

  return (
    <div className="space-y-0.5">
      <SectionHeader label="Resultados da busca" />
      {results.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-subtle)]"
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
            onClick={() => onUserClick(user.id)}
          >
            <Avatar size="xs" src={user.avatar ?? undefined} initials={user.name} alt={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)] hover:underline">
                {user.name}
              </p>
              {user.bio && <p className="truncate text-xs text-[var(--text-muted)]">{user.bio}</p>}
            </div>
          </button>
          <Button
            variant="primary"
            size="xs"
            onClick={() => onAdd(user.id)}
            loading={isSending && pendingMutationId === user.id}
            disabled={isSending}
          >
            <UserPlus className="mr-1 h-3 w-3" />
            Adicionar
          </Button>
        </div>
      ))}
    </div>
  )
}

// ============ PENDING SECTION ============

function PendingSection({
  requests,
  isOpen,
  onToggle,
  onAccept,
  onDecline,
}: {
  requests: Friendship[]
  isOpen: boolean
  onToggle: () => void
  onAccept: (friendshipId: string) => void
  onDecline: (friendshipId: string) => void
}) {
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase transition-colors hover:text-[var(--text-primary)]"
      >
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Pedidos pendentes ({requests.length})
      </button>

      {isOpen && (
        <div className="space-y-0.5">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-subtle)]"
            >
              <Avatar
                size="xs"
                src={request.sender.avatar ?? undefined}
                initials={request.sender.name}
                alt={request.sender.name}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {request.sender.name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="primary"
                  size="icon-xs"
                  onClick={() => onAccept(request.id)}
                  aria-label="Aceitar pedido"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDecline(request.id)}
                  aria-label="Recusar pedido"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ FRIENDS SECTION ============

function FriendsSection({
  label,
  friends,
  status,
  onUserClick,
}: {
  label: string
  friends: { id: string; name: string; avatar: string | null; bio: string | null }[]
  status: 'online' | 'offline'
  onUserClick: (userId: string) => void
}) {
  return (
    <div className="mb-2">
      <SectionHeader label={label} />
      <div className="space-y-0.5">
        {friends.map((friend) => (
          <button
            key={friend.id}
            type="button"
            onClick={() => onUserClick(friend.id)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--bg-subtle)]"
          >
            <Avatar
              size="xs"
              src={friend.avatar ?? undefined}
              initials={friend.name}
              alt={friend.name}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
              {friend.name}
            </span>
            <Circle
              className={`h-2.5 w-2.5 shrink-0 ${
                status === 'online'
                  ? 'fill-[var(--success-base)] text-[var(--success-base)]'
                  : 'fill-neutral-400 text-neutral-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// ============ HELPERS ============

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="px-3 py-2 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
      {label}
    </h3>
  )
}
