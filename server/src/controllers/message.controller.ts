import type { Request, Response } from 'express'
import { messageService } from '../services/message.service.js'
import type { AuthenticatedRequest } from '../types/api.js'
import type { SearchMessagesQuery } from '../types/message.js'

/** Extract validated params from res.locals */
function validatedParams<T>(res: Response): T {
  return res.locals.params as T
}

/** Extract validated query from res.locals */
function validatedQuery<T>(res: Response): T {
  return res.locals.query as T
}

// ============ MESSAGE CONTROLLER ============

export const messageController = {
  /** GET /rooms/:roomId/messages/search?q=&page=&limit= */
  async search(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const { roomId } = validatedParams<{ roomId: string }>(res)
    const { q, page, limit } = validatedQuery<SearchMessagesQuery>(res)

    const result = await messageService.search(userId, roomId, q, page, limit)

    res.status(200).json({
      success: true,
      data: { messages: result.messages, ...result.meta },
    })
  },
}
