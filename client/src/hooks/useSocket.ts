import { useEffect, useState } from 'react'
import { getSocket, disconnectSocket, isSocketConnected } from '@services/socket'
import { useAuthStore } from '@store/auth.store'

/**
 * Manages the Socket.io connection lifecycle.
 * Connects when authenticated, disconnects on logout.
 * Tracks reconnection state for UI feedback.
 */
export function useSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Derive socket — getSocket() is idempotent (returns existing singleton)
  const socket = isAuthenticated ? getSocket() : null

  // Derive initial connected state from socket
  const [isConnected, setIsConnected] = useState(() => isSocketConnected())
  const [connectError, setConnectError] = useState<string | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  // Disconnect when auth changes to false (render-time adjustment)
  const [prevAuth, setPrevAuth] = useState(isAuthenticated)
  if (isAuthenticated !== prevAuth) {
    setPrevAuth(isAuthenticated)
    if (!isAuthenticated) {
      disconnectSocket()
      setIsConnected(false)
      setConnectError(null)
      setIsReconnecting(false)
      setReconnectAttempt(0)
    }
  }

  // Subscribe to connection events
  useEffect(() => {
    if (!socket) return

    function onConnect() {
      setIsConnected(true)
      setConnectError(null)
      setIsReconnecting(false)
      setReconnectAttempt(0)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onConnectError(err: Error) {
      console.error('[socket] connect_error:', err.message)
      setConnectError(err.message)
    }

    function onReconnectAttempt(attempt: number) {
      setIsReconnecting(true)
      setReconnectAttempt(attempt)
    }

    function onReconnectFailed() {
      setIsReconnecting(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    // Socket.io Manager events (on the io manager, not the socket)
    socket.io.on('reconnect_attempt', onReconnectAttempt)
    socket.io.on('reconnect_failed', onReconnectFailed)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.io.off('reconnect_attempt', onReconnectAttempt)
      socket.io.off('reconnect_failed', onReconnectFailed)
    }
  }, [socket])

  return {
    socket,
    isConnected,
    connectError,
    isReconnecting,
    reconnectAttempt,
    reconnectMax: 10,
  }
}
