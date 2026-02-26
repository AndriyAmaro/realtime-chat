import { prisma } from '../config/index.js'
import type { FriendshipStatus } from '../generated/prisma/client.js'

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  bio: true,
  status: true,
  createdAt: true,
} as const

export const friendshipRepository = {
  findBetween(userA: string, userB: string) {
    return prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      },
      include: {
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
    })
  },

  create(senderId: string, receiverId: string) {
    return prisma.friendship.create({
      data: { senderId, receiverId, status: 'PENDING' },
      include: {
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
    })
  },

  findById(id: string) {
    return prisma.friendship.findUnique({
      where: { id },
      include: {
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
    })
  },

  updateStatus(id: string, status: FriendshipStatus) {
    return prisma.friendship.update({
      where: { id },
      data: { status },
      include: {
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
    })
  },

  delete(id: string) {
    return prisma.friendship.delete({ where: { id } })
  },

  findFriends(userId: string) {
    return prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
      orderBy: { updatedAt: 'desc' },
    })
  },

  findPendingReceived(userId: string) {
    return prisma.friendship.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findPendingSent(userId: string) {
    return prisma.friendship.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: {
        sender: { select: userSelect },
        receiver: { select: userSelect },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  countPendingReceived(userId: string) {
    return prisma.friendship.count({
      where: { receiverId: userId, status: 'PENDING' },
    })
  },
}
