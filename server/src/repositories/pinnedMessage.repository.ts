import { prisma } from '../config/database.js'

// ============ PINNED MESSAGE REPOSITORY ============

const pinnedSelect = {
  id: true,
  messageId: true,
  roomId: true,
  pinnedBy: true,
  pinnedAt: true,
  message: {
    select: {
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
        select: { emoji: true, userId: true },
      },
    },
  },
} as const

export const pinnedMessageRepository = {
  /** Pin a message in a room */
  async pin(messageId: string, roomId: string, pinnedBy: string) {
    return prisma.pinnedMessage.create({
      data: { messageId, roomId, pinnedBy },
      select: pinnedSelect,
    })
  },

  /** Unpin a message from a room */
  async unpin(messageId: string, roomId: string) {
    return prisma.pinnedMessage.delete({
      where: { messageId_roomId: { messageId, roomId } },
    })
  },

  /** Find all pinned messages in a room (most recent first) */
  async findByRoom(roomId: string) {
    return prisma.pinnedMessage.findMany({
      where: { roomId },
      select: pinnedSelect,
      orderBy: { pinnedAt: 'desc' },
    })
  },

  /** Check if a message is pinned in a room */
  async findOne(messageId: string, roomId: string) {
    return prisma.pinnedMessage.findUnique({
      where: { messageId_roomId: { messageId, roomId } },
    })
  },
}
