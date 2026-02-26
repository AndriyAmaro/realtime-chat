import { DropdownMenu } from '@core/organisms/DropdownMenu'
import { MoreVertical, Pencil, Trash2, Reply, Smile, Pin, PinOff } from 'lucide-react'
import { cn } from '@shared/utils/cn'
import type { ChatMessageData } from '@core/patterns/ChatUI/ChatUI'

type MessageAction = 'edit' | 'delete' | 'reply' | 'react' | 'pin' | 'unpin'

interface MessageActionMenuProps {
  message: ChatMessageData
  isOwnMessage: boolean
  canManage?: boolean
  isPinned?: boolean
  onAction: (action: MessageAction, message: ChatMessageData) => void
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

export function MessageActionMenu({
  message,
  isOwnMessage,
  canManage,
  isPinned,
  onAction,
}: MessageActionMenuProps) {
  const isTextMessage =
    !message.attachments || message.attachments.length === 0 || message.content.trim() !== ''

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'rounded p-1',
            'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]'
          )}
          aria-label="Ações da mensagem"
        >
          <MoreVertical size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align={message.position === 'sent' ? 'end' : 'start'} sideOffset={4}>
        {/* Quick Reactions */}
        <div className="flex items-center gap-0.5 px-1 py-1">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onAction('react', { ...message, content: emoji })}
              className="rounded p-1.5 text-base transition-transform hover:scale-125 hover:bg-[var(--bg-muted)]"
              aria-label={`Reagir com ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <DropdownMenu.Separator />

        {/* Reply — available for all messages */}
        <DropdownMenu.Item onClick={() => onAction('reply', message)}>
          <Reply size={16} className="mr-2" />
          Responder
        </DropdownMenu.Item>

        {/* React — emoji submenu hint */}
        <DropdownMenu.Item onClick={() => onAction('react', message)}>
          <Smile size={16} className="mr-2" />
          Reagir
        </DropdownMenu.Item>

        {/* Pin/Unpin — admin/owner only */}
        {canManage &&
          (isPinned ? (
            <DropdownMenu.Item onClick={() => onAction('unpin', message)}>
              <PinOff size={16} className="mr-2" />
              Desafixar
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item onClick={() => onAction('pin', message)}>
              <Pin size={16} className="mr-2" />
              Fixar mensagem
            </DropdownMenu.Item>
          ))}

        {/* Edit — own TEXT messages only */}
        {isOwnMessage && isTextMessage && (
          <DropdownMenu.Item onClick={() => onAction('edit', message)}>
            <Pencil size={16} className="mr-2" />
            Editar
          </DropdownMenu.Item>
        )}

        {/* Delete — own messages */}
        {isOwnMessage && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item destructive onClick={() => onAction('delete', message)}>
              <Trash2 size={16} className="mr-2" />
              Excluir
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
