import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useAuthStore } from '@store/auth.store'
import { offlineQueue, type PendingMessage } from '@services/offlineQueue'
import type { TypedSocket } from '@services/socket'
import type { MessagePayload, MessageType, ReactionGroup, SendMessagePayload } from '@/types/socket'

interface UseMessagesOptions {
  socket: TypedSocket | null
  roomId: string
  isConnected: boolean
}

interface UseMessagesReturn {
  messages: MessagePayload[]
  pendingMessages: PendingMessage[]
  hasMore: boolean
  isLoadingHistory: boolean
  isRateLimited: boolean
  sendMessage: (content: string, replyToId?: string) => void
  sendFileMessage: (content: string, fileUrl: string, type: MessageType, replyToId?: string) => void
  editMessage: (messageId: string, content: string) => void
  deleteMessage: (messageId: string) => void
  toggleReaction: (messageId: string, emoji: string) => void
  loadMore: () => void
  retryMessage: (clientId: string) => void
  discardMessage: (clientId: string) => void
}

const HISTORY_LIMIT = 50
const RATE_LIMIT_COOLDOWN = 3000

/**
 * Manages messages for a specific room via Socket.io.
 * Handles sending, receiving, editing, deleting, reactions, loading history,
 * offline queue, message sync on reconnect, and rate limit feedback.
 */
