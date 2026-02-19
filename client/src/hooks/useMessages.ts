import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@store/auth.store'
import type { TypedSocket } from '@services/socket'
import type { MessagePayload, MessageType, SendMessagePayload } from '@/types/socket'

interface UseMessagesOptions {
  socket: TypedSocket | null
  roomId: string
  isConnected: boolean
}

interface UseMessagesReturn {
  messages: MessagePayload[]
  hasMore: boolean
  isLoadingHistory: boolean
  sendMessage: (content: string) => void
  sendFileMessage: (content: string, fileUrl: string, type: MessageType) => void
  loadMore: () => void
}

const HISTORY_LIMIT = 50

/**
 * Manages messages for a specific room via Socket.io.
 * Handles sending, receiving, and loading history.
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
        // If loading more (prev has messages), prepend; otherwise set
        if (prev.length > 0) {
          return [...data.messages, ...prev]
        }
        return data.messages
      })
      setHasMore(data.hasMore)
      setIsLoadingHistory(false)
    }

    socket.on('message:new', onNewMessage)
    socket.on('message:history', onHistory)

    return () => {
      socket.off('message:new', onNewMessage)
      socket.off('message:history', onHistory)
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

  // Send message with ACK
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !isConnected || !content.trim() || !userId) return

      const payload: SendMessagePayload = {
        roomId,
        content: content.trim(),
        type: 'TEXT',
      }

      socket.emit('message:send', payload, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to send message:', ack.error)
        }
      })
    },
    [socket, isConnected, roomId, userId]
  )

  // Send file message with ACK
  const sendFileMessage = useCallback(
    (content: string, fileUrl: string, type: MessageType) => {
      if (!socket || !isConnected || !userId) return

      const payload: SendMessagePayload = {
        roomId,
        content,
        type,
        fileUrl,
      }

      socket.emit('message:send', payload, (ack) => {
        if (!ack.success) {
          console.error('[socket] Failed to send file message:', ack.error)
        }
      })
    },
    [socket, isConnected, roomId, userId]
  )

  // Load more (older) messages
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

  return { messages, hasMore, isLoadingHistory, sendMessage, sendFileMessage, loadMore }
}
