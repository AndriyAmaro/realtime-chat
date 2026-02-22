// ============ SOCKET EVENT TYPES (mirrors server/src/types/socket.ts) ============

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE'

// ============ SERVER → CLIENT EVENTS ============

export interface ServerToClientEvents {
  'message:new': (message: MessagePayload) => void
  'message:history': (data: { messages: MessagePayload[]; hasMore: boolean }) => void
  'message:edited': (message: MessagePayload) => void
  'message:deleted': (data: { roomId: string; messageId: string }) => void
  'message:reaction_updated': (data: {
    roomId: string
    messageId: string
    reactions: ReactionGroup[]
  }) => void

  'room:joined': (data: { roomId: string; userId: string; userName: string }) => void
  'room:left': (data: { roomId: string; userId: string; userName: string }) => void
  'room:members_online': (data: { roomId: string; userIds: string[] }) => void

  'user:status': (data: { userId: string; status: 'ONLINE' | 'OFFLINE' | 'AWAY' }) => void
  'user:devices': (data: { count: number }) => void

  'typing:start': (data: { roomId: string; userId: string; userName: string }) => void
  'typing:stop': (data: { roomId: string; userId: string }) => void

  'messages:read': (data: { roomId: string; userId: string; readAt: string }) => void
  'messages:read_receipts': (data: {
    roomId: string
    receipts: { userId: string; readAt: string | null }[]
  }) => void

  error: (data: { message: string }) => void
}

// ============ CLIENT → SERVER EVENTS ============

export interface ClientToServerEvents {
  'room:join': (
    roomId: string,
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  'room:leave': (roomId: string) => void

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

  'message:sync': (
    data: { roomId: string; since: string },
    callback: (response: { messages: MessagePayload[] }) => void
  ) => void

  'typing:start': (roomId: string) => void
  'typing:stop': (roomId: string) => void

  'messages:read': (roomId: string) => void
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
  clientId?: string
}

export interface MessageAck {
  success: boolean
  messageId?: string
  error?: string
}
