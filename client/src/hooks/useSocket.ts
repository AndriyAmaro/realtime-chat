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

  // Derive socket — getSocket() is idempotent (returns existing singleton)
  const socket = isAuthenticated ? getSocket() : null

  // Derive initial connected state from socket
  const [isConnected, setIsConnected] = useState(() => isSocketConnected())
  const [connectError, setConnectError] = useState<string | null>(null)

  // Disconnect when auth changes to false (render-time adjustment)
  const [prevAuth, setPrevAuth] = useState(isAuthenticated)
  if (isAuthenticated !== prevAuth) {
    setPrevAuth(isAuthenticated)
    if (!isAuthenticated) {
      disconnectSocket()
      setIsConnected(false)
      setConnectError(null)
    }
  }

  // Subscribe to connection events
  useEffect(() => {
    if (!socket) return

    function onConnect() {
      setIsConnected(true)
      setConnectError(null)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onConnectError(err: Error) {
      console.error('[socket] connect_error:', err.message)
      setConnectError(err.message)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
    }
  }, [socket])

  return { socket, isConnected, connectError }
}
