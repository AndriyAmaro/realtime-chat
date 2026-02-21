import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatInput, ChatMessage, TypingIndicator } from '@core/patterns/ChatUI/ChatUI'
import { Spinner } from '@core/primitives/Spinner'
import { Button } from '@core/primitives/Button'
import { Modal } from '@core/organisms/Modal'
import { useAuthStore } from '@store/auth.store'
import { useSocket } from '@hooks/useSocket'
import { useMessages } from '@hooks/useMessages'
import { useTyping } from '@hooks/useTyping'
import { useReadReceipts } from '@hooks/useReadReceipts'
import { uploadFile } from '@services/upload.service'
import { MessageActionMenu } from './MessageActionMenu'
import { ReplyBar } from './ReplyBar'
import { ReactionPicker } from './ReactionPicker'
import { InputEmojiPicker } from './InputEmojiPicker'
import { RefreshCw, WifiOff } from 'lucide-react'
import type { MessagePayload } from '@/types/socket'
import type {
  ChatMessageData,
  ChatReactionData,
  ChatUser,
  MessageStatus,
} from '@core/patterns/ChatUI/ChatUI'

interface ChatAreaProps {
  roomId: string
  highlightedMessageId?: string | null
}

export function ChatArea({ roomId, highlightedMessageId }: ChatAreaProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const { socket, isConnected, connectError, isReconnecting, reconnectAttempt, reconnectMax } =
    useSocket()
  const {
    messages,
    pendingMessages,
    hasMore,
    isLoadingHistory,
    isRateLimited,
    sendMessage,
    sendFileMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    loadMore,
    retryMessage,
    discardMessage,
  } = useMessages({ socket, roomId, isConnected })
  const { typingUsers, startTyping, stopTyping } = useTyping({ socket, roomId, isConnected })
  const { isReadByOthers } = useReadReceipts({
    socket,
    roomId,
    isConnected,
    userId,
    messageCount: messages.length,
  })

  const [isUploading, setIsUploading] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<MessagePayload | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(0)
  const editInputRef = useRef<HTMLTextAreaElement>(null)

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

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.setSelectionRange(
        editInputRef.current.value.length,
        editInputRef.current.value.length
      )
    }
  }, [editingMessageId])

  // Clear interaction state when room changes
  useEffect(() => {
    setEditingMessageId(null)
    setEditingContent('')
    setReplyingTo(null)
    setDeletingMessageId(null)
    setReactionPickerMessageId(null)
  }, [roomId])

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
    const replyToId = replyingTo?.id

    // Upload files first, then send messages
    if (attachments && attachments.length > 0) {
      setIsUploading(true)
      try {
        for (const file of attachments) {
          const result = await uploadFile(file)
          const type = result.isImage ? 'IMAGE' : 'FILE'
          const content = value.trim() || result.originalName
          sendFileMessage(content, result.url, type, replyToId)
        }
      } catch (err) {
        console.error('[upload] Failed to upload file:', err)
      } finally {
        setIsUploading(false)
      }
    } else if (value.trim()) {
      sendMessage(value, replyToId)
    }

    setReplyingTo(null)

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  function handleInputChange(val: string) {
    setInputValue(val)
    startTyping()
  }

  function handleEmojiSelect(emoji: string) {
    setInputValue((prev) => prev + emoji)
  }

  // ============ ACTION HANDLERS ============

  const handleMessageAction = useCallback(
    (action: string, chatMsg: ChatMessageData) => {
      const msg = messages.find((m) => m.id === chatMsg.id)
      if (!msg) return

      switch (action) {
        case 'edit':
          setEditingMessageId(msg.id)
          setEditingContent(msg.content)
          break
        case 'delete':
          setDeletingMessageId(msg.id)
          break
        case 'reply':
          setReplyingTo(msg)
          break
        case 'react':
          // If chatMsg.content is an emoji from quick reactions, toggle it directly
          if (
            chatMsg.content &&
            /^\p{Emoji}/u.test(chatMsg.content) &&
            chatMsg.content.length <= 4
          ) {
            toggleReaction(msg.id, chatMsg.content)
          } else {
            setReactionPickerMessageId(msg.id)
          }
          break
      }
    },
    [messages, toggleReaction]
  )

  function handleEditSave() {
    if (!editingMessageId || !editingContent.trim()) return
    editMessage(editingMessageId, editingContent)
    setEditingMessageId(null)
    setEditingContent('')
  }

  function handleEditCancel() {
    setEditingMessageId(null)
    setEditingContent('')
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEditSave()
    }
    if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  function handleDeleteConfirm() {
    if (!deletingMessageId) return
    deleteMessage(deletingMessageId)
    setDeletingMessageId(null)
  }

  function handleReactionSelect(emoji: string) {
    if (!reactionPickerMessageId) return
    toggleReaction(reactionPickerMessageId, emoji)
    setReactionPickerMessageId(null)
  }

  function handleReactionClick(messageId: string, emoji: string) {
    toggleReaction(messageId, emoji)
  }

  function handleReplyClick(messageId: string) {
    const el = document.getElementById(`msg-${messageId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('animate-pulse', 'bg-[var(--warning-base)]/10')
      setTimeout(() => {
        el.classList.remove('animate-pulse', 'bg-[var(--warning-base)]/10')
      }, 1500)
    }
  }

  // ============ RENDERING ============

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
        <div className="flex animate-pulse items-center justify-center gap-2 bg-[var(--warning-base)]/10 px-4 py-2 text-sm text-[var(--warning-base)]">
          {isReconnecting ? (
            <>
              <Spinner size="xs" />
              Reconectando (tentativa {reconnectAttempt}/{reconnectMax})...
            </>
          ) : connectError ? (
            <>
              <WifiOff size={16} />
              Sem conexão — {connectError}
            </>
          ) : (
            <>
              <Spinner size="xs" />
              Conectando...
            </>
          )}
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

        {messages.length === 0 && pendingMessages.length === 0 && !isLoadingHistory && (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-[var(--text-muted)]">
              Nenhuma mensagem ainda. Seja o primeiro a enviar!
            </p>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isEditing = editingMessageId === msg.id
          const showReactionPicker = reactionPickerMessageId === msg.id

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={
                highlightedMessageId === msg.id
                  ? 'rounded-lg bg-[var(--warning-base)]/10 transition-colors duration-500'
                  : 'transition-colors duration-300'
              }
            >
              {isEditing ? (
                // Inline edit mode
                <div className="flex flex-col gap-2 rounded-lg bg-[var(--bg-muted)] p-3">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Editando mensagem
                  </span>
                  <textarea
                    ref={editInputRef}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="min-h-[60px] w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleEditCancel}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleEditSave} disabled={!editingContent.trim()}>
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <ChatMessage
                    message={msg}
                    showAvatar
                    showTimestamp
                    showStatus
                    onReactionClick={handleReactionClick}
                    onReplyClick={handleReplyClick}
                    actionMenuSlot={
                      !msg.isDeleted ? (
                        <MessageActionMenu
                          message={msg}
                          isOwnMessage={msg.position === 'sent'}
                          onAction={handleMessageAction}
                        />
                      ) : undefined
                    }
                  />

                  {/* Floating Reaction Picker */}
                  {showReactionPicker && (
                    <div className="absolute bottom-full left-0 z-10 mb-2">
                      <ReactionPicker
                        onSelect={handleReactionSelect}
                        onClose={() => setReactionPickerMessageId(null)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Pending / Failed messages from offline queue */}
        {pendingMessages.map((pm) => (
          <div key={pm.clientId} className={pm.status === 'failed' ? 'opacity-70' : 'opacity-50'}>
            <ChatMessage
              message={{
                id: pm.clientId,
                content: pm.payload.content,
                timestamp: pm.createdAt,
                position: 'sent',
                status: pm.status,
                user: {
                  id: pm.userId,
                  name: pm.userName,
                },
              }}
              showAvatar
              showTimestamp
              showStatus
            />
            {pm.status === 'failed' && (
              <div className="mt-1 flex justify-end gap-2 pr-10">
                <button
                  type="button"
                  onClick={() => retryMessage(pm.clientId)}
                  className="flex items-center gap-1 text-xs text-[var(--primary-500)] hover:underline"
                >
                  <RefreshCw size={12} />
                  Reenviar
                </button>
                <button
                  type="button"
                  onClick={() => discardMessage(pm.clientId)}
                  className="text-xs text-[var(--text-muted)] hover:underline"
                >
                  Descartar
                </button>
              </div>
            )}
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

      {/* Rate limit warning */}
      {isRateLimited && (
        <div className="px-4 py-1.5 text-center text-xs text-[var(--warning-base)]">
          Aguarde antes de enviar novamente
        </div>
      )}

      {/* Typing indicator */}
      <TypingIndicator users={typingChatUsers} />

      {/* Reply bar */}
      {replyingTo && <ReplyBar replyingTo={replyingTo} onCancel={() => setReplyingTo(null)} />}

      {/* Input */}
      <ChatInput
        value={inputValue}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        placeholder="Digite uma mensagem..."
        disabled={isUploading || isRateLimited}
        showEmoji
        showAttach
        emojiPickerSlot={
          <InputEmojiPicker onSelect={handleEmojiSelect} disabled={isUploading || isRateLimited} />
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingMessageId}
        onOpenChange={(open) => !open && setDeletingMessageId(null)}
      >
        <Modal.Content size="sm">
          <Modal.Header>
            <Modal.Title>Excluir mensagem</Modal.Title>
            <Modal.Description>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </Modal.Description>
          </Modal.Header>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setDeletingMessageId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
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
  const isDeleted = !!msg.deletedAt

  const attachments =
    !isDeleted && msg.fileUrl && msg.type !== 'TEXT'
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

  const reactions: ChatReactionData[] | undefined =
    msg.reactions && msg.reactions.length > 0
      ? msg.reactions.map((r) => ({
          emoji: r.emoji,
          count: r.count,
          isReactedByMe: currentUserId ? r.userIds.includes(currentUserId) : false,
        }))
      : undefined

  const replyTo = msg.replyTo
    ? {
        id: msg.replyTo.id,
        content: msg.replyTo.content,
        userName: msg.replyTo.user.name,
      }
    : undefined

  return {
    id: msg.id,
    content: msg.type === 'TEXT' || isDeleted ? msg.content : '',
    timestamp: msg.createdAt,
    position: isSent ? 'sent' : 'received',
    status,
    user: {
      id: msg.user.id,
      name: msg.user.name,
      avatar: msg.user.avatar ?? undefined,
    },
    attachments,
    editedAt: msg.editedAt ?? undefined,
    isDeleted,
    replyTo,
    reactions,
  }
}
