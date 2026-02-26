import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { eventController } from '../controllers/event.controller.js'
import {
  createEventSchema,
  updateEventSchema,
  sendInvitesSchema,
  respondInviteSchema,
  roomIdParamSchema,
  eventIdParamSchema,
} from '../types/event.js'

const router = Router()

// All event routes require authentication
router.use(authenticate)

// POST /rooms/:roomId/events — create event
router.post(
  '/:roomId/events',
  validate({ params: roomIdParamSchema, body: createEventSchema }),
  eventController.createEvent
)

// GET /rooms/:roomId/events — list events
router.get('/:roomId/events', validate({ params: roomIdParamSchema }), eventController.listEvents)

// PATCH /rooms/:roomId/events/:eventId — update event
router.patch(
  '/:roomId/events/:eventId',
  validate({ params: eventIdParamSchema, body: updateEventSchema }),
  eventController.updateEvent
)

// DELETE /rooms/:roomId/events/:eventId — cancel event
router.delete(
  '/:roomId/events/:eventId',
  validate({ params: eventIdParamSchema }),
  eventController.cancelEvent
)

// POST /rooms/:roomId/events/:eventId/invites — send invites
router.post(
  '/:roomId/events/:eventId/invites',
  validate({ params: eventIdParamSchema, body: sendInvitesSchema }),
  eventController.sendInvites
)

// PATCH /rooms/:roomId/events/:eventId/invites/respond — RSVP
router.patch(
  '/:roomId/events/:eventId/invites/respond',
  validate({ params: eventIdParamSchema, body: respondInviteSchema }),
  eventController.respondInvite
)

export default router
