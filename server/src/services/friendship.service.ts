import { friendshipRepository } from '../repositories/friendship.repository.js'
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/index.js'
import { getIO } from '../config/socket.js'
import { socketRegistry } from './socketRegistry.js'

export const friendshipService = {
  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new ForbiddenError('Você não pode adicionar a si mesmo')
    }

    const existing = await friendshipRepository.findBetween(senderId, receiverId)

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new ConflictError('Vocês já são amigos')
      }
      if (existing.status === 'PENDING') {
        // If I'm the receiver of a pending request, auto-accept
        if (existing.receiverId === senderId) {
          return this.respondToRequest(existing.id, senderId, 'accept')
        }
        throw new ConflictError('Pedido de amizade já enviado')
      }
      // DECLINED — allow re-request by deleting old and creating new
      await friendshipRepository.delete(existing.id)
    }

    const friendship = await friendshipRepository.create(senderId, receiverId)

    // Notify receiver via socket
    const io = getIO()
    if (io) {
      for (const sid of socketRegistry.getSocketIds(receiverId)) {
        io.to(sid).emit('friend:request_received', { friendship })
      }
    }

    return friendship
  },

  async respondToRequest(friendshipId: string, userId: string, action: 'accept' | 'decline') {
    const friendship = await friendshipRepository.findById(friendshipId)
    if (!friendship) throw new NotFoundError('Pedido de amizade')

    if (friendship.receiverId !== userId) {
      throw new ForbiddenError('Apenas o destinatário pode responder ao pedido')
    }

    if (friendship.status !== 'PENDING') {
      throw new ConflictError('Este pedido já foi respondido')
    }

    const status = action === 'accept' ? ('ACCEPTED' as const) : ('DECLINED' as const)
    const updated = await friendshipRepository.updateStatus(friendshipId, status)

    // Notify sender via socket
    if (action === 'accept') {
      const io = getIO()
      if (io) {
        for (const sid of socketRegistry.getSocketIds(friendship.senderId)) {
          io.to(sid).emit('friend:request_accepted', { friendship: updated })
        }
      }
    }

    return updated
  },

  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await friendshipRepository.findById(friendshipId)
    if (!friendship) throw new NotFoundError('Amizade')

    if (friendship.senderId !== userId && friendship.receiverId !== userId) {
      throw new ForbiddenError('Você não faz parte desta amizade')
    }

    await friendshipRepository.delete(friendshipId)

    // Notify the other user via socket
    const otherId = friendship.senderId === userId ? friendship.receiverId : friendship.senderId
    const io = getIO()
    if (io) {
      for (const sid of socketRegistry.getSocketIds(otherId)) {
        io.to(sid).emit('friend:removed', { friendshipId, userId })
      }
    }
  },

  async listFriends(userId: string) {
    return friendshipRepository.findFriends(userId)
  },

  async listPendingReceived(userId: string) {
    return friendshipRepository.findPendingReceived(userId)
  },

  async listPendingSent(userId: string) {
    return friendshipRepository.findPendingSent(userId)
  },

  async countPendingReceived(userId: string) {
    return friendshipRepository.countPendingReceived(userId)
  },
}
