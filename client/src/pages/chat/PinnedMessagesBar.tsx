import { useState } from 'react'
import { Pin, ChevronDown, ChevronUp, X } from 'lucide-react'
import type { MessagePayload } from '@/types/socket'

interface PinnedMessagesBarProps {
  pinnedMessages: MessagePayload[]
  canManage: boolean
  onNavigate: (messageId: string) => void
  onUnpin: (messageId: string) => void
}

export function PinnedMessagesBar({
  pinnedMessages,
  canManage,
  onNavigate,
  onUnpin,
}: PinnedMessagesBarProps) {
  const [expanded, setExpanded] = useState(false)

  if (pinnedMessages.length === 0) return null

  return (
    <div className="border-b border-[var(--border-default)] bg-[var(--bg-subtle)]">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-[var(--bg-muted)]"
      >
        <Pin className="h-3.5 w-3.5 shrink-0 text-[var(--primary-500)]" />
        <span className="flex-1 text-xs font-medium text-[var(--text-secondary)]">
          {pinnedMessages.length === 1
            ? '1 mensagem fixada'
            : `${pinnedMessages.length} mensagens fixadas`}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        )}
      </button>

      {/* Expanded list */}
      {expanded && (
        <div className="max-h-48 space-y-0.5 overflow-y-auto px-2 pb-2">
          {pinnedMessages.map((msg) => (
            <div
              key={msg.id}
              className="group/pin flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--bg-muted)]"
            >
              <button
                type="button"
                onClick={() => onNavigate(msg.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                  {msg.user.name}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {msg.content || '(arquivo)'}
                </p>
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onUnpin(msg.id)}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--text-muted)] opacity-0 transition-all group-hover/pin:opacity-100 hover:bg-[var(--bg-emphasis)] hover:text-[var(--error-base)]"
                  aria-label="Desafixar"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
