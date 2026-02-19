import { prisma } from '../config/database.js'
import type { MessageType } from '../generated/prisma/client.js'

// ============ MESSAGE REPOSITORY ============

export const messageRepository = {
  /** Create a new message */
  async create(data: {
    content: string
    type: MessageType
    fileUrl?: string
    userId: string
    roomId: string
  }) {
    return prisma.message.create({
      data: {
        content: data.content,
        type: data.type,
        fileUrl: data.fileUrl,
        userId: data.userId,
        roomId: data.roomId,
      },
      select: messageSelect,
    })
  },

  /** Find messages by room with cursor-based pagination (newest first) */
  async findByRoomId(roomId: string, limit: number, cursor?: string) {
    const messages = await prisma.message.findMany({
      where: { roomId },
      select: messageSelect,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // fetch one extra to determine hasMore
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = messages.length > limit
    if (hasMore) messages.pop()

    return { messages: messages.reverse(), hasMore }
  },

  /** Count messages in a room */
  async countByRoomId(roomId: string) {
    return prisma.message.count({ where: { roomId } })
  },
}

// ============ REUSABLE SELECT ============

const messageSelect = {
  id: true,
  content: true,
  type: true,
  fileUrl: true,
  userId: true,
  roomId: true,
  createdAt: true,
  user: {
    select: { id: true, name: true, avatar: true },
  },
} as const
