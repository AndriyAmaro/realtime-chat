import { Router } from 'express'
import { metricsService } from '../services/metrics.service.js'
import { errorTracker } from '../services/errorTracker.service.js'
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

export { router as adminRouter }
