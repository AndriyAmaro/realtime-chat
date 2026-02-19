import type { Request, Response } from 'express'
import { roomService } from '../services/room.service.js'
import type { AuthenticatedRequest } from '../types/api.js'
import type {
  CreateRoomInput,
  UpdateRoomInput,
  JoinRoomInput,
  UpdateMemberRoleInput,
  ListRoomsQuery,
} from '../types/room.js'

/** Extract validated params from res.locals (set by validate middleware) */
function validatedParams<T>(res: Response): T {
  return res.locals.params as T
}

/** Extract validated query from res.locals (set by validate middleware) */
function validatedQuery<T>(res: Response): T {
  return res.locals.query as T
}

// ============ ROOM CONTROLLER ============

export const roomController = {
  /** POST /rooms */
  async create(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const input = req.body as CreateRoomInput

    const room = await roomService.createRoom(userId, input)

    res.status(201).json({ success: true, data: room })
  },

  /** GET /rooms */
  async listMyRooms(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const query = validatedQuery<ListRoomsQuery>(res)

    const result = await roomService.listMyRooms(userId, query)

    res.status(200).json({ success: true, data: result.rooms, meta: result.meta })
  },

  /** GET /rooms/public */
  async listPublicRooms(_req: Request, res: Response) {
    const query = validatedQuery<ListRoomsQuery>(res)

    const result = await roomService.listPublicRooms(query)

    res.status(200).json({ success: true, data: result.rooms, meta: result.meta })
  },

  /** GET /rooms/:roomId */
  async getRoom(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)

    const room = await roomService.getRoom(roomId, userId)

    res.status(200).json({ success: true, data: room })
  },

  /** PATCH /rooms/:roomId */
  async updateRoom(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)
    const input = req.body as UpdateRoomInput

    const room = await roomService.updateRoom(roomId, userId, input)

    res.status(200).json({ success: true, data: room })
  },

  /** DELETE /rooms/:roomId */
  async deleteRoom(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)

    await roomService.deleteRoom(roomId, userId)

    res.status(204).send()
  },

  /** POST /rooms/:roomId/join */
  async joinRoom(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)
    const { inviteCode } = req.body as JoinRoomInput

    const member = await roomService.joinRoom(roomId, userId, inviteCode)

    res.status(201).json({ success: true, data: member })
  },

  /** POST /rooms/:roomId/leave */
  async leaveRoom(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)

    await roomService.leaveRoom(roomId, userId)

    res.status(204).send()
  },

  /** GET /rooms/:roomId/members */
  async listMembers(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)

    const members = await roomService.listMembers(roomId, userId)

    res.status(200).json({ success: true, data: members })
  },

  /** PATCH /rooms/:roomId/members/:memberId */
  async updateMemberRole(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId, memberId } = validatedParams<{ roomId: string; memberId: string }>(res)
    const { role } = req.body as UpdateMemberRoleInput

    const member = await roomService.updateMemberRole(roomId, memberId, userId, role)

    res.status(200).json({ success: true, data: member })
  },

  /** DELETE /rooms/:roomId/members/:memberId */
  async removeMember(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId, memberId } = validatedParams<{ roomId: string; memberId: string }>(res)

    await roomService.removeMember(roomId, memberId, userId)

    res.status(204).send()
  },

  /** POST /rooms/:roomId/invite-code */
  async regenerateInviteCode(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)

    const result = await roomService.regenerateInviteCode(roomId, userId)

    res.status(200).json({ success: true, data: result })
  },
}
