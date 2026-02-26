import { useState, useEffect, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents, MessagePayload } from '@/types/socket'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface UsePinnedMessagesReturn {
  pinnedMessages: MessagePayload[]
  pinMessage: (messageId: string) => void
  unpinMessage: (messageId: string) => void
  isPinned: (messageId: string) => boolean
}

export function usePinnedMessages(
  socket: TypedSocket | null,
  roomId: string | null,
  isConnected: boolean
): UsePinnedMessagesReturn {
  const [pinnedMessages, setPinnedMessages] = useState<MessagePayload[]>([])

  // Reset state when room changes (React pattern: adjust state during render)
  const [prevRoomId, setPrevRoomId] = useState(roomId)
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId)
    setPinnedMessages([])
  }

  // Fetch pinned messages when joining a room
  useEffect(() => {
    if (!socket || !roomId || !isConnected) return

    socket.emit('pinned:fetch', { roomId }, (response) => {
      if (response.success && response.messages) {
        setPinnedMessages(response.messages)
      }
    })
  }, [socket, roomId, isConnected])

  // Listen for real-time pin/unpin events
  useEffect(() => {
    if (!socket || !roomId) return

    const handlePinned = (data: { roomId: string; message: MessagePayload; pinnedBy: string }) => {
      if (data.roomId !== roomId) return
      setPinnedMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === data.message.id)) return prev
        return [data.message, ...prev]
      })
    }

    const handleUnpinned = (data: { roomId: string; messageId: string }) => {
      if (data.roomId !== roomId) return
      setPinnedMessages((prev) => prev.filter((m) => m.id !== data.messageId))
    }

    socket.on('message:pinned', handlePinned)
    socket.on('message:unpinned', handleUnpinned)

    return () => {
      socket.off('message:pinned', handlePinned)
      socket.off('message:unpinned', handleUnpinned)
    }
  }, [socket, roomId])

  const pinMessage = useCallback(
    (messageId: string) => {
      if (!socket || !roomId) return
      socket.emit('message:pin', { roomId, messageId }, () => {})
    },
    [socket, roomId]
  )

  const unpinMessage = useCallback(
    (messageId: string) => {
      if (!socket || !roomId) return
      socket.emit('message:unpin', { roomId, messageId }, () => {})
    },
    [socket, roomId]
  )

  const isPinned = useCallback(
    (messageId: string) => pinnedMessages.some((m) => m.id === messageId),
    [pinnedMessages]
  )

  return { pinnedMessages, pinMessage, unpinMessage, isPinned }
}
