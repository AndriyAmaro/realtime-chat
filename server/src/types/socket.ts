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
  'message:edited': (message: MessagePayload) => void
  'message:deleted': (data: { roomId: string; messageId: string }) => void
  'message:reaction_updated': (data: {
    roomId: string
    messageId: string
    reactions: ReactionGroup[]
  }) => void

  // Room
  'room:joined': (data: { roomId: string; userId: string; userName: string }) => void
  'room:left': (data: { roomId: string; userId: string; userName: string }) => void
  'room:members_online': (data: { roomId: string; userIds: string[] }) => void

  // Status
  'user:status': (data: { userId: string; status: 'ONLINE' | 'OFFLINE' | 'AWAY' }) => void

  // Typing
  'typing:start': (data: { roomId: string; userId: string; userName: string }) => void
  'typing:stop': (data: { roomId: string; userId: string }) => void

  // Read receipts
  'messages:read': (data: { roomId: string; userId: string; readAt: string }) => void
  'messages:read_receipts': (data: {
    roomId: string
    receipts: { userId: string; readAt: string | null }[]
  }) => void

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
  'message:edit': (
    data: { roomId: string; messageId: string; content: string },
    callback: (response: MessageAck) => void
  ) => void
  'message:delete': (
    data: { roomId: string; messageId: string },
    callback: (response: MessageAck) => void
  ) => void
  'message:react': (
    data: { roomId: string; messageId: string; emoji: string },
    callback: (response: MessageAck) => void
  ) => void

  // Typing
  'typing:start': (roomId: string) => void
  'typing:stop': (roomId: string) => void

  // Read receipts
  'messages:read': (roomId: string) => void
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
  editedAt: string | null
  deletedAt: string | null
  userId: string
  roomId: string
  replyToId: string | null
  replyTo: {
    id: string
    content: string
    user: { id: string; name: string }
  } | null
  createdAt: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
  reactions: ReactionGroup[]
}

export interface ReactionGroup {
  emoji: string
  count: number
  userIds: string[]
}

export interface SendMessagePayload {
  roomId: string
  content: string
  type?: MessageType
  fileUrl?: string
  replyToId?: string
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
