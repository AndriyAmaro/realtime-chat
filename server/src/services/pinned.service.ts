import { pinnedMessageRepository } from '../repositories/pinnedMessage.repository.js'
import { messageRepository } from '../repositories/message.repository.js'
import { roomRepository, roomMemberRepository } from '../repositories/room.repository.js'
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/index.js'
import { formatMessage } from './message.service.js'
import type { MessagePayload } from '../types/socket.js'

// ============ PINNED MESSAGE SERVICE ============

export const pinnedService = {
  /** Pin a message (admin/owner only) */
  async pin(messageId: string, roomId: string, userId: string): Promise<MessagePayload> {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    assertAdminOrOwner(room, userId)

    const message = await messageRepository.findById(messageId)
    if (!message || message.roomId !== roomId) {
      throw new NotFoundError('Mensagem')
    }

    if (message.deletedAt) {
      throw new ForbiddenError('Não é possível fixar uma mensagem excluída')
    }

    const existing = await pinnedMessageRepository.findOne(messageId, roomId)
    if (existing) throw new ConflictError('Mensagem já está fixada')

    await pinnedMessageRepository.pin(messageId, roomId, userId)
    return formatMessage(message)
  },

  /** Unpin a message (admin/owner only) */
  async unpin(messageId: string, roomId: string, userId: string): Promise<void> {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    assertAdminOrOwner(room, userId)

    const existing = await pinnedMessageRepository.findOne(messageId, roomId)
    if (!existing) throw new NotFoundError('Mensagem fixada')

    await pinnedMessageRepository.unpin(messageId, roomId)
  },

  /** List all pinned messages in a room */
  async listPinned(roomId: string, userId: string): Promise<MessagePayload[]> {
    const membership = await roomMemberRepository.findMembership(userId, roomId)
    if (!membership) throw new ForbiddenError('Você não é membro desta sala')

    const pinned = await pinnedMessageRepository.findByRoom(roomId)
    return pinned.map((p) => formatMessage(p.message))
  },
}

// ============ HELPERS ============

type RoomWithMembers = NonNullable<Awaited<ReturnType<typeof roomRepository.findById>>>

function assertAdminOrOwner(room: RoomWithMembers, userId: string): void {
  if (room.ownerId === userId) return

  const membership = room.members.find((m) => m.userId === userId)
  if (!membership || membership.role !== 'ADMIN') {
    throw new ForbiddenError('Apenas o dono ou administradores podem realizar esta ação')
  }
}
