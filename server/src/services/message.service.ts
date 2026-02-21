import { messageRepository } from '../repositories/message.repository.js'
import { reactionRepository } from '../repositories/reaction.repository.js'
import { roomMemberRepository } from '../repositories/room.repository.js'
import { ForbiddenError, NotFoundError } from '../errors/index.js'
import type { MessageType } from '../generated/prisma/client.js'
import type { MessagePayload, ReactionGroup } from '../types/socket.js'

// ============ MESSAGE SERVICE ============

const DEFAULT_HISTORY_LIMIT = 50
const MAX_HISTORY_LIMIT = 100

export const messageService = {
  /** Send a message to a room (validates membership, dedup by clientId) */
  async send(data: {
    content: string
    type?: MessageType
    fileUrl?: string
    userId: string
    roomId: string
    replyToId?: string
    clientId?: string
  }): Promise<MessagePayload> {
    // Verify user is a member of the room
    const membership = await roomMemberRepository.findMembership(data.userId, data.roomId)
    if (!membership) {
      throw new ForbiddenError('You are not a member of this room')
    }

    // Idempotency: if clientId provided, check for recent duplicate
    if (data.clientId) {
      const existing = await messageRepository.findByClientId(data.clientId, data.userId)
      if (existing) {
        return formatMessage(existing)
      }
    }

    // If replying, verify the target message exists and is in the same room
    if (data.replyToId) {
      const replyTarget = await messageRepository.findById(data.replyToId)
      if (!replyTarget || replyTarget.roomId !== data.roomId) {
        throw new NotFoundError('Reply target message not found')
      }
    }

    const message = await messageRepository.create({
      content: data.content,
      type: data.type ?? 'TEXT',
      fileUrl: data.fileUrl,
      userId: data.userId,
      roomId: data.roomId,
      replyToId: data.replyToId,
      clientId: data.clientId,
    })

    return formatMessage(message)
  },

  /** Edit a message (only author, only TEXT type) */
  async editMessage(
    userId: string,
    roomId: string,
    messageId: string,
    content: string
  ): Promise<MessagePayload> {
    const message = await messageRepository.findById(messageId)
    if (!message || message.deletedAt) {
      throw new NotFoundError('Message not found')
    }
    if (message.roomId !== roomId) {
      throw new NotFoundError('Message not found')
    }
    if (message.userId !== userId) {
      throw new ForbiddenError('Only the author can edit a message')
    }
    if (message.type !== 'TEXT') {
      throw new ForbiddenError('Only text messages can be edited')
    }

    const updated = await messageRepository.update(messageId, {
      content: content.trim(),
      editedAt: new Date(),
    })

    return formatMessage(updated)
  },

  /** Delete a message (author OR room admin/owner) */
  async deleteMessage(userId: string, roomId: string, messageId: string): Promise<void> {
    const message = await messageRepository.findById(messageId)
    if (!message || message.deletedAt) {
      throw new NotFoundError('Message not found')
    }
    if (message.roomId !== roomId) {
      throw new NotFoundError('Message not found')
    }

    // Author can always delete their own messages
    if (message.userId !== userId) {
      // Check if user is admin/owner
      const membership = await roomMemberRepository.findMembership(userId, roomId)
      if (!membership || membership.role !== 'ADMIN') {
        throw new ForbiddenError('Only the author or an admin can delete this message')
      }
    }

    await messageRepository.softDelete(messageId)
  },

  /** Toggle a reaction on a message */
  async toggleReaction(
    userId: string,
    roomId: string,
    messageId: string,
    emoji: string
  ): Promise<ReactionGroup[]> {
    // Verify membership
    const membership = await roomMemberRepository.findMembership(userId, roomId)
    if (!membership) {
      throw new ForbiddenError('You are not a member of this room')
    }

    // Verify message exists and is not deleted
    const message = await messageRepository.findById(messageId)
    if (!message || message.deletedAt) {
      throw new NotFoundError('Message not found')
    }
    if (message.roomId !== roomId) {
      throw new NotFoundError('Message not found')
    }

    // Toggle the reaction
    await reactionRepository.toggle(userId, messageId, emoji)

    // Return updated reaction groups
    const reactions = await reactionRepository.findByMessageId(messageId)
    return aggregateReactions(reactions)
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
      throw new ForbiddenError('You are not a member of this room')
    }

    const safeLimit = Math.min(limit ?? DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT)
    const result = await messageRepository.findByRoomId(roomId, safeLimit, cursor)

    return {
      messages: result.messages.map(formatMessage),
      hasMore: result.hasMore,
    }
  },
  /** Get messages created after a given timestamp (for reconnection sync) */
  async getMessagesSince(userId: string, roomId: string, since: string): Promise<MessagePayload[]> {
    const membership = await roomMemberRepository.findMembership(userId, roomId)
    if (!membership) {
      throw new ForbiddenError('You are not a member of this room')
    }

    const messages = await messageRepository.findSince(roomId, new Date(since))
    return messages.map(formatMessage)
  },

  /** Search messages in a room (validates membership) */
  async search(
    userId: string,
    roomId: string,
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ messages: MessagePayload[]; meta: { page: number; limit: number; total: number } }> {
    const membership = await roomMemberRepository.findMembership(userId, roomId)
    if (!membership) {
      throw new ForbiddenError('You are not a member of this room')
    }

    const safeLimit = Math.min(limit, MAX_HISTORY_LIMIT)
    const offset = (page - 1) * safeLimit
    const result = await messageRepository.searchInRoom(roomId, query, safeLimit, offset)

    return {
      messages: result.messages.map(formatMessage),
      meta: { page, limit: safeLimit, total: result.total },
    }
  },
}

// ============ HELPERS ============

type RawMessage = {
  id: string
  content: string
  type: MessageType
  fileUrl: string | null
  editedAt: Date | null
  deletedAt: Date | null
  userId: string
  roomId: string
  replyToId: string | null
  createdAt: Date
  user: { id: string; name: string; avatar: string | null }
  replyTo: { id: string; content: string; user: { id: string; name: string } } | null
  reactions: { emoji: string; userId: string }[]
}

function formatMessage(message: RawMessage): MessagePayload {
  return {
    id: message.id,
    content: message.deletedAt ? '' : message.content,
    type: message.type,
    fileUrl: message.deletedAt ? null : message.fileUrl,
    editedAt: message.editedAt?.toISOString() ?? null,
    deletedAt: message.deletedAt?.toISOString() ?? null,
    userId: message.userId,
    roomId: message.roomId,
    replyToId: message.replyToId,
    replyTo: message.replyTo,
    createdAt: message.createdAt.toISOString(),
    user: message.user,
    reactions: aggregateReactions(message.reactions),
  }
}

function aggregateReactions(reactions: { emoji: string; userId: string }[]): ReactionGroup[] {
  const groups = new Map<string, string[]>()
  for (const r of reactions) {
    const arr = groups.get(r.emoji) ?? []
    arr.push(r.userId)
    groups.set(r.emoji, arr)
  }
  return Array.from(groups, ([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
    userIds,
  }))
}
