import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/cn'
import { Avatar } from '@core/primitives/Avatar'
import {
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  File,
  X,
  MoreVertical,
  Download,
} from 'lucide-react'

// ============================================================================
// CVA Variants
// ============================================================================

const chatContainerVariants = cva(
  'flex flex-col rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)]',
  {
    variants: {
      size: {
        sm: 'h-[400px]',
        md: 'h-[500px]',
        lg: 'h-[600px]',
        full: 'h-full',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const chatMessageVariants = cva('flex gap-3', {
  variants: {
    position: {
      sent: 'flex-row-reverse',
      received: 'flex-row',
    },
  },
  defaultVariants: {
    position: 'received',
  },
})

const messageBubbleVariants = cva('rounded-2xl px-4 py-2.5 transition-colors', {
  variants: {
    position: {
      sent: 'rounded-br-md bg-[var(--primary-500)] text-white',
      received: 'rounded-bl-md bg-[var(--bg-muted)] text-[var(--text-primary)]',
    },
  },
  defaultVariants: {
    position: 'received',
  },
})

const chatInputVariants = cva(
  'flex items-end gap-2 border-t border-[var(--border-default)] bg-[var(--bg-base)] p-4',
  {
    variants: {
      variant: {
        default: '',
        minimal: 'border-0 pt-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const typingIndicatorVariants = cva(
  'flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)]',
  {
    variants: {
      variant: {
        default: '',
        animated: '',
      },
    },
    defaultVariants: {
      variant: 'animated',
    },
  }
)

// ============================================================================
// Types
// ============================================================================

export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'error'
  | 'pending'
  | 'failed'
export type MessagePosition = 'sent' | 'received'

export interface ChatAttachment {
  id: string
  name: string
  type: 'image' | 'file'
  url?: string
  size?: number
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  isOnline?: boolean
}

export interface ChatReactionData {
  emoji: string
  count: number
  isReactedByMe: boolean
}

export interface ChatReplyData {
  id: string
  content: string
  userName: string
}

export interface ChatMessageData {
  id: string
  content: string
  timestamp: Date | string
  position: MessagePosition
  status?: MessageStatus
  user?: ChatUser
  attachments?: ChatAttachment[]
  editedAt?: string
  isDeleted?: boolean
  replyTo?: ChatReplyData
  reactions?: ChatReactionData[]
}

export interface ChatContainerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatContainerVariants> {
  header?: React.ReactNode
}

export interface ChatMessageProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatMessageVariants> {
  message: ChatMessageData
  showAvatar?: boolean
  showTimestamp?: boolean
  showStatus?: boolean
  onMessageAction?: (action: string, message: ChatMessageData) => void
  onReactionClick?: (messageId: string, emoji: string) => void
  onReplyClick?: (messageId: string) => void
  actionMenuSlot?: React.ReactNode
}

export interface ChatInputProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onChange'>,
    VariantProps<typeof chatInputVariants> {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string, attachments?: File[]) => void
  placeholder?: string
  disabled?: boolean
  showEmoji?: boolean
  showAttach?: boolean
  maxLength?: number
  emojiPickerSlot?: React.ReactNode
}

export interface TypingIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof typingIndicatorVariants> {
  users: ChatUser[]
}

// ============================================================================
// Sub Components
// ============================================================================

// Typing Indicator
const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  ({ className, variant, users, ...props }, ref) => {
    if (users.length === 0) return null

    const firstUser = users[0]
    const secondUser = users[1]

    const names =
      users.length === 1
        ? (firstUser?.name ?? '')
        : users.length === 2
          ? `${firstUser?.name ?? ''} e ${secondUser?.name ?? ''}`
          : `${firstUser?.name ?? ''} e mais ${users.length - 1}`

    return (
      <div
        ref={ref}
        className={cn(typingIndicatorVariants({ variant }), className)}
        aria-live="polite"
        {...props}
      >
        <span className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--text-muted)]" />
        </span>
        <span>
          {names} {users.length === 1 ? 'está digitando...' : 'estão digitando...'}
        </span>
      </div>
    )
  }
)

TypingIndicator.displayName = 'TypingIndicator'

// Message Status Icon
const MessageStatusIcon: React.FC<{ status?: MessageStatus }> = ({ status }) => {
  switch (status) {
    case 'sending':
    case 'pending':
      return <Clock size={14} className="text-white/70" />
    case 'sent':
      return <Check size={14} className="text-white/70" />
    case 'delivered':
      return <CheckCheck size={14} className="text-white/70" />
    case 'read':
      return <CheckCheck size={14} className="text-[var(--primary-300)]" />
    case 'error':
    case 'failed':
      return <X size={14} className="text-error-light" />
    default:
      return null
  }
}

// Download helper — works cross-origin by fetching as blob
function handleDownload(url: string, filename: string, e: React.MouseEvent) {
  e.preventDefault()
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    })
    .catch(() => {
      // Fallback: open in new tab
      window.open(url, '_blank')
    })
}

// Chat Message Component
const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      className,
      message,
      position = message.position,
      showAvatar = true,
      showTimestamp = true,
      showStatus = true,
      onMessageAction,
      onReactionClick,
      onReplyClick,
      actionMenuSlot,
      ...props
    },
    ref
  ) => {
    const formattedTime = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    // Deleted message placeholder
    if (message.isDeleted) {
      return (
        <div ref={ref} className={cn(chatMessageVariants({ position }), className)} {...props}>
          {showAvatar && message.user && position === 'received' && (
            <Avatar
              src={message.user.avatar}
              fallback={message.user.name.charAt(0)}
              size="sm"
              alt={message.user.name}
              className="shrink-0"
            />
          )}
          <div
            className={cn(
              'flex max-w-[75%] flex-col gap-1',
              position === 'sent' ? 'items-end' : 'items-start'
            )}
          >
            {position === 'received' && message.user && (
              <span className="text-xs font-medium text-[var(--text-muted)]">
                {message.user.name}
              </span>
            )}
            <div
              className={cn(
                'rounded-2xl px-4 py-2.5',
                position === 'sent' ? 'rounded-br-md' : 'rounded-bl-md',
                'border border-dashed border-[var(--border-default)] bg-transparent'
              )}
            >
              <p className="text-sm text-[var(--text-muted)] italic">Mensagem excluída</p>
            </div>
            <time className="text-xs text-[var(--text-muted)]">{formattedTime}</time>
          </div>
          {showAvatar && position === 'sent' && <div className="w-8 shrink-0" />}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn(chatMessageVariants({ position }), className)} {...props}>
        {/* Avatar */}
        {showAvatar && message.user && position === 'received' && (
          <Avatar
            src={message.user.avatar}
            fallback={message.user.name.charAt(0)}
            size="sm"
            alt={message.user.name}
            className="shrink-0"
          />
        )}

        {/* Message Content */}
        <div
          className={cn(
            'flex max-w-[75%] flex-col gap-1',
            position === 'sent' ? 'items-end' : 'items-start'
          )}
        >
          {/* User Name for received messages */}
          {position === 'received' && message.user && (
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {message.user.name}
            </span>
          )}

          {/* Reply Quote */}
          {message.replyTo && (
            <button
              type="button"
              onClick={() => onReplyClick?.(message.replyTo!.id)}
              className={cn(
                'flex w-full flex-col rounded-lg border-l-2 px-3 py-1.5 text-left transition-colors',
                position === 'sent'
                  ? 'border-white/40 bg-white/10 hover:bg-white/15'
                  : 'border-[var(--primary-500)] bg-[var(--bg-muted)] hover:bg-[var(--bg-emphasis)]'
              )}
            >
              <span
                className={cn(
                  'text-xs font-semibold',
                  position === 'sent' ? 'text-white/80' : 'text-[var(--primary-500)]'
                )}
              >
                {message.replyTo.userName}
              </span>
              <span
                className={cn(
                  'truncate text-xs',
                  position === 'sent' ? 'text-white/60' : 'text-[var(--text-muted)]'
                )}
              >
                {message.replyTo.content.length > 80
                  ? `${message.replyTo.content.slice(0, 80)}…`
                  : message.replyTo.content}
              </span>
            </button>
          )}

          {/* Message Bubble */}
          <div className="group relative">
            <div className={cn(messageBubbleVariants({ position }))}>
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-2 space-y-2">
                  {message.attachments.map((attachment) =>
                    attachment.type === 'image' && attachment.url ? (
                      <div
                        key={attachment.id}
                        className="group/img relative inline-block overflow-hidden rounded-lg"
                      >
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-h-72 max-w-full rounded-lg object-contain"
                            loading="lazy"
                          />
                        </a>
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className={cn(
                            'absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-150',
                            'opacity-0 group-hover/img:opacity-100',
                            'bg-black/50 text-white hover:bg-black/70'
                          )}
                          aria-label={`Baixar ${attachment.name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(attachment.url!, attachment.name, e)
                          }}
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    ) : (
                      <div
                        key={attachment.id}
                        className={cn(
                          'flex items-center gap-2 rounded-lg p-2 transition-colors',
                          position === 'sent' ? 'bg-white/10' : 'bg-[var(--bg-emphasis)]'
                        )}
                      >
                        <File size={16} className="shrink-0" />
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 flex-1 truncate text-sm underline hover:opacity-80"
                        >
                          {attachment.name}
                        </a>
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
                            position === 'sent' ? 'hover:bg-white/10' : 'hover:bg-[var(--bg-muted)]'
                          )}
                          aria-label={`Baixar ${attachment.name}`}
                          onClick={(e) => {
                            handleDownload(attachment.url!, attachment.name, e)
                          }}
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Text Content */}
              <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
            </div>

            {/* Actions Menu (slot or default) */}
            {actionMenuSlot ? (
              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 transition-opacity md:opacity-0 md:group-hover:opacity-100',
                  position === 'sent' ? '-left-8' : '-right-8'
                )}
              >
                {actionMenuSlot}
              </div>
            ) : (
              onMessageAction && (
                <button
                  onClick={() => onMessageAction('menu', message)}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 rounded p-1.5 transition-opacity md:opacity-0 md:group-hover:opacity-100',
                    position === 'sent' ? '-left-9' : '-right-9',
                    'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]'
                  )}
                  aria-label="Message actions"
                >
                  <MoreVertical size={16} />
                </button>
              )
            )}
          </div>

          {/* Reaction Chips */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {message.reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  type="button"
                  onClick={() => onReactionClick?.(message.id, reaction.emoji)}
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                    reaction.isReactedByMe
                      ? 'border-[var(--primary-500)]/40 bg-[var(--primary-500)]/10 text-[var(--primary-500)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-emphasis)]'
                  )}
                  aria-label={`${reaction.emoji} ${reaction.count}`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Timestamp, Edited label, and Status */}
          <div className="flex items-center gap-1.5">
            {showTimestamp && (
              <time
                dateTime={new Date(message.timestamp).toISOString()}
                className="text-xs text-[var(--text-muted)]"
              >
                {formattedTime}
              </time>
            )}
            {message.editedAt && (
              <span className="text-xs text-[var(--text-muted)] italic">(editado)</span>
            )}
            {showStatus && position === 'sent' && <MessageStatusIcon status={message.status} />}
          </div>
        </div>

        {/* Avatar placeholder for sent messages alignment */}
        {showAvatar && position === 'sent' && <div className="w-8 shrink-0" />}
      </div>
    )
  }
)

ChatMessage.displayName = 'ChatMessage'

// Chat Input Component
const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      className,
      variant,
      value = '',
      onChange,
      onSubmit,
      placeholder = 'Type a message...',
      disabled = false,
      showEmoji = true,
      showAttach = true,
      maxLength,
      emojiPickerSlot,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(value)
    const [attachments, setAttachments] = React.useState<File[]>([])
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setInputValue(value)
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (maxLength && newValue.length > maxLength) return
      setInputValue(newValue)
      onChange?.(newValue)

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
      }
    }

    const handleSubmit = () => {
      if (!inputValue.trim() && attachments.length === 0) return
      onSubmit?.(inputValue, attachments.length > 0 ? attachments : undefined)
      setInputValue('')
      setAttachments([])
      onChange?.('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      setAttachments((prev) => [...prev, ...files])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const removeAttachment = (index: number) => {
      setAttachments((prev) => prev.filter((_, i) => i !== index))
    }

    return (
      <div ref={ref} className={cn(chatInputVariants({ variant }), className)} {...props}>
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="absolute right-0 bottom-full left-0 flex flex-wrap gap-2 border-t border-[var(--border-default)] bg-[var(--bg-base)] p-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg bg-[var(--bg-muted)] px-3 py-1.5"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon size={14} className="text-[var(--text-muted)]" />
                ) : (
                  <File size={14} className="text-[var(--text-muted)]" />
                )}
                <span className="max-w-[120px] truncate text-sm text-[var(--text-secondary)]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="hover:text-error text-[var(--text-muted)]"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Emoji Button / Slot */}
        {showEmoji &&
          (emojiPickerSlot || (
            <button
              type="button"
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]"
              disabled={disabled}
              aria-label="Add emoji"
            >
              <Smile size={20} />
            </button>
          ))}

        {/* Attach Button */}
        {showAttach && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]"
              disabled={disabled}
              aria-label="Attach file"
            >
              <Paperclip size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              aria-hidden="true"
            />
          </>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Message input"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || (!inputValue.trim() && attachments.length === 0)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-500)] text-white transition-colors hover:bg-[var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'

// Chat Messages List Component
interface ChatMessagesListProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: ChatMessageData[]
  showAvatar?: boolean
  showTimestamp?: boolean
  showStatus?: boolean
  onMessageAction?: (action: string, message: ChatMessageData) => void
  onReactionClick?: (messageId: string, emoji: string) => void
  onReplyClick?: (messageId: string) => void
  renderActionMenu?: (message: ChatMessageData) => React.ReactNode
}

const ChatMessagesList = React.forwardRef<HTMLDivElement, ChatMessagesListProps>(
  (
    {
      className,
      messages,
      showAvatar = true,
      showTimestamp = true,
      showStatus = true,
      onMessageAction,
      onReactionClick,
      onReplyClick,
      renderActionMenu,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new messages
    React.useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    }, [messages])

    return (
      <div ref={ref} className={cn('flex-1 space-y-4 overflow-y-auto p-4', className)} {...props}>
        <div ref={containerRef} className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              showAvatar={showAvatar}
              showTimestamp={showTimestamp}
              showStatus={showStatus}
              onMessageAction={onMessageAction}
              onReactionClick={onReactionClick}
              onReplyClick={onReplyClick}
              actionMenuSlot={renderActionMenu?.(message)}
            />
          ))}
        </div>
      </div>
    )
  }
)

ChatMessagesList.displayName = 'ChatMessagesList'

// Chat Header Component
interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: ChatUser
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

const ChatHeader = React.forwardRef<HTMLDivElement, ChatHeaderProps>(
  ({ className, user, title, subtitle, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {user && (
            <div className="relative">
              <Avatar src={user.avatar} fallback={user.name.charAt(0)} size="md" alt={user.name} />
              {user.isOnline && (
                <span className="bg-success absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[var(--bg-base)]" />
              )}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">{title || user?.name}</h3>
            {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
            {!subtitle && user?.isOnline && <p className="text-success text-sm">Online</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )
  }
)

ChatHeader.displayName = 'ChatHeader'

// Main Chat Container Component
const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ className, size, header, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chatContainerVariants({ size }), className)}
        role="region"
        aria-label="Chat"
        {...props}
      >
        {header}
        {children}
      </div>
    )
  }
)

ChatContainer.displayName = 'ChatContainer'

export {
  ChatContainer,
  ChatHeader,
  ChatMessagesList,
  ChatMessage,
  ChatInput,
  TypingIndicator,
  chatContainerVariants,
  chatMessageVariants,
  messageBubbleVariants,
  chatInputVariants,
  typingIndicatorVariants,
}

export type { ChatMessagesListProps }
