import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============ MOCKS ============

vi.mock('../../repositories/friendship.repository.js', () => ({
  friendshipRepository: {
    findBetween: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
    findFriends: vi.fn(),
    findPendingReceived: vi.fn(),
    findPendingSent: vi.fn(),
    countPendingReceived: vi.fn(),
  },
}))

vi.mock('../../config/socket.js', () => ({
  getIO: vi.fn(),
}))

vi.mock('../socketRegistry.js', () => ({
  socketRegistry: {
    getSocketIds: vi.fn().mockReturnValue([]),
  },
}))

// ============ IMPORTS (after mocks) ============

import { friendshipService } from '../friendship.service.js'
import { friendshipRepository } from '../../repositories/friendship.repository.js'
import { getIO } from '../../config/socket.js'
import { socketRegistry } from '../socketRegistry.js'

// ============ FACTORIES ============

function createFriendshipRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'friendship-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    status: 'PENDING' as const,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    sender: {
      id: 'user-1',
      name: 'User One',
      email: 'one@test.com',
      avatar: null,
      bio: null,
      status: 'ONLINE' as const,
      createdAt: new Date(),
    },
    receiver: {
      id: 'user-2',
      name: 'User Two',
      email: 'two@test.com',
      avatar: null,
      bio: null,
      status: 'ONLINE' as const,
      createdAt: new Date(),
    },
    ...overrides,
  }
}

function mockIO() {
  const emitFn = vi.fn()
  const toFn = vi.fn().mockReturnValue({ emit: emitFn })
  vi.mocked(getIO).mockReturnValue({ to: toFn } as never)
  return { toFn, emitFn }
}

// ============ TESTS ============

