import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '@store/auth.store'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: TypedSocket | null = null

/**
 * Get or create the singleton Socket.io connection.
 * Uses an auth callback so Socket.io fetches the LATEST token
 * on every connection and reconnection attempt (not a stale snapshot).
 */
export function getSocket(): TypedSocket {
  if (socket) return socket

  // In production, Socket.io is proxied through Vercel edge rewrites
  // (/socket.io/* → Railway) so it's same-origin — no CORS issues.
  // Polling-only because Vercel edge doesn't support WebSocket upgrade.
  // In dev, Vite proxy handles /socket.io.
  socket = io('/', {
    auth: (cb) => {
      const token = useAuthStore.getState().accessToken
      cb({ token })
    },
    transports: ['polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
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
