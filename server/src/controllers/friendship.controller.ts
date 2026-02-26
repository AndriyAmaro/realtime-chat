import type { Request, Response } from 'express'
import { friendshipService } from '../services/friendship.service.js'
import type { AuthenticatedRequest } from '../types/api.js'
import type { SendRequestInput, RespondRequestInput } from '../types/friendship.js'

function validatedParams<T>(res: Response): T {
  return res.locals.params as T
}

export const friendshipController = {
  async sendRequest(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { receiverId } = req.body as SendRequestInput

    const friendship = await friendshipService.sendRequest(userId, receiverId)

    res.status(201).json({ success: true, data: friendship })
  },

  async respondToRequest(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { friendshipId } = validatedParams<{ friendshipId: string }>(res)
    const { action } = req.body as RespondRequestInput

    const friendship = await friendshipService.respondToRequest(friendshipId, userId, action)

    res.status(200).json({ success: true, data: friendship })
  },

  async removeFriend(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { friendshipId } = validatedParams<{ friendshipId: string }>(res)

    await friendshipService.removeFriend(friendshipId, userId)

    res.status(204).send()
  },

  async listFriends(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user

    const friends = await friendshipService.listFriends(userId)

    res.status(200).json({ success: true, data: friends })
  },

  async listPendingReceived(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user

    const requests = await friendshipService.listPendingReceived(userId)

    res.status(200).json({ success: true, data: requests })
  },

  async listPendingSent(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user

    const requests = await friendshipService.listPendingSent(userId)

    res.status(200).json({ success: true, data: requests })
  },

  async countPending(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user

    const count = await friendshipService.countPendingReceived(userId)

    res.status(200).json({ success: true, data: { count } })
  },
}