describe('FriendshipService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(socketRegistry.getSocketIds).mockReturnValue([])
  })

  // ---- sendRequest ----

  describe('sendRequest', () => {
    it('should create a friend request and notify receiver via socket', async () => {
      vi.mocked(friendshipRepository.findBetween).mockResolvedValue(null)
      vi.mocked(friendshipRepository.create).mockResolvedValue(createFriendshipRecord() as never)
      vi.mocked(socketRegistry.getSocketIds).mockReturnValue(['socket-1'])
      const { toFn, emitFn } = mockIO()

      const result = await friendshipService.sendRequest('user-1', 'user-2')

      expect(friendshipRepository.create).toHaveBeenCalledWith('user-1', 'user-2')
      expect(toFn).toHaveBeenCalledWith('socket-1')
      expect(emitFn).toHaveBeenCalledWith('friend:request_received', {
        friendship: expect.objectContaining({ id: 'friendship-1' }),
      })
      expect(result.id).toBe('friendship-1')
    })

    it('should throw ForbiddenError if sending to self', async () => {
      await expect(friendshipService.sendRequest('user-1', 'user-1')).rejects.toThrow(
        'Você não pode adicionar a si mesmo'
      )

      expect(friendshipRepository.findBetween).not.toHaveBeenCalled()
    })

    it('should throw ConflictError if already friends (ACCEPTED)', async () => {
      vi.mocked(friendshipRepository.findBetween).mockResolvedValue(
        createFriendshipRecord({ status: 'ACCEPTED' }) as never
      )

      await expect(friendshipService.sendRequest('user-1', 'user-2')).rejects.toThrow(
        'Vocês já são amigos'
      )
    })

    it('should throw ConflictError if request already pending (sender to receiver)', async () => {
      vi.mocked(friendshipRepository.findBetween).mockResolvedValue(
        createFriendshipRecord({
          senderId: 'user-1',
          receiverId: 'user-2',
          status: 'PENDING',
        }) as never
      )

      await expect(friendshipService.sendRequest('user-1', 'user-2')).rejects.toThrow(
        'Pedido de amizade já enviado'
      )
    })

    it('should auto-accept if receiver sends back (reverse pending request)', async () => {
      const pendingRequest = createFriendshipRecord({
        senderId: 'user-2',
        receiverId: 'user-1',
        status: 'PENDING',
      })
      vi.mocked(friendshipRepository.findBetween).mockResolvedValue(pendingRequest as never)
      vi.mocked(friendshipRepository.findById).mockResolvedValue(pendingRequest as never)
      const accepted = createFriendshipRecord({ status: 'ACCEPTED' })
      vi.mocked(friendshipRepository.updateStatus).mockResolvedValue(accepted as never)
      mockIO()

      const result = await friendshipService.sendRequest('user-1', 'user-2')

      expect(friendshipRepository.updateStatus).toHaveBeenCalledWith('friendship-1', 'ACCEPTED')
      expect(result.status).toBe('ACCEPTED')
    })

    it('should allow re-request after DECLINED (deletes old, creates new)', async () => {
      vi.mocked(friendshipRepository.findBetween).mockResolvedValue(
        createFriendshipRecord({ status: 'DECLINED' }) as never
      )
      vi.mocked(friendshipRepository.delete).mockResolvedValue(undefined as never)
      vi.mocked(friendshipRepository.create).mockResolvedValue(
        createFriendshipRecord({ id: 'new-friendship' }) as never
      )
      mockIO()

      const result = await friendshipService.sendRequest('user-1', 'user-2')

      expect(friendshipRepository.delete).toHaveBeenCalledWith('friendship-1')
      expect(friendshipRepository.create).toHaveBeenCalledWith('user-1', 'user-2')
      expect(result.id).toBe('new-friendship')
    })
  })

  // ---- respondToRequest ----

  describe('respondToRequest', () => {
    it('should accept request and notify sender via socket', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(createFriendshipRecord() as never)
      const accepted = createFriendshipRecord({ status: 'ACCEPTED' })
      vi.mocked(friendshipRepository.updateStatus).mockResolvedValue(accepted as never)
      vi.mocked(socketRegistry.getSocketIds).mockReturnValue(['socket-sender'])
      const { toFn, emitFn } = mockIO()

      const result = await friendshipService.respondToRequest('friendship-1', 'user-2', 'accept')

      expect(friendshipRepository.updateStatus).toHaveBeenCalledWith('friendship-1', 'ACCEPTED')
      expect(toFn).toHaveBeenCalledWith('socket-sender')
      expect(emitFn).toHaveBeenCalledWith('friend:request_accepted', {
        friendship: expect.objectContaining({ status: 'ACCEPTED' }),
      })
      expect(result.status).toBe('ACCEPTED')
    })

    it('should decline request without notifying', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(createFriendshipRecord() as never)
      vi.mocked(friendshipRepository.updateStatus).mockResolvedValue(
        createFriendshipRecord({ status: 'DECLINED' }) as never
      )

      const result = await friendshipService.respondToRequest('friendship-1', 'user-2', 'decline')

      expect(friendshipRepository.updateStatus).toHaveBeenCalledWith('friendship-1', 'DECLINED')
      expect(result.status).toBe('DECLINED')
    })

    it('should throw NotFoundError for non-existent friendship', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(null)

      await expect(
        friendshipService.respondToRequest('nonexistent', 'user-2', 'accept')
      ).rejects.toThrow('Pedido de amizade')
    })

    it('should throw ForbiddenError if not the receiver', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(createFriendshipRecord() as never)

      await expect(
        friendshipService.respondToRequest('friendship-1', 'user-1', 'accept')
      ).rejects.toThrow('Apenas o destinatário pode responder ao pedido')
    })

    it('should throw ConflictError if already responded', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(
        createFriendshipRecord({ status: 'ACCEPTED' }) as never
      )

      await expect(
        friendshipService.respondToRequest('friendship-1', 'user-2', 'accept')
      ).rejects.toThrow('Este pedido já foi respondido')
    })
  })

  // ---- removeFriend ----

  describe('removeFriend', () => {
    it('should delete friendship and notify other user', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(
        createFriendshipRecord({ status: 'ACCEPTED' }) as never
      )
      vi.mocked(friendshipRepository.delete).mockResolvedValue(undefined as never)
      vi.mocked(socketRegistry.getSocketIds).mockReturnValue(['socket-other'])
      const { toFn, emitFn } = mockIO()

      await friendshipService.removeFriend('friendship-1', 'user-1')

      expect(friendshipRepository.delete).toHaveBeenCalledWith('friendship-1')
      expect(toFn).toHaveBeenCalledWith('socket-other')
      expect(emitFn).toHaveBeenCalledWith('friend:removed', {
        friendshipId: 'friendship-1',
        userId: 'user-1',
      })
    })

    it('should throw NotFoundError for non-existent friendship', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(null)

      await expect(friendshipService.removeFriend('nonexistent', 'user-1')).rejects.toThrow(
        'Amizade'
      )
    })

    it('should throw ForbiddenError if not part of friendship', async () => {
      vi.mocked(friendshipRepository.findById).mockResolvedValue(createFriendshipRecord() as never)

      await expect(friendshipService.removeFriend('friendship-1', 'outsider')).rejects.toThrow(
        'Você não faz parte desta amizade'
      )
    })
  })

  // ---- list methods ----

  describe('listFriends', () => {
    it('should delegate to repository', async () => {
      const friends = [createFriendshipRecord({ status: 'ACCEPTED' })]
      vi.mocked(friendshipRepository.findFriends).mockResolvedValue(friends as never)

      const result = await friendshipService.listFriends('user-1')

      expect(friendshipRepository.findFriends).toHaveBeenCalledWith('user-1')
      expect(result).toEqual(friends)
    })
  })

  describe('listPendingReceived', () => {
    it('should delegate to repository', async () => {
      vi.mocked(friendshipRepository.findPendingReceived).mockResolvedValue([] as never)

      await friendshipService.listPendingReceived('user-1')

      expect(friendshipRepository.findPendingReceived).toHaveBeenCalledWith('user-1')
    })
  })

  describe('listPendingSent', () => {
    it('should delegate to repository', async () => {
      vi.mocked(friendshipRepository.findPendingSent).mockResolvedValue([] as never)

      await friendshipService.listPendingSent('user-1')

      expect(friendshipRepository.findPendingSent).toHaveBeenCalledWith('user-1')
    })
  })

  describe('countPendingReceived', () => {
    it('should delegate to repository', async () => {
      vi.mocked(friendshipRepository.countPendingReceived).mockResolvedValue(3)

      const result = await friendshipService.countPendingReceived('user-1')

      expect(result).toBe(3)
    })
  })
})
