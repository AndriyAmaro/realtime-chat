import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@store/auth.store'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: TypedSocket | null = null
let currentToken: string | null = null

/**
 * Get or create the singleton Socket.io connection.
 * Authenticates with the current JWT access token.
 *
 * Reuses the existing socket if the token hasn't changed (safe during
 * preload — avoids duplicates). Recreates when the token changes
 * (e.g. after session restore refreshes an expired token).
 */
export function getSocket(): TypedSocket {
  const token = useAuthStore.getState().accessToken

  // Reuse existing socket if token unchanged (even if still connecting)
  if (socket && currentToken === token) return socket

  // Token changed — tear down old socket before creating a new one
  if (socket) {
    socket.disconnect()
    socket = null
  }

  currentToken = token

  // Socket.io connects directly to the backend (not through Vercel proxy)
  // because Vercel serverless doesn't support persistent WebSocket connections.
  // In dev, Vite proxy handles /socket.io. In prod, VITE_SOCKET_URL points to Railway.
  socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  })

  return socket
}

/**
 * Disconnect and clear the socket instance.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
    currentToken = null
  }
}

/**
 * Check if the socket is currently connected.
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false
}
