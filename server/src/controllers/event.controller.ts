import type { Request, Response } from 'express'
import { eventService } from '../services/event.service.js'
import { getIO } from '../config/socket.js'
import type { AuthenticatedRequest } from '../types/api.js'
import type {
  CreateEventInput,
  UpdateEventInput,
  SendInvitesInput,
  RespondInviteInput,
} from '../types/event.js'

function validatedParams<T>(res: Response): T {
  return res.locals.params as T
}

export const eventController = {
  /** POST /rooms/:roomId/events */
  async createEvent(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)
    const input = req.body as CreateEventInput

    const event = await eventService.createEvent(roomId, userId, input)

    // Notify room members via socket
    const io = getIO()
    if (io) {
      io.to(roomId).emit('event:created', { roomId, event })
    }

    res.status(201).json({ success: true, data: event })
  },

  /** GET /rooms/:roomId/events */
  async listEvents(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)

    const events = await eventService.listEvents(roomId, userId)

    res.status(200).json({ success: true, data: events })
  },

  /** PATCH /rooms/:roomId/events/:eventId */
  async updateEvent(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId, eventId } = validatedParams<{ roomId: string; eventId: string }>(res)
    const input = req.body as UpdateEventInput

    const event = await eventService.updateEvent(roomId, eventId, userId, input)

    const io = getIO()
    if (io) {
      io.to(roomId).emit('event:updated', { roomId, event })
    }

    res.status(200).json({ success: true, data: event })
  },

  /** DELETE /rooms/:roomId/events/:eventId */
  async cancelEvent(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId, eventId } = validatedParams<{ roomId: string; eventId: string }>(res)

    await eventService.cancelEvent(roomId, eventId, userId)

    const io = getIO()
    if (io) {
      io.to(roomId).emit('event:cancelled', { roomId, eventId })
    }

    res.status(200).json({ success: true })
  },

  /** POST /rooms/:roomId/events/:eventId/invites */
  async sendInvites(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId, eventId } = validatedParams<{ roomId: string; eventId: string }>(res)
    const { userIds } = req.body as SendInvitesInput

    const invites = await eventService.sendInvites(roomId, eventId, userId, userIds)

    res.status(201).json({ success: true, data: invites })
  },

  /** PATCH /rooms/:roomId/events/:eventId/invites/respond */
  async respondInvite(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId, eventId } = validatedParams<{ roomId: string; eventId: string }>(res)
    const { status } = req.body as RespondInviteInput

    const invite = await eventService.respondInvite(eventId, userId, status)

    const io = getIO()
    if (io) {
      io.to(roomId).emit('event:rsvp', { roomId, eventId, invite })
    }

    res.status(200).json({ success: true, data: invite })
  },
}
