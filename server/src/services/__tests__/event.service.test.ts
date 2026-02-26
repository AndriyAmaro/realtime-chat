import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============ MOCKS ============

vi.mock('../../repositories/event.repository.js', () => ({
  eventRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByRoom: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  },
  eventInviteRepository: {
    createMany: vi.fn(),
    findByEventAndUser: vi.fn(),
    respond: vi.fn(),
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

import { eventService } from '../event.service.js'
import { eventRepository, eventInviteRepository } from '../../repositories/event.repository.js'
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

function createEventRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'event-1',
    title: 'Weekly Meeting',
    description: 'Team sync',
    startTime: new Date('2026-02-01T10:00:00Z'),
    endTime: new Date('2026-02-01T11:00:00Z'),
    roomId: 'room-1',
    createdBy: 'admin-1',
    status: 'SCHEDULED' as const,
    createdAt: new Date('2026-01-15'),
    creator: { id: 'admin-1', name: 'Admin User', avatar: null },
    invites: [],
    ...overrides,
  }
}

function createInviteRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'invite-1',
    eventId: 'event-1',
    userId: 'member-1',
    status: 'PENDING' as const,
    respondedAt: null,
    createdAt: new Date('2026-01-15'),
    user: { id: 'member-1', name: 'Member User', avatar: null },
    ...overrides,
  }
}

// ============ TESTS ============

