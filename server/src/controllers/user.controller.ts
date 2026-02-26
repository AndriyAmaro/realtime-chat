import type { Request, Response } from 'express'
import { userService } from '../services/user.service.js'
import type { AuthenticatedRequest } from '../types/api.js'
import type { SearchQuery } from '../types/friendship.js'

function validatedParams<T>(res: Response): T {
  return res.locals.params as T
}

function validatedQuery<T>(res: Response): T {
  return res.locals.query as T
}

export const userController = {
  async getProfile(req: Request, res: Response) {
    const { userId: requestingUserId } = (req as AuthenticatedRequest).user
    const { userId } = validatedParams<{ userId: string }>(res)

    const profile = await userService.getProfile(userId, requestingUserId)

    res.status(200).json({ success: true, data: profile })
  },

  async search(_req: Request, res: Response) {
    const { userId } = (res.req as AuthenticatedRequest).user
    const { q } = validatedQuery<SearchQuery>(res)

    const users = await userService.search(q, userId)

    res.status(200).json({ success: true, data: users })
  },
}
