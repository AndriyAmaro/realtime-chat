import { useEffect, useRef, useState } from 'react'
import { getSocket, disconnectSocket, isSocketConnected } from '@services/socket'
import { useAuthStore } from '@store/auth.store'

const REFRESH_URL = '/api/v1/auth/refresh-token'

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns true if successful (store is updated), false otherwise.
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const { refreshToken } = useAuthStore.getState()
    const res = await fetch(REFRESH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    })
    if (!res.ok) return false

    const json = (await res.json()) as {
      success: boolean
      data?: { accessToken: string; refreshToken: string }
    }
    if (json.data?.accessToken) {
      useAuthStore.getState().setAccessToken(json.data.accessToken)
      if (json.data.refreshToken) {
        useAuthStore.getState().setRefreshToken(json.data.refreshToken)
      }
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Manages the Socket.io connection lifecycle.
 * Connects when authenticated, disconnects on logout.
 * Automatically refreshes the JWT on auth-related connect errors
 * so reconnection uses a fresh token (via the auth callback in socket.ts).
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

  // Guard against concurrent token refreshes
  const isRefreshingRef = useRef(false)

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

      // If the error is auth-related, refresh the token so the next
      // reconnection attempt (via the auth callback) uses a fresh one.
      const isAuthError =
        err.message.includes('expired') ||
        err.message.includes('Invalid') ||
        err.message.includes('Authentication')

      if (isAuthError && !isRefreshingRef.current) {
        isRefreshingRef.current = true
        refreshAccessToken()
          .then((ok) => {
            if (!ok) {
              useAuthStore.getState().logout()
            }
          })
          .catch((err) => {
            console.error('[socket] Token refresh failed:', err)
            useAuthStore.getState().logout()
          })
          .finally(() => {
            isRefreshingRef.current = false
          })
      }
    }

    function onReconnectAttempt(attempt: number) {
      setIsReconnecting(true)
      setReconnectAttempt(attempt)
    }

    function onReconnectFailed() {
      setIsReconnecting(false)

      // All reconnection attempts exhausted — try one last time
      // after refreshing the token, then manually reconnect.
      if (!isRefreshingRef.current) {
        isRefreshingRef.current = true
        refreshAccessToken()
          .then((ok) => {
            if (ok && socket) {
              socket.connect()
            } else {
              useAuthStore.getState().logout()
            }
          })
          .catch((err) => {
            console.error('[socket] Token refresh failed on reconnect_failed:', err)
            useAuthStore.getState().logout()
          })
          .finally(() => {
            isRefreshingRef.current = false
          })
      }
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
