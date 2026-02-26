import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { friendshipController } from '../controllers/friendship.controller.js'
import {
  sendRequestSchema,
  respondRequestSchema,
  friendshipIdParamSchema,
} from '../types/friendship.js'

const router = Router()

// All friendship routes require authentication
router.use(authenticate)

// GET /friends — list accepted friends
router.get('/', friendshipController.listFriends)

// POST /friends/requests — send friend request
router.post('/requests', validate({ body: sendRequestSchema }), friendshipController.sendRequest)

// GET /friends/requests/received — pending received
router.get('/requests/received', friendshipController.listPendingReceived)

// GET /friends/requests/sent — pending sent
router.get('/requests/sent', friendshipController.listPendingSent)

// GET /friends/requests/count — count pending
router.get('/requests/count', friendshipController.countPending)

// PATCH /friends/requests/:friendshipId — accept or decline
router.patch(
  '/requests/:friendshipId',
  validate({ params: friendshipIdParamSchema, body: respondRequestSchema }),
  friendshipController.respondToRequest
)

// DELETE /friends/:friendshipId — remove friend
router.delete(
  '/:friendshipId',
  validate({ params: friendshipIdParamSchema }),
  friendshipController.removeFriend
)

export default router
