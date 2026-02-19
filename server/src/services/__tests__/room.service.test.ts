import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============ MOCKS ============

vi.mock('../../repositories/room.repository.js', () => ({
  roomRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPublic: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateInviteCode: vi.fn(),
  },
  roomMemberRepository: {
    addMember: vi.fn(),
    findMembership: vi.fn(),
    removeMember: vi.fn(),
    findByRoomId: vi.fn(),
    findById: vi.fn(),
    updateRole: vi.fn(),
    findRoomIdsByUserId: vi.fn(),
    updateLastReadAt: vi.fn(),
    getReadReceipts: vi.fn(),
  },
}))

// ============ IMPORTS ============

import { roomService } from '../room.service.js'
import { roomRepository, roomMemberRepository } from '../../repositories/room.repository.js'

// ============ FACTORIES ============

function createRoomRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'room-1',
    name: 'Test Room',
    description: 'A test room',
    isPrivate: false,
    inviteCode: null,
    ownerId: 'owner-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    members: [
      { userId: 'owner-1', role: 'ADMIN' },
      { userId: 'member-1', role: 'MEMBER' },
    ],
    ...overrides,
  }
}

function createMemberRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'membership-1',
    userId: 'member-1',
    roomId: 'room-1',
    role: 'MEMBER' as const,
    joinedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

// ============ TESTS ============

describe('RoomService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- createRoom ----

  describe('createRoom', () => {
    it('should create a public room and add creator as ADMIN', async () => {
      const createdRoom = { id: 'new-room', name: 'My Room', ownerId: 'user-1' }
      vi.mocked(roomRepository.create).mockResolvedValue(createdRoom as never)
      vi.mocked(roomMemberRepository.addMember).mockResolvedValue(undefined as never)

      const result = await roomService.createRoom('user-1', {
        name: 'My Room',
        isPrivate: false,
      })

      expect(roomRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Room',
          isPrivate: false,
          ownerId: 'user-1',
        })
      )
      expect(roomMemberRepository.addMember).toHaveBeenCalledWith('user-1', 'new-room', 'ADMIN')
      expect(result.inviteCode).toBeNull()
    })

    it('should create a private room with an invite code', async () => {
      const createdRoom = { id: 'private-room', name: 'Secret Room', ownerId: 'user-1' }
      vi.mocked(roomRepository.create).mockResolvedValue(createdRoom as never)
      vi.mocked(roomMemberRepository.addMember).mockResolvedValue(undefined as never)

      const result = await roomService.createRoom('user-1', {
        name: 'Secret Room',
        isPrivate: true,
      })

      // Invite code should be an 8-character hex string
      expect(result.inviteCode).toMatch(/^[a-f0-9]{8}$/)
      expect(roomRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Secret Room',
          isPrivate: true,
          inviteCode: expect.stringMatching(/^[a-f0-9]{8}$/),
        })
      )
    })
  })

  // ---- joinRoom ----

  describe('joinRoom', () => {
    it('should allow joining a public room without invite code', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)
      vi.mocked(roomMemberRepository.addMember).mockResolvedValue(createMemberRecord() as never)

      await roomService.joinRoom('room-1', 'new-user')

      expect(roomMemberRepository.addMember).toHaveBeenCalledWith('new-user', 'room-1')
    })

    it('should allow joining a private room with valid invite code', async () => {
      const privateRoom = createRoomRecord({
        isPrivate: true,
        inviteCode: 'abc12345',
      })
      vi.mocked(roomRepository.findById).mockResolvedValue(privateRoom as never)
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)
      vi.mocked(roomMemberRepository.addMember).mockResolvedValue(createMemberRecord() as never)

      await roomService.joinRoom('room-1', 'new-user', 'abc12345')

      expect(roomMemberRepository.addMember).toHaveBeenCalledWith('new-user', 'room-1')
    })

    it('should throw ForbiddenError for private room with wrong invite code', async () => {
      const privateRoom = createRoomRecord({
        isPrivate: true,
        inviteCode: 'abc12345',
      })
      vi.mocked(roomRepository.findById).mockResolvedValue(privateRoom as never)
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)

      await expect(roomService.joinRoom('room-1', 'new-user', 'wrongcode')).rejects.toThrow(
        'Código de convite inválido'
      )

      expect(roomMemberRepository.addMember).not.toHaveBeenCalled()
    })

    it('should throw ConflictError if user is already a member', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(
        createMemberRecord() as never
      )

      await expect(roomService.joinRoom('room-1', 'member-1')).rejects.toThrow(
        'Você já é membro desta sala'
      )
    })

    it('should throw NotFoundError for non-existent room', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(null)

      await expect(roomService.joinRoom('nonexistent', 'user-1')).rejects.toThrow()
    })
  })

  // ---- leaveRoom ----

  describe('leaveRoom', () => {
    it('should allow a non-owner member to leave', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(
        createMemberRecord() as never
      )
      vi.mocked(roomMemberRepository.removeMember).mockResolvedValue(undefined as never)

      await roomService.leaveRoom('room-1', 'member-1')

      expect(roomMemberRepository.removeMember).toHaveBeenCalledWith('member-1', 'room-1')
    })

    it('should throw ForbiddenError when owner tries to leave', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)

      await expect(roomService.leaveRoom('room-1', 'owner-1')).rejects.toThrow(
        'O dono não pode sair da sala'
      )

      expect(roomMemberRepository.removeMember).not.toHaveBeenCalled()
    })
  })

  // ---- deleteRoom ----

  describe('deleteRoom', () => {
    it('should allow the owner to delete the room', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(roomRepository.delete).mockResolvedValue(undefined as never)

      await roomService.deleteRoom('room-1', 'owner-1')

      expect(roomRepository.delete).toHaveBeenCalledWith('room-1')
    })

    it('should throw ForbiddenError when non-owner tries to delete', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)

      await expect(roomService.deleteRoom('room-1', 'member-1')).rejects.toThrow(
        'Apenas o dono pode excluir a sala'
      )

      expect(roomRepository.delete).not.toHaveBeenCalled()
    })
  })

  // ---- getRoom ----

  describe('getRoom', () => {
    it('should return room details for a member', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)

      const result = await roomService.getRoom('room-1', 'member-1')

      expect(result).toMatchObject({ id: 'room-1', name: 'Test Room' })
    })

    it('should hide invite code from non-admin members', async () => {
      const room = createRoomRecord({ isPrivate: true, inviteCode: 'secret123' })
      vi.mocked(roomRepository.findById).mockResolvedValue(room as never)

      const result = await roomService.getRoom('room-1', 'member-1')

      expect(result.inviteCode).toBeUndefined()
    })

    it('should show invite code to admin/owner', async () => {
      const room = createRoomRecord({ isPrivate: true, inviteCode: 'secret123' })
      vi.mocked(roomRepository.findById).mockResolvedValue(room as never)

      const result = await roomService.getRoom('room-1', 'owner-1')

      expect(result.inviteCode).toBe('secret123')
    })

    it('should throw ForbiddenError for non-member accessing private room', async () => {
      const room = createRoomRecord({ isPrivate: true })
      vi.mocked(roomRepository.findById).mockResolvedValue(room as never)

      await expect(roomService.getRoom('room-1', 'outsider')).rejects.toThrow(
        'Você não tem acesso a esta sala'
      )
    })
  })
})
