import type { Server, Socket } from 'socket.io'
import type { MessageType } from '../generated/prisma/client.js'

// ============ AUTH ============

export interface SocketUser {
  userId: string
  email: string
}

export interface AuthenticatedSocket extends Socket {
  data: SocketUser
}

// ============ SERVER → CLIENT EVENTS ============

export interface ServerToClientEvents {
  // Messages
  'message:new': (message: MessagePayload) => void
  'message:history': (data: { messages: MessagePayload[]; hasMore: boolean }) => void

  // Room
  'room:joined': (data: { roomId: string; userId: string; userName: string }) => void
  'room:left': (data: { roomId: string; userId: string; userName: string }) => void
  'room:members_online': (data: { roomId: string; userIds: string[] }) => void

  // Status
  'user:status': (data: { userId: string; status: 'ONLINE' | 'OFFLINE' | 'AWAY' }) => void

  // Typing
  'typing:start': (data: { roomId: string; userId: string; userName: string }) => void
  'typing:stop': (data: { roomId: string; userId: string }) => void

  // Error
  error: (data: { message: string }) => void
}

// ============ CLIENT → SERVER EVENTS ============

export interface ClientToServerEvents {
  // Room
  'room:join': (roomId: string) => void
  'room:leave': (roomId: string) => void

  // Messages
  'message:send': (data: SendMessagePayload, callback: (response: MessageAck) => void) => void
  'message:history': (data: { roomId: string; cursor?: string; limit?: number }) => void

  // Typing
  'typing:start': (roomId: string) => void
  'typing:stop': (roomId: string) => void
}

// ============ INTER-SERVER EVENTS ============

export interface InterServerEvents {
  ping: () => void
}

// ============ PAYLOADS ============

export interface MessagePayload {
  id: string
  content: string
  type: MessageType
  fileUrl: string | null
  userId: string
  roomId: string
  createdAt: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

export interface SendMessagePayload {
  roomId: string
  content: string
  type?: MessageType
  fileUrl?: string
}

export interface MessageAck {
  success: boolean
  messageId?: string
  error?: string
}

// ============ TYPED SERVER ============

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketUser
>

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketUser
>
