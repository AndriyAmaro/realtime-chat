import { X, Reply } from 'lucide-react'
import type { MessagePayload } from '@/types/socket'

interface ReplyBarProps {
  replyingTo: MessagePayload
  onCancel: () => void
}

export function ReplyBar({ replyingTo, onCancel }: ReplyBarProps) {
  return (
    <div className="flex items-center gap-3 border-t border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-2">
      <Reply size={16} className="shrink-0 text-[var(--primary-500)]" />

      <div className="min-w-0 flex-1 border-l-2 border-[var(--primary-500)] pl-3">
        <p className="truncate text-xs font-semibold text-[var(--primary-500)]">
          {replyingTo.user.name}
        </p>
        <p className="truncate text-xs text-[var(--text-muted)]">
          {replyingTo.deletedAt
            ? 'Mensagem excluída'
            : replyingTo.type !== 'TEXT'
              ? replyingTo.type === 'IMAGE'
                ? '📷 Imagem'
                : '📎 Arquivo'
              : replyingTo.content}
        </p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-emphasis)] hover:text-[var(--text-secondary)]"
        aria-label="Cancelar resposta"
      >
        <X size={16} />
      </button>
    </div>
  )
}
