import { memo, useState } from 'react'
import { SearchBar } from '@core/patterns/SearchBar'
import { Spinner } from '@core/primitives/Spinner'
import { Avatar } from '@core/primitives/Avatar'
import { EmptyState } from '@core/patterns/EmptyState'
import { useMessageSearch } from '@hooks/useMessageSearch'
import { X } from 'lucide-react'
import { Button } from '@core/primitives/Button'
import type { MessagePayload } from '@/types/socket'

interface MessageSearchProps {
  roomId: string
  onClose: () => void
  onNavigate: (messageId: string) => void
}

export function MessageSearch({ roomId, onClose, onNavigate }: MessageSearchProps) {
  const [query, setQuery] = useState('')

  const { data, isLoading } = useMessageSearch({
    roomId,
    query,
    enabled: query.length >= 1,
  })

  const results = data?.messages ?? []
  const total = data?.total ?? 0

  return (
    <div className="flex h-full flex-col">
      {/* Search header */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] p-3">
        <SearchBar
          size="sm"
          variant="filled"
          placeholder="Buscar nas mensagens..."
          onSearch={setQuery}
          debounceMs={300}
          className="flex-1"
          autoFocus
        />
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar busca">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!query && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[var(--text-muted)]">Digite para buscar nas mensagens</p>
          </div>
        )}

        {query && isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}

        {query && !isLoading && results.length === 0 && (
          <EmptyState
            size="sm"
            title="Nenhum resultado"
            description={`Nenhuma mensagem encontrada para "${query}"`}
          />
        )}

        {query && !isLoading && results.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs text-[var(--text-muted)]">
              {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            </div>
            <div className="space-y-0.5 px-2 pb-2">
              {results.map((msg) => (
                <SearchResultItem
                  key={msg.id}
                  message={msg}
                  query={query}
                  onClick={() => onNavigate(msg.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============ SEARCH RESULT ITEM ============

const SearchResultItem = memo(function SearchResultItem({
  message,
  query,
  onClick,
}: {
  message: MessagePayload
  query: string
  onClick: () => void
}) {
  const time = new Date(message.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--bg-subtle)]"
    >
      <Avatar
        fallback={message.user.name.slice(0, 2).toUpperCase()}
        src={message.user.avatar ?? undefined}
        size="xs"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-[var(--text-primary)]">
            {message.user.name}
          </span>
          <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{time}</span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          <HighlightText text={message.content} query={query} />
        </p>
      </div>
    </button>
  )
})

// ============ TEXT HIGHLIGHT ============

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-warning-base/30 text-warning-dark dark:text-warning-base rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
