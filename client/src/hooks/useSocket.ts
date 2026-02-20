import { useEffect, useState } from 'react'
import { getSocket, disconnectSocket, isSocketConnected } from '@services/socket'
import { useAuthStore } from '@store/auth.store'

/**
 * Manages the Socket.io connection lifecycle.
 * Connects when authenticated, disconnects on logout.
 * Socket is derived from auth state (not stored in React state).
 */
export function useSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  // Subscribe to accessToken so we re-render when session restore refreshes it.
  // getSocket() will detect the token mismatch and create a new socket.
  const accessToken = useAuthStore((s) => s.accessToken)

  // Derive socket — getSocket() reuses or recreates based on current token
  const socket = isAuthenticated && accessToken ? getSocket() : null

  // Derive initial connected state from socket
  const [isConnected, setIsConnected] = useState(() => isSocketConnected())

  // Disconnect when auth changes to false (render-time adjustment)
  const [prevAuth, setPrevAuth] = useState(isAuthenticated)
  if (isAuthenticated !== prevAuth) {
    setPrevAuth(isAuthenticated)
    if (!isAuthenticated) {
      disconnectSocket()
      setIsConnected(false)
    }
  }

  // Sync connected state during render — handles race condition when the
  // socket was preloaded at login and connected before this hook mounted.
  if (socket?.connected && !isConnected) {
    setIsConnected(true)
  }

  // Reset connected state when socket instance changes (new token)
  if (!socket?.connected && isConnected) {
    setIsConnected(false)
  }

  // Subscribe to connection events
  useEffect(() => {
    if (!socket) return

    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket])

  return { socket, isConnected }
}
