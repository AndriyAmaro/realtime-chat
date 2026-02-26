import { prisma } from '../config/index.js'
import { userRepository } from '../repositories/user.repository.js'
import { friendshipRepository } from '../repositories/friendship.repository.js'
import { NotFoundError } from '../errors/index.js'

export const userService = {
  async getProfile(targetUserId: string, requestingUserId: string) {
    const user = await userRepository.findByIdPublic(targetUserId)
    if (!user) throw new NotFoundError('Usuário')

    // Shared rooms
    const sharedRooms = await prisma.room.findMany({
      where: {
        AND: [
          { members: { some: { userId: targetUserId } } },
          { members: { some: { userId: requestingUserId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        isPrivate: true,
        _count: { select: { members: true } },
      },
      take: 10,
    })

    // Friendship status
    const friendship = await friendshipRepository.findBetween(requestingUserId, targetUserId)

    return {
      ...user,
      sharedRooms,
      friendship: friendship
        ? {
            id: friendship.id,
            status: friendship.status,
            isSender: friendship.senderId === requestingUserId,
          }
        : null,
    }
  },

  async search(query: string, userId: string) {
    return userRepository.searchByName(query, userId)
  },
}
