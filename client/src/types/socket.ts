// ============ SOCKET EVENT TYPES (mirrors server/src/types/socket.ts) ============

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE'

// ============ SERVER → CLIENT EVENTS ============

export interface ServerToClientEvents {
  'message:new': (message: MessagePayload) => void
  'message:history': (data: { messages: MessagePayload[]; hasMore: boolean }) => void

  'room:joined': (data: { roomId: string; userId: string; userName: string }) => void
  'room:left': (data: { roomId: string; userId: string; userName: string }) => void
  'room:members_online': (data: { roomId: string; userIds: string[] }) => void

  'user:status': (data: { userId: string; status: 'ONLINE' | 'OFFLINE' | 'AWAY' }) => void

  'typing:start': (data: { roomId: string; userId: string; userName: string }) => void
  'typing:stop': (data: { roomId: string; userId: string }) => void

  error: (data: { message: string }) => void
}

// ============ CLIENT → SERVER EVENTS ============

export interface ClientToServerEvents {
  'room:join': (roomId: string) => void
  'room:leave': (roomId: string) => void

  'message:send': (data: SendMessagePayload, callback: (response: MessageAck) => void) => void
  'message:history': (data: { roomId: string; cursor?: string; limit?: number }) => void

  'typing:start': (roomId: string) => void
  'typing:stop': (roomId: string) => void
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
