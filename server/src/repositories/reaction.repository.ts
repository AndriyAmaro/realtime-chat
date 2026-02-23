import { prisma } from '../config/database.js'

// ============ REACTION REPOSITORY ============

export const reactionRepository = {
  /** Toggle a reaction: create if not exists, delete if exists. Returns true if created. */
  async toggle(userId: string, messageId: string, emoji: string): Promise<boolean> {
    // Atomic transaction to avoid race conditions on concurrent toggles
    return prisma.$transaction(async (tx) => {
      const existing = await tx.messageReaction.findUnique({
        where: { userId_messageId_emoji: { userId, messageId, emoji } },
      })

      if (existing) {
        await tx.messageReaction.delete({ where: { id: existing.id } })
        return false // removed
      }

      await tx.messageReaction.create({
        data: { userId, messageId, emoji },
      })
      return true // created
    })
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
