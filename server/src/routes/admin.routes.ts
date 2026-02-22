import { Router } from 'express'
import { metricsService } from '../services/metrics.service.js'
import { errorTracker } from '../services/errorTracker.service.js'
import { getIO } from '../config/socket.js'
import { env } from '../config/env.js'
import { AuthError } from '../errors/index.js'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

/**
 * Simple API key guard for admin endpoints.
 * In production, requires ADMIN_API_KEY env var via X-Admin-Key header.
 * In development, access is unrestricted.
 */
function adminGuard(req: Request, _res: Response, next: NextFunction): void {
  if (env.NODE_ENV !== 'production') return next()

  const apiKey = req.headers['x-admin-key'] as string | undefined
  if (!apiKey || apiKey !== env.ADMIN_API_KEY) {
    throw new AuthError('Invalid admin API key')
  }
  next()
}

// GET /admin/metrics
router.get('/metrics', adminGuard, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: metricsService.getSnapshot(),
  })
})

// GET /admin/errors
router.get('/errors', adminGuard, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      summary: errorTracker.getSummary(),
      errors: errorTracker.getAll(),
    },
  })
})

// GET /admin/sockets — diagnostic: show all connected sockets and their rooms
router.get('/sockets', adminGuard, async (_req: Request, res: Response) => {
  const io = getIO()
  if (!io) {
    res.json({ success: true, data: { error: 'Socket.io not initialized' } })
    return
  }

  const sockets = await io.fetchSockets()
  const connections = sockets.map((s) => ({
    socketId: s.id,
    userId: s.data.userId,
    rooms: [...s.rooms].filter((r) => r !== s.id), // exclude default room (socket ID)
  }))

  res.json({
    success: true,
    data: {
      totalConnections: sockets.length,
      connections,
    },
  })
})

export { router as adminRouter }
