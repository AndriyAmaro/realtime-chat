import { useEffect, useRef, useState } from 'react'
import { ChatInput, ChatMessage, TypingIndicator } from '@core/patterns/ChatUI/ChatUI'
import { Spinner } from '@core/primitives/Spinner'
import { useAuthStore } from '@store/auth.store'
import { useSocket } from '@hooks/useSocket'
import { useMessages } from '@hooks/useMessages'
import { useTyping } from '@hooks/useTyping'
import { useReadReceipts } from '@hooks/useReadReceipts'
import { uploadFile } from '@services/upload.service'
import type { MessagePayload } from '@/types/socket'
import type { ChatMessageData, ChatUser, MessageStatus } from '@core/patterns/ChatUI/ChatUI'

interface ChatAreaProps {
  roomId: string
  highlightedMessageId?: string | null
}

export function ChatArea({ roomId, highlightedMessageId }: ChatAreaProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const { socket, isConnected } = useSocket()
  const { messages, hasMore, isLoadingHistory, sendMessage, sendFileMessage, loadMore } =
    useMessages({ socket, roomId, isConnected })
  const { typingUsers, startTyping, stopTyping } = useTyping({ socket, roomId, isConnected })
  const { isReadByOthers } = useReadReceipts({
    socket,
    roomId,
    isConnected,
    userId,
    messageCount: messages.length,
  })
  const [isUploading, setIsUploading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)

  // Auto-scroll to bottom on new messages (only if already near bottom)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const isNewMessage = messages.length > prevMessagesLengthRef.current
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150

    if (isNewMessage && isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages.length])

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && !isLoadingHistory) {
      messagesEndRef.current?.scrollIntoView()
    }
  }, [roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to highlighted message (from search)
  useEffect(() => {
    if (!highlightedMessageId) return
    const el = document.getElementById(`msg-${highlightedMessageId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedMessageId])

  // Infinite scroll: load more when scrolling to top
  function handleScroll() {
    const container = scrollContainerRef.current
    if (!container || !hasMore || isLoadingHistory) return

    if (container.scrollTop < 50) {
      const prevScrollHeight = container.scrollHeight
      loadMore()

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight
        container.scrollTop = newScrollHeight - prevScrollHeight
      })
    }
  }

  async function handleSubmit(value: string, attachments?: File[]) {
    stopTyping()

    // Upload files first, then send messages
    if (attachments && attachments.length > 0) {
      setIsUploading(true)
      try {
        for (const file of attachments) {
          const result = await uploadFile(file)
          const type = result.isImage ? 'IMAGE' : 'FILE'
          const content = value.trim() || result.originalName
          sendFileMessage(content, result.url, type)
        }
        // If there's also text without files, send it separately
        if (value.trim() && attachments.length > 0) {
          // Text was already included with the first file
        }
      } catch (err) {
        console.error('[upload] Failed to upload file:', err)
      } finally {
        setIsUploading(false)
      }
    } else if (value.trim()) {
      sendMessage(value)
    }

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  function handleInputChange() {
    startTyping()
  }

  const chatMessages: ChatMessageData[] = messages.map((msg) =>
    toChatMessage(msg, userId, isReadByOthers)
  )

  const typingChatUsers: ChatUser[] = typingUsers.map((u) => ({
    id: u.userId,
    name: u.userName,
  }))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Connection status banner */}
      {!isConnected && (
        <div className="flex items-center justify-center gap-2 bg-[var(--warning-base)]/10 px-4 py-2 text-sm text-[var(--warning-base)]">
          <Spinner size="xs" />
          Conectando...
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {isLoadingHistory && (
          <div className="flex justify-center py-2">
            <Spinner size="sm" />
          </div>
        )}

        {hasMore && !isLoadingHistory && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              className="text-primary-500 text-xs hover:underline"
            >
              Carregar mensagens anteriores
            </button>
          </div>
        )}

        {messages.length === 0 && !isLoadingHistory && (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-[var(--text-muted)]">
              Nenhuma mensagem ainda. Seja o primeiro a enviar!
            </p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            id={`msg-${msg.id}`}
            className={
              highlightedMessageId === msg.id
                ? 'animate-pulse rounded-lg bg-[var(--warning-base)]/10 transition-colors duration-500'
                : ''
            }
          >
            <ChatMessage message={msg} showAvatar showTimestamp showStatus />
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Upload indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 border-t border-[var(--border-default)] px-4 py-2 text-sm text-[var(--text-muted)]">
          <Spinner size="xs" />
          Enviando arquivo...
        </div>
      )}

      {/* Typing indicator */}
      <TypingIndicator users={typingChatUsers} />

      {/* Input */}
      <ChatInput
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        placeholder="Digite uma mensagem..."
        disabled={!isConnected || isUploading}
        showEmoji={false}
        showAttach
      />
    </div>
  )
}

// ============ HELPERS ============

function toChatMessage(
  msg: MessagePayload,
  currentUserId: string | undefined,
  isReadByOthers: (createdAt: string) => boolean
): ChatMessageData {
  const isSent = msg.userId === currentUserId
  const attachments =
    msg.fileUrl && msg.type !== 'TEXT'
      ? [
          {
            id: msg.id,
            name: msg.content,
            type: (msg.type === 'IMAGE' ? 'image' : 'file') as 'image' | 'file',
            url: msg.fileUrl,
          },
        ]
      : undefined

  let status: MessageStatus = 'sent'
  if (isSent && isReadByOthers(msg.createdAt)) {
    status = 'read'
  }

  return {
    id: msg.id,
    content: msg.type === 'TEXT' ? msg.content : '',
    timestamp: msg.createdAt,
    position: isSent ? 'sent' : 'received',
    status,
    user: {
      id: msg.user.id,
      name: msg.user.name,
      avatar: msg.user.avatar ?? undefined,
    },
    attachments,
  }
}
