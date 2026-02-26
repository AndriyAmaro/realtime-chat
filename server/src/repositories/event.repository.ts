import { prisma } from '../config/database.js'
import type { EventStatus } from '../generated/prisma/client.js'

// ============ EVENT REPOSITORY ============

const eventSelect = {
  id: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  roomId: true,
  createdBy: true,
  status: true,
  createdAt: true,
  creator: {
    select: { id: true, name: true, avatar: true },
  },
  invites: {
    select: {
      id: true,
      userId: true,
      status: true,
      respondedAt: true,
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  },
} as const

export const eventRepository = {
  async create(data: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    roomId: string
    createdBy: string
  }) {
    return prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        roomId: data.roomId,
        createdBy: data.createdBy,
      },
      select: eventSelect,
    })
  },

  async findById(eventId: string) {
    return prisma.event.findUnique({
      where: { id: eventId },
      select: eventSelect,
    })
  },

  async findByRoom(roomId: string) {
    return prisma.event.findMany({
      where: {
        roomId,
        status: 'SCHEDULED',
      },
      select: eventSelect,
      orderBy: { startTime: 'asc' },
    })
  },

  async update(
    eventId: string,
    data: { title?: string; description?: string; startTime?: Date; endTime?: Date }
  ) {
    return prisma.event.update({
      where: { id: eventId },
      data,
      select: eventSelect,
    })
  },

  async updateStatus(eventId: string, status: EventStatus) {
    return prisma.event.update({
      where: { id: eventId },
      data: { status },
      select: eventSelect,
    })
  },
}

// ============ EVENT INVITE REPOSITORY ============

export const eventInviteRepository = {
  async createMany(eventId: string, userIds: string[]) {
    await prisma.eventInvite.createMany({
      data: userIds.map((userId) => ({ eventId, userId })),
      skipDuplicates: true,
    })

    return prisma.eventInvite.findMany({
      where: { eventId },
      select: {
        id: true,
        userId: true,
        status: true,
        respondedAt: true,
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })
  },

  async respond(eventId: string, userId: string, status: 'ACCEPTED' | 'DECLINED') {
    return prisma.eventInvite.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status, respondedAt: new Date() },
      select: {
        id: true,
        userId: true,
        status: true,
        respondedAt: true,
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })
  },

  async findByEventAndUser(eventId: string, userId: string) {
    return prisma.eventInvite.findUnique({
      where: { eventId_userId: { eventId, userId } },
    })
  },
}
