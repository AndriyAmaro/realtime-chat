import { messageRepository } from '../repositories/message.repository.js'
import { roomMemberRepository } from '../repositories/room.repository.js'
import type { MessageType } from '../generated/prisma/client.js'
import type { MessagePayload } from '../types/socket.js'

// ============ MESSAGE SERVICE ============

const DEFAULT_HISTORY_LIMIT = 50
const MAX_HISTORY_LIMIT = 100

export const messageService = {
  /** Send a message to a room (validates membership) */
  async send(data: {
    content: string
    type?: MessageType
    fileUrl?: string
    userId: string
    roomId: string
  }): Promise<MessagePayload> {
    // Verify user is a member of the room
    const membership = await roomMemberRepository.findMembership(data.userId, data.roomId)
    if (!membership) {
      throw new Error('You are not a member of this room')
    }

    const message = await messageRepository.create({
      content: data.content,
      type: data.type ?? 'TEXT',
      fileUrl: data.fileUrl,
      userId: data.userId,
      roomId: data.roomId,
    })

    return formatMessage(message)
  },

  /** Get message history for a room (validates membership) */
  async getHistory(
    userId: string,
    roomId: string,
    cursor?: string,
    limit?: number
  ): Promise<{ messages: MessagePayload[]; hasMore: boolean }> {
    // Verify membership
    const membership = await roomMemberRepository.findMembership(userId, roomId)
    if (!membership) {
      throw new Error('You are not a member of this room')
    }

    const safeLimit = Math.min(limit ?? DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT)
    const result = await messageRepository.findByRoomId(roomId, safeLimit, cursor)

    return {
      messages: result.messages.map(formatMessage),
      hasMore: result.hasMore,
    }
  },
}

// ============ HELPERS ============

function formatMessage(message: {
  id: string
  content: string
  type: MessageType
  fileUrl: string | null
  userId: string
  roomId: string
  createdAt: Date
  user: { id: string; name: string; avatar: string | null }
}): MessagePayload {
  return {
    id: message.id,
    content: message.content,
    type: message.type,
    fileUrl: message.fileUrl,
    userId: message.userId,
    roomId: message.roomId,
    createdAt: message.createdAt.toISOString(),
    user: message.user,
  }
}
