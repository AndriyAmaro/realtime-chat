import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@store/auth.store'
import type { TypedSocket } from '@services/socket'
import type { MessagePayload, MessageType, ReactionGroup, SendMessagePayload } from '@/types/socket'

interface UseMessagesOptions {
  socket: TypedSocket | null
  roomId: string
  isConnected: boolean
}

interface UseMessagesReturn {
  messages: MessagePayload[]
  hasMore: boolean
  isLoadingHistory: boolean
  sendMessage: (content: string, replyToId?: string) => void
  sendFileMessage: (content: string, fileUrl: string, type: MessageType, replyToId?: string) => void
  editMessage: (messageId: string, content: string) => void
  deleteMessage: (messageId: string) => void
  toggleReaction: (messageId: string, emoji: string) => void
  loadMore: () => void
}

const HISTORY_LIMIT = 50

/**
 * Manages messages for a specific room via Socket.io.
 * Handles sending, receiving, editing, deleting, reactions, and loading history.
 */
export function useMessages({
  socket,
  roomId,
  isConnected,
}: UseMessagesOptions): UseMessagesReturn {
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const joinedRoomRef = useRef<string | null>(null)
  const userId = useAuthStore((s) => s.user?.id)

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

    // Join room
    socket.emit('room:join', roomId)
    joinedRoomRef.current = roomId

    // Request initial history
    socket.emit('message:history', { roomId, limit: HISTORY_LIMIT })

    // Listen for new messages
    function onNewMessage(message: MessagePayload) {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message])
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

    socket.on('message:new', onNewMessage)
    socket.on('message:history', onHistory)
    socket.on('message:edited', onEdited)
    socket.on('message:deleted', onDeleted)
    socket.on('message:reaction_updated', onReactionUpdated)

    return () => {
      socket.off('message:new', onNewMessage)
      socket.off('message:history', onHistory)
      socket.off('message:edited', onEdited)
      socket.off('message:deleted', onDeleted)
      socket.off('message:reaction_updated', onReactionUpdated)
    }
  }, [socket, isConnected, roomId])

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
      if (!socket || !isConnected || !content.trim() || !userId) return

      const payload: SendMessagePayload = {
        roomId,
        content: content.trim(),
        type: 'TEXT',
        replyToId,
      }

      socket.emit('message:send', payload, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to send message:', ack.error)
        }
      })
    },
    [socket, isConnected, roomId, userId]
  )

  const sendFileMessage = useCallback(
    (content: string, fileUrl: string, type: MessageType, replyToId?: string) => {
      if (!socket || !isConnected || !userId) return

      const payload: SendMessagePayload = {
        roomId,
        content,
        type,
        fileUrl,
        replyToId,
      }

      socket.emit('message:send', payload, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to send file message:', ack.error)
        }
      })
    },
    [socket, isConnected, roomId, userId]
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

  return {
    messages,
    hasMore,
    isLoadingHistory,
    sendMessage,
    sendFileMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    loadMore,
  }
}
