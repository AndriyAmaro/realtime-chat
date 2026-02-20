import { prisma } from '../config/database.js'

// ============ REACTION REPOSITORY ============

export const reactionRepository = {
  /** Toggle a reaction: create if not exists, delete if exists. Returns true if created. */
  async toggle(userId: string, messageId: string, emoji: string): Promise<boolean> {
    const existing = await prisma.messageReaction.findUnique({
      where: { userId_messageId_emoji: { userId, messageId, emoji } },
    })

    if (existing) {
      await prisma.messageReaction.delete({ where: { id: existing.id } })
      return false // removed
    }

    await prisma.messageReaction.create({
      data: { userId, messageId, emoji },
    })
    return true // created
  },

  /** Get all reactions for a message, grouped by emoji */
  async findByMessageId(messageId: string): Promise<{ emoji: string; userId: string }[]> {
    return prisma.messageReaction.findMany({
      where: { messageId },
      select: { emoji: true, userId: true },
      orderBy: { createdAt: 'asc' },
    })
  },
}
