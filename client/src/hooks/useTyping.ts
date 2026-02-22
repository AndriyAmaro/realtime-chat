import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@store/auth.store'
import type { TypedSocket } from '@services/socket'

interface TypingUser {
  userId: string
  userName: string
}

interface UseTypingOptions {
  socket: TypedSocket | null
  roomId: string
  isConnected: boolean
}

interface UseTypingReturn {
  typingUsers: TypingUser[]
  startTyping: () => void
  stopTyping: () => void
}

const TYPING_TIMEOUT_MS = 3000

/**
 * Manages typing indicators for a specific room.
 * Handles both sending and receiving typing events.
 */
export function useTyping({ socket, roomId, isConnected }: UseTypingOptions): UseTypingReturn {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const userId = useAuthStore((s) => s.user?.id)

  // Listen for typing events from other users
  useEffect(() => {
    if (!socket || !isConnected) return

    // Track auto-remove timeouts so we can cancel them on cleanup
    const autoRemoveTimers = new Set<ReturnType<typeof setTimeout>>()

    function onTypingStart(data: { roomId: string; userId: string; userName: string }) {
      if (data.roomId !== roomId || data.userId === userId) return

      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev
        return [...prev, { userId: data.userId, userName: data.userName }]
      })

      // Auto-remove after timeout (in case stop event is missed)
      const timer = setTimeout(() => {
        autoRemoveTimers.delete(timer)
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
      }, TYPING_TIMEOUT_MS + 1000)
      autoRemoveTimers.add(timer)
    }

    function onTypingStop(data: { roomId: string; userId: string }) {
      if (data.roomId !== roomId) return
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId))
    }

    socket.on('typing:start', onTypingStart)
    socket.on('typing:stop', onTypingStop)

    return () => {
      socket.off('typing:start', onTypingStart)
      socket.off('typing:stop', onTypingStop)
      autoRemoveTimers.forEach(clearTimeout)
      autoRemoveTimers.clear()
      setTypingUsers([])
    }
  }, [socket, isConnected, roomId, userId])

  // Emit typing:start with auto-stop after timeout
  const startTyping = useCallback(() => {
    if (!socket || !isConnected) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing:start', roomId)
    }

    // Reset auto-stop timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        socket.emit('typing:stop', roomId)
      }
    }, TYPING_TIMEOUT_MS)
  }, [socket, isConnected, roomId])

  // Emit typing:stop immediately
  const stopTyping = useCallback(() => {
    if (!socket || !isConnected) return

    if (isTypingRef.current) {
      isTypingRef.current = false
      socket.emit('typing:stop', roomId)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [socket, isConnected, roomId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return { typingUsers, startTyping, stopTyping }
}
