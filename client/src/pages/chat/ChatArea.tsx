import { useEffect, useRef } from 'react'
import { ChatInput, ChatMessage, TypingIndicator } from '@core/patterns/ChatUI/ChatUI'
import { Spinner } from '@core/primitives/Spinner'
import { useAuthStore } from '@store/auth.store'
import { useSocket } from '@hooks/useSocket'
import { useMessages } from '@hooks/useMessages'
import { useTyping } from '@hooks/useTyping'
import type { MessagePayload } from '@/types/socket'
import type { ChatMessageData, ChatUser } from '@core/patterns/ChatUI/ChatUI'

interface ChatAreaProps {
  roomId: string
}

export function ChatArea({ roomId }: ChatAreaProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const { socket, isConnected } = useSocket()
  const { messages, hasMore, isLoadingHistory, sendMessage, loadMore } = useMessages({
    socket,
    roomId,
    isConnected,
  })
  const { typingUsers, startTyping, stopTyping } = useTyping({ socket, roomId, isConnected })

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

  // Infinite scroll: load more when scrolling to top
  function handleScroll() {
    const container = scrollContainerRef.current
    if (!container || !hasMore || isLoadingHistory) return

    if (container.scrollTop < 50) {
      const prevScrollHeight = container.scrollHeight
      loadMore()

      // Preserve scroll position after loading older messages
      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight
        container.scrollTop = newScrollHeight - prevScrollHeight
      })
    }
  }

  function handleSubmit(value: string) {
    sendMessage(value)
    stopTyping()
    // Scroll to bottom after sending
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  function handleInputChange() {
    startTyping()
  }

  // Convert MessagePayload to ChatMessageData for design system components
  const chatMessages: ChatMessageData[] = messages.map((msg) => toChatMessage(msg, userId))

  // Convert typing users to ChatUser format
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
        {/* Load more indicator */}
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

        {/* Empty state */}
        {messages.length === 0 && !isLoadingHistory && (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-[var(--text-muted)]">
              Nenhuma mensagem ainda. Seja o primeiro a enviar!
            </p>
          </div>
        )}

        {/* Messages */}
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} showAvatar showTimestamp showStatus={false} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      <TypingIndicator users={typingChatUsers} />

      {/* Input */}
      <ChatInput
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        placeholder="Digite uma mensagem..."
        disabled={!isConnected}
        showEmoji={false}
        showAttach={false}
      />
    </div>
  )
}

// ============ HELPERS ============

function toChatMessage(msg: MessagePayload, currentUserId: string | undefined): ChatMessageData {
  return {
    id: msg.id,
    content: msg.content,
    timestamp: msg.createdAt,
    position: msg.userId === currentUserId ? 'sent' : 'received',
    status: 'sent',
    user: {
      id: msg.user.id,
      name: msg.user.name,
      avatar: msg.user.avatar ?? undefined,
    },
  }
}
