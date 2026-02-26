import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============ MOCKS ============

vi.mock('../../repositories/pinnedMessage.repository.js', () => ({
  pinnedMessageRepository: {
    pin: vi.fn(),
    unpin: vi.fn(),
    findOne: vi.fn(),
    findByRoom: vi.fn(),
  },
}))

vi.mock('../../repositories/message.repository.js', () => ({
  messageRepository: {
    findById: vi.fn(),
  },
}))

vi.mock('../../repositories/room.repository.js', () => ({
  roomRepository: {
    findById: vi.fn(),
  },
  roomMemberRepository: {
    findMembership: vi.fn(),
  },
}))

// ============ IMPORTS (after mocks) ============

import { pinnedService } from '../pinned.service.js'
import { pinnedMessageRepository } from '../../repositories/pinnedMessage.repository.js'
import { messageRepository } from '../../repositories/message.repository.js'
import { roomRepository, roomMemberRepository } from '../../repositories/room.repository.js'

// ============ FACTORIES ============

function createRoomRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'room-1',
    name: 'Test Room',
    description: null,
    isPrivate: false,
    inviteCode: null,
    ownerId: 'owner-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    members: [
      { userId: 'owner-1', role: 'ADMIN' },
      { userId: 'admin-1', role: 'ADMIN' },
      { userId: 'member-1', role: 'MEMBER' },
    ],
    ...overrides,
  }
}

function createMessageRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg-1',
    content: 'Pinnable message',
    type: 'TEXT' as const,
    fileUrl: null,
    duration: null,
    editedAt: null,
    deletedAt: null,
    userId: 'user-1',
    roomId: 'room-1',
    replyToId: null,
    createdAt: new Date('2026-01-01'),
    user: { id: 'user-1', name: 'Test User', avatar: null },
    replyTo: null,
    reactions: [],
    ...overrides,
  }
}

function createPinnedRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pinned-1',
    messageId: 'msg-1',
    roomId: 'room-1',
    pinnedBy: 'admin-1',
    pinnedAt: new Date('2026-01-01'),
    message: createMessageRecord(),
    ...overrides,
  }
}

// ============ TESTS ============

describe('PinnedService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- pin ----

  describe('pin', () => {
    it('should pin a message (admin)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(messageRepository.findById).mockResolvedValue(createMessageRecord() as never)
      vi.mocked(pinnedMessageRepository.findOne).mockResolvedValue(null)
      vi.mocked(pinnedMessageRepository.pin).mockResolvedValue(createPinnedRecord() as never)

      const result = await pinnedService.pin('msg-1', 'room-1', 'admin-1')

      expect(pinnedMessageRepository.pin).toHaveBeenCalledWith('msg-1', 'room-1', 'admin-1')
      expect(result).toMatchObject({ id: 'msg-1', content: 'Pinnable message' })
    })

    it('should pin a message (owner)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(messageRepository.findById).mockResolvedValue(createMessageRecord() as never)
      vi.mocked(pinnedMessageRepository.findOne).mockResolvedValue(null)
      vi.mocked(pinnedMessageRepository.pin).mockResolvedValue(createPinnedRecord() as never)

      const result = await pinnedService.pin('msg-1', 'room-1', 'owner-1')

      expect(result).toMatchObject({ id: 'msg-1' })
    })

    it('should throw ForbiddenError for regular member', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)

      await expect(pinnedService.pin('msg-1', 'room-1', 'member-1')).rejects.toThrow(
        'Apenas o dono ou administradores podem realizar esta ação'
      )

      expect(pinnedMessageRepository.pin).not.toHaveBeenCalled()
    })

    it('should throw NotFoundError for non-existent room', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(null)

      await expect(pinnedService.pin('msg-1', 'nonexistent', 'admin-1')).rejects.toThrow('Sala')
    })

    it('should throw NotFoundError for message in different room', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ roomId: 'other-room' }) as never
      )

      await expect(pinnedService.pin('msg-1', 'room-1', 'admin-1')).rejects.toThrow('Mensagem')
    })

    it('should throw ForbiddenError for deleted message', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ deletedAt: new Date() }) as never
      )

      await expect(pinnedService.pin('msg-1', 'room-1', 'admin-1')).rejects.toThrow(
        'Não é possível fixar uma mensagem excluída'
      )
    })

    it('should throw ConflictError if already pinned', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(messageRepository.findById).mockResolvedValue(createMessageRecord() as never)
      vi.mocked(pinnedMessageRepository.findOne).mockResolvedValue(createPinnedRecord() as never)

      await expect(pinnedService.pin('msg-1', 'room-1', 'admin-1')).rejects.toThrow(
        'Mensagem já está fixada'
      )
    })
  })

  // ---- unpin ----

  describe('unpin', () => {
    it('should unpin a message (admin)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(pinnedMessageRepository.findOne).mockResolvedValue(createPinnedRecord() as never)
      vi.mocked(pinnedMessageRepository.unpin).mockResolvedValue(undefined as never)

      await pinnedService.unpin('msg-1', 'room-1', 'admin-1')

      expect(pinnedMessageRepository.unpin).toHaveBeenCalledWith('msg-1', 'room-1')
    })

    it('should throw ForbiddenError for regular member', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)

      await expect(pinnedService.unpin('msg-1', 'room-1', 'member-1')).rejects.toThrow(
        'Apenas o dono ou administradores podem realizar esta ação'
      )
    })

    it('should throw NotFoundError if not pinned', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(pinnedMessageRepository.findOne).mockResolvedValue(null)

      await expect(pinnedService.unpin('msg-1', 'room-1', 'admin-1')).rejects.toThrow(
        'Mensagem fixada'
      )
    })
  })

  // ---- listPinned ----

  describe('listPinned', () => {
    it('should return formatted pinned messages', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue({
        id: 'membership-1',
        role: 'MEMBER',
      } as never)
      vi.mocked(pinnedMessageRepository.findByRoom).mockResolvedValue([
        createPinnedRecord(),
      ] as never)

      const result = await pinnedService.listPinned('room-1', 'member-1')

      expect(pinnedMessageRepository.findByRoom).toHaveBeenCalledWith('room-1')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'msg-1', content: 'Pinnable message' })
    })

    it('should throw ForbiddenError if not a member', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)

      await expect(pinnedService.listPinned('room-1', 'outsider')).rejects.toThrow(
        'Você não é membro desta sala'
      )
    })
  })
})
