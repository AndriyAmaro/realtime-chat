import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@store/auth.store'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: TypedSocket | null = null

/**
 * Get or create the singleton Socket.io connection.
 * Authenticates with the current JWT access token.
 */
export function getSocket(): TypedSocket {
  if (socket?.connected) return socket

  const token = useAuthStore.getState().accessToken

  // In production, Socket.io is proxied through Vercel edge rewrites
  // (/socket.io/* → Railway) so it's same-origin — no CORS issues.
  // Polling-only because Vercel edge doesn't support WebSocket upgrade.
  // In dev, Vite proxy handles /socket.io.
  socket = io('/', {
    auth: { token },
    transports: ['polling'],
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
  }
}

/**
 * Check if the socket is currently connected.
 */
export function isSocketConnected(): boolean {
  return socket?.connected ?? false
}
