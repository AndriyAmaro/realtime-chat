import { Router } from 'express'
import { prisma } from '../config/index.js'
import { shutdownService } from '../services/shutdown.service.js'
import type { ApiResponse } from '../types/api.js'

const router = Router()

router.get('/health', async (_req, res) => {
  if (shutdownService.isShuttingDown) {
    const response: ApiResponse = {
      success: false,
      error: 'Server is shutting down',
      data: { server: 'shutting_down', database: 'unknown' },
    }
    res.status(503).json(response)
    return
  }

  const health: Record<string, string> = {
    server: 'ok',
    database: 'ok',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    health.database = 'error'
  }

  const allHealthy = Object.values(health).every((v) => v === 'ok')

  const response: ApiResponse<typeof health> = {
    success: allHealthy,
    data: health,
  }

  res.status(allHealthy ? 200 : 503).json(response)
})

export default router
