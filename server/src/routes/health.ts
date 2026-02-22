import { Router } from 'express'
import { prisma } from '../config/index.js'
import { getIO } from '../config/socket.js'
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

// GET /debug/sockets — temporary diagnostic for cross-device debugging
router.get('/debug/sockets', async (_req, res) => {
  const io = getIO()
  if (!io) {
    res.json({ success: true, data: { error: 'Socket.io not initialized' } })
    return
  }

  const sockets = await io.fetchSockets()
  const connections = sockets.map((s) => ({
    socketId: s.id,
    userId: s.data.userId,
    rooms: [...s.rooms].filter((r) => r !== s.id),
  }))

  res.json({
    success: true,
    data: { totalConnections: sockets.length, connections },
  })
})

export default router
