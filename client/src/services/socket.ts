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

  socket = io(import.meta.env.VITE_API_URL || '/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
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
