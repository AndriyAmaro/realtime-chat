import { prisma } from '../config/database.js'
import type { Role } from '../generated/prisma/client.js'

// ============ ROOM REPOSITORY ============

export const roomRepository = {
  /** Create a room */
  async create(data: {
    name: string
    description?: string
    isPrivate: boolean
    inviteCode?: string
    ownerId: string
  }) {
    return prisma.room.create({
      data,
      select: roomSelect,
    })
  },

  /** Find room by ID with owner info */
  async findById(roomId: string) {
    return prisma.room.findUnique({
      where: { id: roomId },
      select: {
        ...roomSelect,
        inviteCode: true,
        members: {
          select: memberSelect,
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { members: true, messages: true } },
      },
    })
  },

  /** Find room by invite code */
  async findByInviteCode(inviteCode: string) {
    return prisma.room.findUnique({
      where: { inviteCode },
      select: roomSelect,
    })
  },

  /** List rooms where user is a member (paginated) */
  async findByUserId(userId: string, page: number, limit: number, search?: string) {
    const where = {
      members: { some: { userId } },
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        select: {
          ...roomSelect,
          _count: { select: { members: true, messages: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.room.count({ where }),
    ])

    return { rooms, total }
  },

  /** List public rooms for discovery (paginated) */
  async findPublic(page: number, limit: number, search?: string) {
    const where = {
      isPrivate: false,
      ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        select: {
          ...roomSelect,
          _count: { select: { members: true, messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.room.count({ where }),
    ])

    return { rooms, total }
  },

  /** Update room */
  async update(
    roomId: string,
    data: {
      name?: string
      description?: string | null
      isPrivate?: boolean
      inviteCode?: string | null
    }
  ) {
    return prisma.room.update({
      where: { id: roomId },
      data,
      select: roomSelect,
    })
  },

  /** Delete room */
  async delete(roomId: string) {
    return prisma.room.delete({ where: { id: roomId } })
  },

  /** Regenerate invite code */
  async updateInviteCode(roomId: string, inviteCode: string) {
    return prisma.room.update({
      where: { id: roomId },
      data: { inviteCode },
      select: { id: true, inviteCode: true },
    })
  },
}

// ============ MEMBER QUERIES (co-located) ============

export const roomMemberRepository = {
  /** Find membership for a user in a room */
  async findMembership(userId: string, roomId: string) {
    return prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    })
  },

  /** Add member to a room */
  async addMember(userId: string, roomId: string, role: Role = 'MEMBER') {
    return prisma.roomMember.create({
      data: { userId, roomId, role },
      select: memberSelect,
    })
  },

  /** Remove member from a room */
  async removeMember(userId: string, roomId: string) {
    return prisma.roomMember.delete({
      where: { userId_roomId: { userId, roomId } },
    })
  },

  /** Update member role */
  async updateRole(memberId: string, role: Role) {
    return prisma.roomMember.update({
      where: { id: memberId },
      data: { role },
      select: memberSelect,
    })
  },

  /** Find member by ID (with user info) */
  async findById(memberId: string) {
    return prisma.roomMember.findUnique({
      where: { id: memberId },
      select: memberSelect,
    })
  },

  /** List members for a room */
  async findByRoomId(roomId: string) {
    return prisma.roomMember.findMany({
      where: { roomId },
      select: memberSelect,
      orderBy: { joinedAt: 'asc' },
    })
  },

  /** Count members in a room */
  async countByRoomId(roomId: string) {
    return prisma.roomMember.count({ where: { roomId } })
  },
}

// ============ REUSABLE SELECTS ============

const roomSelect = {
  id: true,
  name: true,
  description: true,
  isPrivate: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
  owner: {
    select: { id: true, name: true, avatar: true },
  },
} as const

const memberSelect = {
  id: true,
  userId: true,
  roomId: true,
  role: true,
  joinedAt: true,
  user: {
    select: { id: true, name: true, email: true, avatar: true, status: true },
  },
} as const
