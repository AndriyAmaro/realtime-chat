import { randomBytes } from 'crypto'
import { roomRepository, roomMemberRepository } from '../repositories/room.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/index.js'
import type { CreateRoomInput, UpdateRoomInput, ListRoomsQuery } from '../types/room.js'
import type { Role } from '../generated/prisma/client.js'

// ============ ROOM SERVICE ============

export const roomService = {
  /** Create room and add creator as ADMIN */
  async createRoom(userId: string, input: CreateRoomInput) {
    const inviteCode = input.isPrivate ? generateInviteCode() : null

    const room = await roomRepository.create({
      name: input.name,
      description: input.description,
      isPrivate: input.isPrivate,
      inviteCode: inviteCode ?? undefined,
      ownerId: userId,
    })

    // Add owner as ADMIN member
    await roomMemberRepository.addMember(userId, room.id, 'ADMIN')

    return { ...room, inviteCode }
  },

  /** Get room details (must be member or room is public) */
  async getRoom(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    // Check access: must be member or room is public
    const isMember = room.members.some((m) => m.userId === userId)
    if (!isMember && room.isPrivate) {
      throw new ForbiddenError('Você não tem acesso a esta sala')
    }

    // Hide invite code from non-admins
    const membership = room.members.find((m) => m.userId === userId)
    const canSeeInviteCode = room.ownerId === userId || membership?.role === 'ADMIN'

    return {
      ...room,
      inviteCode: canSeeInviteCode ? room.inviteCode : undefined,
    }
  },

  /** List user's rooms */
  async listMyRooms(userId: string, query: ListRoomsQuery) {
    const { rooms, total } = await roomRepository.findByUserId(
      userId,
      query.page,
      query.limit,
      query.search
    )

    return {
      rooms,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        hasMore: query.page * query.limit < total,
      },
    }
  },

  /** List public rooms for discovery */
  async listPublicRooms(query: ListRoomsQuery) {
    const { rooms, total } = await roomRepository.findPublic(query.page, query.limit, query.search)

    return {
      rooms,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        hasMore: query.page * query.limit < total,
      },
    }
  },

  /** Update room (owner or admin only) */
  async updateRoom(roomId: string, userId: string, input: UpdateRoomInput) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    assertAdminOrOwner(room, userId)

    // If toggling to private and no invite code, generate one
    const updateData: Record<string, unknown> = { ...input }
    if (input.isPrivate && !room.isPrivate) {
      updateData.inviteCode = generateInviteCode()
    }
    // If toggling to public, remove invite code
    if (input.isPrivate === false && room.isPrivate) {
      updateData.inviteCode = null
    }

    return roomRepository.update(roomId, updateData)
  },

  /** Delete room (owner only) */
  async deleteRoom(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    if (room.ownerId !== userId) {
      throw new ForbiddenError('Apenas o dono pode excluir a sala')
    }

    await roomRepository.delete(roomId)
  },

  /** Join a room (public or via invite code) */
  async joinRoom(roomId: string, userId: string, inviteCode?: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    // Check if already a member
    const existing = await roomMemberRepository.findMembership(userId, roomId)
    if (existing) throw new ConflictError('Você já é membro desta sala')

    // Private rooms require valid invite code
    if (room.isPrivate) {
      if (!inviteCode || inviteCode !== room.inviteCode) {
        throw new ForbiddenError('Código de convite inválido')
      }
    }

    return roomMemberRepository.addMember(userId, roomId)
  },

  /** Leave a room (owner cannot leave, must delete or transfer) */
  async leaveRoom(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    if (room.ownerId === userId) {
      throw new ForbiddenError(
        'O dono não pode sair da sala. Exclua a sala ou transfira a propriedade.'
      )
    }

    const membership = await roomMemberRepository.findMembership(userId, roomId)
    if (!membership) throw new NotFoundError('Membro')

    await roomMemberRepository.removeMember(userId, roomId)
  },

  /** List room members */
  async listMembers(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    // Must be member to see members of private rooms
    const isMember = room.members.some((m) => m.userId === userId)
    if (!isMember && room.isPrivate) {
      throw new ForbiddenError('Você não tem acesso a esta sala')
    }

    return roomMemberRepository.findByRoomId(roomId)
  },

  /** Update member role (admin/owner only) */
  async updateMemberRole(roomId: string, memberId: string, userId: string, role: Role) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    assertAdminOrOwner(room, userId)

    const member = await roomMemberRepository.findById(memberId)
    if (!member || member.roomId !== roomId) {
      throw new NotFoundError('Membro')
    }

    // Cannot change own role
    if (member.userId === userId) {
      throw new ForbiddenError('Você não pode alterar seu próprio cargo')
    }

    // Cannot change owner's role
    if (member.userId === room.ownerId) {
      throw new ForbiddenError('Não é possível alterar o cargo do dono')
    }

    return roomMemberRepository.updateRole(memberId, role)
  },

  /** Remove member (admin/owner only) */
  async removeMember(roomId: string, memberId: string, userId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    assertAdminOrOwner(room, userId)

    const member = await roomMemberRepository.findById(memberId)
    if (!member || member.roomId !== roomId) {
      throw new NotFoundError('Membro')
    }

    // Cannot remove self (use leave)
    if (member.userId === userId) {
      throw new ForbiddenError('Use a rota de sair para deixar a sala')
    }

    // Cannot remove the owner
    if (member.userId === room.ownerId) {
      throw new ForbiddenError('Não é possível remover o dono da sala')
    }

    // Members cannot remove admins
    const actorMembership = room.members.find((m) => m.userId === userId)
    if (actorMembership?.role === 'ADMIN' && room.ownerId !== userId && member.role === 'ADMIN') {
      throw new ForbiddenError('Apenas o dono pode remover administradores')
    }

    await roomMemberRepository.removeMember(member.userId, roomId)
  },

  /** Add member to room (admin/owner only) */
  async addMember(roomId: string, targetUserId: string, requestingUserId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    assertAdminOrOwner(room, requestingUserId)

    const targetUser = await userRepository.findById(targetUserId)
    if (!targetUser) throw new NotFoundError('Usuário')

    const existing = await roomMemberRepository.findMembership(targetUserId, roomId)
    if (existing) throw new ConflictError('Usuário já é membro desta sala')

    return roomMemberRepository.addMember(targetUserId, roomId)
  },

  /** Regenerate invite code (admin/owner only) */
  async regenerateInviteCode(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    if (!room.isPrivate) {
      throw new ForbiddenError('Salas públicas não possuem código de convite')
    }

    assertAdminOrOwner(room, userId)

    const newCode = generateInviteCode()
    return roomRepository.updateInviteCode(roomId, newCode)
  },
}

// ============ HELPERS ============

function generateInviteCode(): string {
  return randomBytes(4).toString('hex') // 8 char hex code
}

type RoomWithMembers = NonNullable<Awaited<ReturnType<typeof roomRepository.findById>>>

function assertAdminOrOwner(room: RoomWithMembers, userId: string): void {
  if (room.ownerId === userId) return

  const membership = room.members.find((m) => m.userId === userId)
  if (!membership || membership.role !== 'ADMIN') {
    throw new ForbiddenError('Apenas o dono ou administradores podem realizar esta ação')
  }
}
