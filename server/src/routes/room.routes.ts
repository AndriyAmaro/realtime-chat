import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { roomController } from '../controllers/room.controller.js'
import { messageController } from '../controllers/message.controller.js'
import {
  createRoomSchema,
  updateRoomSchema,
  joinRoomSchema,
  updateMemberRoleSchema,
  roomIdParamSchema,
  memberIdParamSchema,
  listRoomsQuerySchema,
} from '../types/room.js'
import { searchMessagesQuerySchema } from '../types/message.js'

const router = Router()

// All room routes require authentication
router.use(authenticate)

// ============ ROOM CRUD ============

// GET /rooms — list user's rooms
router.get('/', validate({ query: listRoomsQuerySchema }), roomController.listMyRooms)

// GET /rooms/public — discover public rooms
router.get('/public', validate({ query: listRoomsQuerySchema }), roomController.listPublicRooms)

// POST /rooms — create room
router.post('/', validate({ body: createRoomSchema }), roomController.create)

// GET /rooms/:roomId — room details
router.get('/:roomId', validate({ params: roomIdParamSchema }), roomController.getRoom)

// PATCH /rooms/:roomId — update room
router.patch(
  '/:roomId',
  validate({ params: roomIdParamSchema, body: updateRoomSchema }),
  roomController.updateRoom
)

// DELETE /rooms/:roomId — delete room
router.delete('/:roomId', validate({ params: roomIdParamSchema }), roomController.deleteRoom)

// ============ MESSAGES ============

// GET /rooms/:roomId/messages/search?q=&page=&limit=
router.get(
  '/:roomId/messages/search',
  validate({ params: roomIdParamSchema, query: searchMessagesQuerySchema }),
  messageController.search
)

// ============ JOIN / LEAVE ============

// POST /rooms/:roomId/join
router.post(
  '/:roomId/join',
  validate({ params: roomIdParamSchema, body: joinRoomSchema }),
  roomController.joinRoom
)

// POST /rooms/:roomId/leave
router.post('/:roomId/leave', validate({ params: roomIdParamSchema }), roomController.leaveRoom)

// ============ MEMBERS ============

// GET /rooms/:roomId/members
router.get('/:roomId/members', validate({ params: roomIdParamSchema }), roomController.listMembers)

// PATCH /rooms/:roomId/members/:memberId
router.patch(
  '/:roomId/members/:memberId',
  validate({ params: memberIdParamSchema, body: updateMemberRoleSchema }),
  roomController.updateMemberRole
)

// DELETE /rooms/:roomId/members/:memberId
router.delete(
  '/:roomId/members/:memberId',
  validate({ params: memberIdParamSchema }),
  roomController.removeMember
)

// ============ INVITE CODE ============

// POST /rooms/:roomId/invite-code — regenerate
router.post(
  '/:roomId/invite-code',
  validate({ params: roomIdParamSchema }),
  roomController.regenerateInviteCode
)

export default router