export function useMessages({
  socket,
  roomId,
  isConnected,
}: UseMessagesOptions): UseMessagesReturn {
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const joinedRoomRef = useRef<string | null>(null)
  const wasConnectedRef = useRef(isConnected)
  const userId = useAuthStore((s) => s.user?.id)
  const userName = useAuthStore((s) => s.user?.name) ?? 'Unknown'

  // Subscribe to offline queue changes via useSyncExternalStore.
  // getSnapshot() must return a stable reference (same object between calls)
  // to avoid infinite re-render loops. Filtering is done in useMemo.
  const allPendingMessages = useSyncExternalStore(
    (cb) => offlineQueue.subscribe(cb),
    () => offlineQueue.getSnapshot()
  )
  const pendingMessages = useMemo(
    () => allPendingMessages.filter((m) => m.payload.roomId === roomId),
    [allPendingMessages, roomId]
  )

  // Reset state when roomId changes (React pattern: adjust state during render)
  const [prevRoomId, setPrevRoomId] = useState(roomId)
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId)
    setMessages([])
    setHasMore(false)
    setIsLoadingHistory(true)
  }

  // Join room and load initial history
  useEffect(() => {
    if (!socket || !isConnected || !roomId) return

    // Leave previous room if any
    if (joinedRoomRef.current && joinedRoomRef.current !== roomId) {
      socket.emit('room:leave', joinedRoomRef.current)
    }

    // Join room with acknowledgment — retry up to 3 times on failure.
    // Includes a 5s timeout per attempt in case the server never responds.
    let retries = 0
    let cancelled = false
    const maxRetries = 3
    const JOIN_TIMEOUT = 5000

    function joinRoom() {
      if (cancelled) return

      let timedOut = false
      const timeout = setTimeout(() => {
        timedOut = true
        console.warn(`[socket] room:join timed out (attempt ${retries + 1})`)
        if (!cancelled && retries < maxRetries) {
          retries++
          joinRoom()
        }
      }, JOIN_TIMEOUT)

      socket!.emit('room:join', roomId, (response) => {
        if (timedOut || cancelled) return
        clearTimeout(timeout)

        if (response.success) {
          joinedRoomRef.current = roomId
          // Only request history after confirmed join
          socket!.emit('message:history', { roomId, limit: HISTORY_LIMIT })
        } else {
          console.error(`[socket] room:join failed (attempt ${retries + 1}):`, response.error)
          if (retries < maxRetries) {
            retries++
            setTimeout(joinRoom, 1000 * retries)
          }
        }
      })
    }

    joinRoom()

    // Listen for new messages
    function onNewMessage(message: MessagePayload) {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          // Dedup by id (e.g. from sync + realtime)
          if (prev.some((m) => m.id === message.id)) return prev
          return [...prev, message]
        })
      }
    }

    // Listen for history response
    function onHistory(data: { messages: MessagePayload[]; hasMore: boolean }) {
      setMessages((prev) => {
        if (prev.length > 0) {
          return [...data.messages, ...prev]
        }
        return data.messages
      })
      setHasMore(data.hasMore)
      setIsLoadingHistory(false)
    }

    // Listen for edited messages
    function onEdited(message: MessagePayload) {
      if (message.roomId === roomId) {
        setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)))
      }
    }

    // Listen for deleted messages
    function onDeleted(data: { roomId: string; messageId: string }) {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId
              ? {
                  ...m,
                  content: '',
                  deletedAt: new Date().toISOString(),
                  fileUrl: null,
                  reactions: [],
                }
              : m
          )
        )
      }
    }

    // Listen for reaction updates
    function onReactionUpdated(data: {
      roomId: string
      messageId: string
      reactions: ReactionGroup[]
    }) {
      if (data.roomId === roomId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
        )
      }
    }

    // Listen for rate limit error
    function onError(data: { message: string }) {
      if (data.message.includes('Muitas requisições')) {
        setIsRateLimited(true)
        setTimeout(() => setIsRateLimited(false), RATE_LIMIT_COOLDOWN)
      }
    }

    socket.on('message:new', onNewMessage)
    socket.on('message:history', onHistory)
    socket.on('message:edited', onEdited)
    socket.on('message:deleted', onDeleted)
    socket.on('message:reaction_updated', onReactionUpdated)
    socket.on('error', onError)

    return () => {
      cancelled = true
      socket.off('message:new', onNewMessage)
      socket.off('message:history', onHistory)
      socket.off('message:edited', onEdited)
      socket.off('message:deleted', onDeleted)
      socket.off('message:reaction_updated', onReactionUpdated)
      socket.off('error', onError)
    }
  }, [socket, isConnected, roomId])

  // Reconnection: sync missed messages + flush offline queue
  useEffect(() => {
    if (!socket || !roomId) return

    const wasDisconnected = !wasConnectedRef.current
    wasConnectedRef.current = isConnected

    if (isConnected && wasDisconnected && messages.length > 0) {
      // Get the most recent message timestamp for sync
      const lastMessage = messages[messages.length - 1]
      if (lastMessage) {
        socket.emit('message:sync', { roomId, since: lastMessage.createdAt }, (response) => {
          if (response.messages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id))
              const newMessages = response.messages.filter((m) => !existingIds.has(m.id))
              return newMessages.length > 0 ? [...prev, ...newMessages] : prev
            })
          }
        })
      }

      // Flush offline queue
      offlineQueue.flush(socket)
    }
  }, [socket, isConnected, roomId, messages])

  // Cleanup: leave room on unmount
  useEffect(() => {
    return () => {
      if (socket && joinedRoomRef.current) {
        socket.emit('room:leave', joinedRoomRef.current)
        joinedRoomRef.current = null
      }
    }
  }, [socket])

  const sendMessage = useCallback(
    (content: string, replyToId?: string) => {
      if (!content.trim() || !userId) return

      // If offline, queue the message
      if (!socket?.connected) {
        offlineQueue.enqueue(content, roomId, userId, userName, { replyToId })
        return
      }

      const clientId = crypto.randomUUID()
      const payload: SendMessagePayload = {
        roomId,
        content: content.trim(),
        type: 'TEXT',
        replyToId,
        clientId,
      }

      socket.emit('message:send', payload, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to send message:', ack.error)
        }
      })
    },
    [socket, roomId, userId, userName]
  )

  const sendFileMessage = useCallback(
    (content: string, fileUrl: string, type: MessageType, replyToId?: string) => {
      if (!socket?.connected || !userId) return

      const clientId = crypto.randomUUID()
      const payload: SendMessagePayload = {
        roomId,
        content,
        type,
        fileUrl,
        replyToId,
        clientId,
      }

      socket.emit('message:send', payload, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to send file message:', ack.error)
        }
      })
    },
    [socket, roomId, userId]
  )

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!socket || !isConnected || !content.trim()) return

      socket.emit('message:edit', { roomId, messageId, content: content.trim() }, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to edit message:', ack.error)
        }
      })
    },
    [socket, isConnected, roomId]
  )

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socket || !isConnected) return

      socket.emit('message:delete', { roomId, messageId }, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to delete message:', ack.error)
        }
      })
    },
    [socket, isConnected, roomId]
  )

  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket || !isConnected) return

      socket.emit('message:react', { roomId, messageId, emoji }, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to react:', ack.error)
        }
      })
    },
    [socket, isConnected, roomId]
  )

  const loadMore = useCallback(() => {
    if (!socket || !isConnected || !hasMore || isLoadingHistory) return

    const oldest = messages[0]
    if (!oldest) return

    setIsLoadingHistory(true)
    socket.emit('message:history', {
      roomId,
      cursor: oldest.id,
      limit: HISTORY_LIMIT,
    })
  }, [socket, isConnected, hasMore, isLoadingHistory, messages, roomId])

  const retryMessage = useCallback(
    (clientId: string) => {
      if (!socket) return
      offlineQueue.retry(clientId, socket)
    },
    [socket]
  )

  const discardMessage = useCallback((clientId: string) => {
    offlineQueue.remove(clientId)
  }, [])

  return {
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
  }
}