describe('EventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- createEvent ----

  describe('createEvent', () => {
    const input = {
      title: 'Weekly Meeting',
      description: 'Team sync',
      startTime: '2026-02-01T10:00:00Z',
      endTime: '2026-02-01T11:00:00Z',
    }

    it('should create an event (admin)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.create).mockResolvedValue(createEventRecord() as never)

      const result = await eventService.createEvent('room-1', 'admin-1', input)

      expect(eventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Weekly Meeting',
          roomId: 'room-1',
          createdBy: 'admin-1',
        })
      )
      expect(result).toMatchObject({ id: 'event-1', title: 'Weekly Meeting' })
    })

    it('should create an event (owner)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.create).mockResolvedValue(
        createEventRecord({ createdBy: 'owner-1' }) as never
      )

      const result = await eventService.createEvent('room-1', 'owner-1', input)

      expect(result).toMatchObject({ id: 'event-1' })
    })

    it('should throw ForbiddenError for regular member', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)

      await expect(eventService.createEvent('room-1', 'member-1', input)).rejects.toThrow(
        'Apenas o dono ou administradores podem realizar esta ação'
      )
    })

    it('should throw NotFoundError for non-existent room', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(null)

      await expect(eventService.createEvent('nonexistent', 'admin-1', input)).rejects.toThrow(
        'Sala'
      )
    })
  })

  // ---- updateEvent ----

  describe('updateEvent', () => {
    const updateInput = { title: 'Updated Meeting' }

    it('should update event (creator)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)
      vi.mocked(eventRepository.update).mockResolvedValue(
        createEventRecord({ title: 'Updated Meeting' }) as never
      )

      const result = await eventService.updateEvent('room-1', 'event-1', 'admin-1', updateInput)

      expect(eventRepository.update).toHaveBeenCalledWith(
        'event-1',
        expect.objectContaining({ title: 'Updated Meeting' })
      )
      expect(result.title).toBe('Updated Meeting')
    })

    it('should update event (admin, not creator)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)
      vi.mocked(eventRepository.update).mockResolvedValue(
        createEventRecord({ title: 'Updated Meeting' }) as never
      )

      // owner-1 is not the creator (admin-1 is), but owner can still update
      const result = await eventService.updateEvent('room-1', 'event-1', 'owner-1', updateInput)

      expect(result.title).toBe('Updated Meeting')
    })

    it('should throw ForbiddenError for non-creator non-admin', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)

      await expect(
        eventService.updateEvent('room-1', 'event-1', 'member-1', updateInput)
      ).rejects.toThrow('Apenas o dono ou administradores podem realizar esta ação')
    })

    it('should throw NotFoundError for event in different room', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(
        createEventRecord({ roomId: 'other-room' }) as never
      )

      await expect(
        eventService.updateEvent('room-1', 'event-1', 'admin-1', updateInput)
      ).rejects.toThrow('Evento')
    })
  })

  // ---- cancelEvent ----

  describe('cancelEvent', () => {
    it('should cancel event (creator)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)
      vi.mocked(eventRepository.updateStatus).mockResolvedValue(undefined as never)

      await eventService.cancelEvent('room-1', 'event-1', 'admin-1')

      expect(eventRepository.updateStatus).toHaveBeenCalledWith('event-1', 'CANCELLED')
    })

    it('should cancel event (owner, not creator)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)
      vi.mocked(eventRepository.updateStatus).mockResolvedValue(undefined as never)

      await eventService.cancelEvent('room-1', 'event-1', 'owner-1')

      expect(eventRepository.updateStatus).toHaveBeenCalledWith('event-1', 'CANCELLED')
    })

    it('should throw ForbiddenError for non-creator non-admin', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)

      await expect(eventService.cancelEvent('room-1', 'event-1', 'member-1')).rejects.toThrow(
        'Apenas o dono ou administradores podem realizar esta ação'
      )
    })

    it('should throw NotFoundError for event in different room', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(
        createEventRecord({ roomId: 'other-room' }) as never
      )

      await expect(eventService.cancelEvent('room-1', 'event-1', 'admin-1')).rejects.toThrow(
        'Evento'
      )
    })
  })

  // ---- listEvents ----

  describe('listEvents', () => {
    it('should list events for room member', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue({
        id: 'membership-1',
        role: 'MEMBER',
      } as never)
      vi.mocked(eventRepository.findByRoom).mockResolvedValue([createEventRecord()] as never)

      const result = await eventService.listEvents('room-1', 'member-1')

      expect(eventRepository.findByRoom).toHaveBeenCalledWith('room-1')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: 'event-1', title: 'Weekly Meeting' })
    })

    it('should throw ForbiddenError for non-member', async () => {
      vi.mocked(roomMemberRepository.findMembership).mockResolvedValue(null)

      await expect(eventService.listEvents('room-1', 'outsider')).rejects.toThrow(
        'Você não é membro desta sala'
      )
    })
  })

  // ---- sendInvites ----

  describe('sendInvites', () => {
    it('should send invites (creator)', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)
      vi.mocked(eventInviteRepository.createMany).mockResolvedValue([createInviteRecord()] as never)

      const result = await eventService.sendInvites('room-1', 'event-1', 'admin-1', ['member-1'])

      expect(eventInviteRepository.createMany).toHaveBeenCalledWith('event-1', ['member-1'])
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ userId: 'member-1', status: 'PENDING' })
    })

    it('should throw ForbiddenError for non-creator non-admin', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(createEventRecord() as never)

      await expect(
        eventService.sendInvites('room-1', 'event-1', 'member-1', ['user-3'])
      ).rejects.toThrow('Apenas o dono ou administradores podem realizar esta ação')
    })

    it('should throw NotFoundError for non-existent event', async () => {
      vi.mocked(roomRepository.findById).mockResolvedValue(createRoomRecord() as never)
      vi.mocked(eventRepository.findById).mockResolvedValue(null)

      await expect(
        eventService.sendInvites('room-1', 'nonexistent', 'admin-1', ['member-1'])
      ).rejects.toThrow('Evento')
    })
  })

  // ---- respondInvite ----

  describe('respondInvite', () => {
    it('should respond ACCEPTED', async () => {
      vi.mocked(eventInviteRepository.findByEventAndUser).mockResolvedValue(
        createInviteRecord() as never
      )
      vi.mocked(eventInviteRepository.respond).mockResolvedValue(
        createInviteRecord({ status: 'ACCEPTED', respondedAt: new Date() }) as never
      )

      const result = await eventService.respondInvite('event-1', 'member-1', 'ACCEPTED')

      expect(eventInviteRepository.respond).toHaveBeenCalledWith('event-1', 'member-1', 'ACCEPTED')
      expect(result.status).toBe('ACCEPTED')
    })

    it('should respond DECLINED', async () => {
      vi.mocked(eventInviteRepository.findByEventAndUser).mockResolvedValue(
        createInviteRecord() as never
      )
      vi.mocked(eventInviteRepository.respond).mockResolvedValue(
        createInviteRecord({ status: 'DECLINED', respondedAt: new Date() }) as never
      )

      const result = await eventService.respondInvite('event-1', 'member-1', 'DECLINED')

      expect(result.status).toBe('DECLINED')
    })

    it('should throw NotFoundError for non-existent invite', async () => {
      vi.mocked(eventInviteRepository.findByEventAndUser).mockResolvedValue(null)

      await expect(eventService.respondInvite('event-1', 'outsider', 'ACCEPTED')).rejects.toThrow(
        'Convite não encontrado'
      )
    })
  })
})
