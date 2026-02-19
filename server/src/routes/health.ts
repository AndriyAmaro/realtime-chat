import { Router } from 'express'
import { prisma } from '../config/index.js'
import type { ApiResponse } from '../types/api.js'

const router = Router()

router.get('/health', async (_req, res) => {
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
