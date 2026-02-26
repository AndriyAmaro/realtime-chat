import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============ MOCKS ============

vi.mock('../../repositories/message.repository.js', () => ({
  messageRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByClientId: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    findByRoomId: vi.fn(),
    searchInRoom: vi.fn(),
    findSince: vi.fn(),
  },
}))

vi.mock('../../repositories/reaction.repository.js', () => ({
  reactionRepository: {
    toggle: vi.fn(),
    findByMessageId: vi.fn(),
  },
}))

vi.mock('../../repositories/room.repository.js', () => ({
  roomMemberRepository: {
    findMembership: vi.fn(),
  },
}))

// ============ IMPORTS (after mocks) ============

import { messageService } from '../message.service.js'
import { messageRepository } from '../../repositories/message.repository.js'
import { reactionRepository } from '../../repositories/reaction.repository.js'
import { roomMemberRepository } from '../../repositories/room.repository.js'

// ============ FACTORIES ============

function createMessageRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg-1',
    content: 'Hello world',
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

function createMembership(overrides: Record<string, unknown> = {}) {
  return {
    id: 'membership-1',
    userId: 'user-1',
    roomId: 'room-1',
    role: 'MEMBER' as const,
    joinedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

// ============ TESTS ============

describe('MessageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- send ----

  describe('send', () => {
    it('should send a text message and return formatted payload', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.create).mockResolvedValue(createMessageRecord() as never)

      const result = await messageService.send({
        content: 'Hello world',
        userId: 'user-1',
        roomId: 'room-1',
      })

      expect(roomMemberRepository.findMembership).toHaveBeenCalledWith('user-1', 'room-1')
      expect(messageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Hello world',
          type: 'TEXT',
          userId: 'user-1',
          roomId: 'room-1',
        })
      )
      expect(result).toMatchObject({
        id: 'msg-1',
        content: 'Hello world',
        type: 'TEXT',
        userId: 'user-1',
        roomId: 'room-1',
        reactions: [],
      })
    })

    it('should throw ForbiddenError if user is not a member', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)

      await expect(
        messageService.send({ content: 'Hello', userId: 'outsider', roomId: 'room-1' })
      ).rejects.toThrow('You are not a member of this room')

      expect(messageRepository.create).not.toHaveBeenCalled()
    })

    it('should return existing message for duplicate clientId (idempotency)', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findByClientId).mockResolvedValue(
        createMessageRecord({ id: 'existing-msg' }) as never
      )

      const result = await messageService.send({
        content: 'Hello',
        userId: 'user-1',
        roomId: 'room-1',
        clientId: 'client-123',
      })

      expect(result.id).toBe('existing-msg')
      expect(messageRepository.create).not.toHaveBeenCalled()
    })

    it('should validate replyToId exists in the same room', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findByClientId).mockResolvedValue(null)
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ id: 'reply-target', roomId: 'room-1' }) as never
      )
      vi.mocked(messageRepository.create).mockResolvedValue(
        createMessageRecord({ replyToId: 'reply-target' }) as never
      )

      const result = await messageService.send({
        content: 'Reply!',
        userId: 'user-1',
        roomId: 'room-1',
        replyToId: 'reply-target',
      })

      expect(messageRepository.findById).toHaveBeenCalledWith('reply-target')
      expect(result.replyToId).toBe('reply-target')
    })

    it('should throw NotFoundError for reply to message in different room', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findByClientId).mockResolvedValue(null)
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ roomId: 'other-room' }) as never
      )

      await expect(
        messageService.send({
          content: 'Reply!',
          userId: 'user-1',
          roomId: 'room-1',
          replyToId: 'msg-other-room',
        })
      ).rejects.toThrow('Reply target message not found')
    })

    it('should throw NotFoundError for reply to non-existent message', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findByClientId).mockResolvedValue(null)
      vi.mocked(messageRepository.findById).mockResolvedValue(null)

      await expect(
        messageService.send({
          content: 'Reply!',
          userId: 'user-1',
          roomId: 'room-1',
          replyToId: 'nonexistent',
        })
      ).rejects.toThrow('Reply target message not found')
    })
  })

  // ---- editMessage ----

  describe('editMessage', () => {
    it('should edit a text message (author only)', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(createMessageRecord() as never)
      vi.mocked(messageRepository.update).mockResolvedValue(
        createMessageRecord({ content: 'Edited', editedAt: new Date() }) as never
      )

      const result = await messageService.editMessage('user-1', 'room-1', 'msg-1', 'Edited')

      expect(messageRepository.update).toHaveBeenCalledWith('msg-1', {
        content: 'Edited',
        editedAt: expect.any(Date),
      })
      expect(result.content).toBe('Edited')
    })

    it('should throw ForbiddenError if not the author', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(createMessageRecord() as never)

      await expect(
        messageService.editMessage('other-user', 'room-1', 'msg-1', 'Edited')
      ).rejects.toThrow('Only the author can edit a message')
    })

    it('should throw ForbiddenError for non-TEXT messages', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ type: 'VOICE' }) as never
      )

      await expect(
        messageService.editMessage('user-1', 'room-1', 'msg-1', 'Edited')
      ).rejects.toThrow('Only text messages can be edited')
    })

    it('should throw NotFoundError for deleted message', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ deletedAt: new Date() }) as never
      )

      await expect(
        messageService.editMessage('user-1', 'room-1', 'msg-1', 'Edited')
      ).rejects.toThrow('Message not found')
    })

    it('should throw NotFoundError if message is in different room', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ roomId: 'other-room' }) as never
      )

      await expect(
        messageService.editMessage('user-1', 'room-1', 'msg-1', 'Edited')
      ).rejects.toThrow('Message not found')
    })
  })

  // ---- deleteMessage ----

  describe('deleteMessage', () => {
    it('should allow author to delete their own message', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(createMessageRecord() as never)
      vi.mocked(messageRepository.softDelete).mockResolvedValue(undefined as never)

      await messageService.deleteMessage('user-1', 'room-1', 'msg-1')

      expect(messageRepository.softDelete).toHaveBeenCalledWith('msg-1')
    })

    it('should allow admin to delete any message', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ userId: 'other-user' }) as never
      )
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(
        createMembership({ role: 'ADMIN' }) as never
      )
      vi.mocked(messageRepository.softDelete).mockResolvedValue(undefined as never)

      await messageService.deleteMessage('user-1', 'room-1', 'msg-1')

      expect(messageRepository.softDelete).toHaveBeenCalledWith('msg-1')
    })

    it('should throw ForbiddenError for non-author non-admin', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ userId: 'other-user' }) as never
      )
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(
        createMembership({ role: 'MEMBER' }) as never
      )

      await expect(messageService.deleteMessage('user-1', 'room-1', 'msg-1')).rejects.toThrow(
        'Only the author or an admin can delete this message'
      )
    })

    it('should throw NotFoundError for already deleted message', async () => {
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ deletedAt: new Date() }) as never
      )

      await expect(messageService.deleteMessage('user-1', 'room-1', 'msg-1')).rejects.toThrow(
        'Message not found'
      )
    })
  })

  // ---- toggleReaction ----

  describe('toggleReaction', () => {
    it('should toggle reaction and return aggregated groups', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findById).mockResolvedValue(createMessageRecord() as never)
      vi.mocked(reactionRepository.toggle).mockResolvedValue(true)
      vi.mocked(reactionRepository.findByMessageId).mockResolvedValue([
        { emoji: '👍', userId: 'user-1' },
        { emoji: '👍', userId: 'user-2' },
        { emoji: '❤️', userId: 'user-1' },
      ])

      const result = await messageService.toggleReaction('user-1', 'room-1', 'msg-1', '👍')

      expect(reactionRepository.toggle).toHaveBeenCalledWith('user-1', 'msg-1', '👍')
      expect(result).toEqual([
        { emoji: '👍', count: 2, userIds: ['user-1', 'user-2'] },
        { emoji: '❤️', count: 1, userIds: ['user-1'] },
      ])
    })

    it('should throw ForbiddenError if not a member', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)

      await expect(
        messageService.toggleReaction('outsider', 'room-1', 'msg-1', '👍')
      ).rejects.toThrow('You are not a member of this room')
    })

    it('should throw NotFoundError for deleted message', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findById).mockResolvedValue(
        createMessageRecord({ deletedAt: new Date() }) as never
      )

      await expect(
        messageService.toggleReaction('user-1', 'room-1', 'msg-1', '👍')
      ).rejects.toThrow('Message not found')
    })
  })

  // ---- getHistory ----

  describe('getHistory', () => {
    it('should return formatted messages with hasMore flag', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findByRoomId).mockResolvedValue({
        messages: [createMessageRecord()],
        hasMore: true,
      } as never)

      const result = await messageService.getHistory('user-1', 'room-1')

      expect(result.messages).toHaveLength(1)
      expect(result.hasMore).toBe(true)
      expect(result.messages[0]).toMatchObject({ id: 'msg-1', content: 'Hello world' })
    })

    it('should throw ForbiddenError if not a member', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)

      await expect(messageService.getHistory('outsider', 'room-1')).rejects.toThrow(
        'You are not a member of this room'
      )
    })

    it('should cap limit at MAX_HISTORY_LIMIT (100)', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.findByRoomId).mockResolvedValue({
        messages: [],
        hasMore: false,
      } as never)

      await messageService.getHistory('user-1', 'room-1', undefined, 500)

      expect(messageRepository.findByRoomId).toHaveBeenCalledWith('room-1', 100, undefined)
    })
  })

  // ---- search ----

  describe('search', () => {
    it('should search messages and return with pagination meta', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(createMembership() as never)
      vi.mocked(messageRepository.searchInRoom).mockResolvedValue({
        messages: [createMessageRecord()],
        total: 1,
      } as never)

      const result = await messageService.search('user-1', 'room-1', 'hello', 1, 20)

      expect(messageRepository.searchInRoom).toHaveBeenCalledWith('room-1', 'hello', 20, 0)
      expect(result.messages).toHaveLength(1)
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 })
    })

    it('should throw ForbiddenError if not a member', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)

      await expect(messageService.search('outsider', 'room-1', 'hello')).rejects.toThrow(
        'You are not a member of this room'
      )
    })
  })
})
