import { useEffect, useState, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface ReadReceipt {
  userId: string
  readAt: string | null
}

interface UseReadReceiptsOptions {
  socket: TypedSocket | null
  roomId: string
  isConnected: boolean
  userId: string | undefined
  /** Pass messages.length so we re-emit "read" when new messages arrive */
  messageCount: number
}

interface UseReadReceiptsReturn {
  /** Check if a sent message has been read by at least one other member */
  isReadByOthers: (messageCreatedAt: string) => boolean
  /** Manually mark the room as read (e.g. on scroll-to-bottom) */
  markAsRead: () => void
}

/**
 * Manages read receipts for a room via Socket.io.
 *
 * - Emits `messages:read` when the room is opened and when new messages arrive
 * - Listens for `messages:read_receipts` (initial bulk on room:join)
 * - Listens for `messages:read` (real-time per-user updates)
 * - Exposes `isReadByOthers(createdAt)` for the ChatMessage status indicator
 */
export function useReadReceipts({
  socket,
  roomId,
  isConnected,
  userId,
  messageCount,
}: UseReadReceiptsOptions): UseReadReceiptsReturn {
  const [receipts, setReceipts] = useState<ReadReceipt[]>([])

  // Reset receipts when room changes
  const [prevRoom, setPrevRoom] = useState(roomId)
  if (roomId !== prevRoom) {
    setPrevRoom(roomId)
    setReceipts([])
  }

  // ---- Listen for read receipt events ----
  useEffect(() => {
    if (!socket || !isConnected) return

    function onReadReceipts(data: { roomId: string; receipts: ReadReceipt[] }) {
      if (data.roomId === roomId) {
        setReceipts(data.receipts)
      }
    }

    function onRead(data: { roomId: string; userId: string; readAt: string }) {
      if (data.roomId === roomId) {
        setReceipts((prev) => {
          const idx = prev.findIndex((r) => r.userId === data.userId)
          const updated = { userId: data.userId, readAt: data.readAt }
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = updated
            return next
          }
          return [...prev, updated]
        })
      }
    }

    socket.on('messages:read_receipts', onReadReceipts)
    socket.on('messages:read', onRead)

    return () => {
      socket.off('messages:read_receipts', onReadReceipts)
      socket.off('messages:read', onRead)
    }
  }, [socket, isConnected, roomId])

  // ---- Emit read receipt ----
  const markAsRead = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('messages:read', roomId)
    }
  }, [socket, isConnected, roomId])

  // Mark as read when room opens and when new messages arrive
  useEffect(() => {
    if (messageCount > 0) {
      markAsRead()
    }
  }, [markAsRead, messageCount])

  // ---- Status check ----
  function isReadByOthers(messageCreatedAt: string): boolean {
    if (!userId) return false
    const msgTime = new Date(messageCreatedAt).getTime()
    return receipts.some((r) => {
      if (r.userId === userId || !r.readAt) return false
      return new Date(r.readAt).getTime() >= msgTime
    })
  }

  return { isReadByOthers, markAsRead }
}
