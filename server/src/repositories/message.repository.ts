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
    replyToId?: string
    clientId?: string
  }) {
    return prisma.message.create({
      data: {
        content: data.content,
        type: data.type,
        fileUrl: data.fileUrl,
        userId: data.userId,
        roomId: data.roomId,
        replyToId: data.replyToId,
        clientId: data.clientId,
      },
      select: messageSelect,
    })
  },

  /** Find a message by clientId for idempotency dedup (within last 5 min) */
  async findByClientId(clientId: string, userId: string) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    return prisma.message.findFirst({
      where: {
        clientId,
        userId,
        createdAt: { gte: fiveMinAgo },
      },
      select: messageSelect,
    })
  },

  /** Find messages in a room created after a given timestamp (for sync) */
  async findSince(roomId: string, since: Date) {
    return prisma.message.findMany({
      where: {
        roomId,
        createdAt: { gt: since },
      },
      select: messageSelect,
      orderBy: { createdAt: 'asc' },
      take: 200, // safety cap
    })
  },

  /** Find a single message by ID */
  async findById(messageId: string) {
    return prisma.message.findUnique({
      where: { id: messageId },
      select: messageSelect,
    })
  },

  /** Update a message (edit content, set editedAt) */
  async update(messageId: string, data: { content: string; editedAt: Date }) {
    return prisma.message.update({
      where: { id: messageId },
      data,
      select: messageSelect,
    })
  },

  /** Soft-delete a message */
  async softDelete(messageId: string) {
    return prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
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
    return prisma.message.count({ where: { roomId, deletedAt: null } })
  },

  /** Search messages in a room by content (case-insensitive) */
  async searchInRoom(roomId: string, query: string, limit: number, offset: number) {
    const where = {
      roomId,
      deletedAt: null,
      content: { contains: query, mode: 'insensitive' as const },
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        select: messageSelect,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.message.count({ where }),
    ])

    return { messages, total }
  },
}

// ============ REUSABLE SELECT ============

const messageSelect = {
  id: true,
  content: true,
  type: true,
  fileUrl: true,
  editedAt: true,
  deletedAt: true,
  userId: true,
  roomId: true,
  replyToId: true,
  createdAt: true,
  user: {
    select: { id: true, name: true, avatar: true },
  },
  replyTo: {
    select: {
      id: true,
      content: true,
      user: { select: { id: true, name: true } },
    },
  },
  reactions: {
    select: {
      emoji: true,
      userId: true,
    },
  },
} as const
