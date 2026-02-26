import { eventRepository, eventInviteRepository } from '../repositories/event.repository.js'
import { roomRepository, roomMemberRepository } from '../repositories/room.repository.js'
import { NotFoundError, ForbiddenError } from '../errors/index.js'
import type { CreateEventInput, UpdateEventInput } from '../types/event.js'

// ============ EVENT SERVICE ============

export const eventService = {
  /** Create an event in a room (admin/owner only) */
  async createEvent(roomId: string, userId: string, input: CreateEventInput) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    assertAdminOrOwner(room, userId)

    const event = await eventRepository.create({
      title: input.title,
      description: input.description,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      roomId,
      createdBy: userId,
    })

    return formatEvent(event)
  },

  /** Update an event (creator or admin/owner) */
  async updateEvent(roomId: string, eventId: string, userId: string, input: UpdateEventInput) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    const event = await eventRepository.findById(eventId)
    if (!event || event.roomId !== roomId) throw new NotFoundError('Evento')

    // Creator can always edit, or admin/owner of the room
    if (event.createdBy !== userId) {
      assertAdminOrOwner(room, userId)
    }

    const updated = await eventRepository.update(eventId, {
      title: input.title,
      description: input.description,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
    })

    return formatEvent(updated)
  },

  /** Cancel an event (creator or admin/owner) */
  async cancelEvent(roomId: string, eventId: string, userId: string) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    const event = await eventRepository.findById(eventId)
    if (!event || event.roomId !== roomId) throw new NotFoundError('Evento')

    if (event.createdBy !== userId) {
      assertAdminOrOwner(room, userId)
    }

    await eventRepository.updateStatus(eventId, 'CANCELLED')
  },

  /** List events for a room (members only) */
  async listEvents(roomId: string, userId: string) {
    const membership = await roomMemberRepository.findMembership(userId, roomId)
    if (!membership) throw new ForbiddenError('Você não é membro desta sala')

    const events = await eventRepository.findByRoom(roomId)
    return events.map(formatEvent)
  },

  /** Send invites to members */
  async sendInvites(roomId: string, eventId: string, userId: string, userIds: string[]) {
    const room = await roomRepository.findById(roomId)
    if (!room) throw new NotFoundError('Sala')

    const event = await eventRepository.findById(eventId)
    if (!event || event.roomId !== roomId) throw new NotFoundError('Evento')

    if (event.createdBy !== userId) {
      assertAdminOrOwner(room, userId)
    }

    const invites = await eventInviteRepository.createMany(eventId, userIds)
    return invites.map(formatInvite)
  },

  /** Respond to an event invite (RSVP) */
  async respondInvite(eventId: string, userId: string, status: 'ACCEPTED' | 'DECLINED') {
    const invite = await eventInviteRepository.findByEventAndUser(eventId, userId)
    if (!invite) throw new NotFoundError('Convite não encontrado')

    const updated = await eventInviteRepository.respond(eventId, userId, status)
    return formatInvite(updated)
  },
}

// ============ HELPERS ============

type RoomWithMembers = NonNullable<Awaited<ReturnType<typeof roomRepository.findById>>>

function assertAdminOrOwner(room: RoomWithMembers, userId: string): void {
  if (room.ownerId === userId) return

  const membership = room.members.find((m) => m.userId === userId)
  if (!membership || membership.role !== 'ADMIN') {
    throw new ForbiddenError('Apenas o dono ou administradores podem realizar esta ação')
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatEvent(event: any) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.startTime instanceof Date ? event.startTime.toISOString() : event.startTime,
    endTime: event.endTime instanceof Date ? event.endTime.toISOString() : event.endTime,
    roomId: event.roomId,
    createdBy: event.createdBy,
    status: event.status,
    createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
    creator: event.creator,
    invites: event.invites?.map(formatInvite) ?? [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatInvite(invite: any) {
  return {
    id: invite.id,
    userId: invite.userId,
    status: invite.status,
    respondedAt:
      invite.respondedAt instanceof Date ? invite.respondedAt.toISOString() : invite.respondedAt,
    user: invite.user,
  }
}
