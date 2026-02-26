import { pinnedService } from '../services/pinned.service.js'
import { rateLimiters } from '../middleware/socketRateLimiter.js'
import { createChildLogger } from '../config/logger.js'
import { metricsService } from '../services/metrics.service.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

const log = createChildLogger('socket:pinned')

/**
 * Handles pinned message events.
 * - message:pin   — pin message + broadcast
 * - message:unpin — unpin message + broadcast
 * - pinned:fetch  — list pinned messages for a room
 */
export function registerPinnedHandlers(io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  // ---- message:pin ----
  socket.on('message:pin', async (data, callback) => {
    if (!rateLimiters.messagePin(socket)) return
    metricsService.recordSocketEvent('message:pin')

    try {
      const message = await pinnedService.pin(data.messageId, data.roomId, userId)

      io.to(data.roomId).emit('message:pinned', {
        roomId: data.roomId,
        message,
        pinnedBy: userId,
      })
      callback({ success: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao fixar mensagem'
      log.error(
        { err, userId, roomId: data.roomId, messageId: data.messageId },
        'message:pin failed'
      )
      callback({ success: false, error: errorMessage })
    }
  })

  // ---- message:unpin ----
  socket.on('message:unpin', async (data, callback) => {
    if (!rateLimiters.messagePin(socket)) return
    metricsService.recordSocketEvent('message:unpin')

    try {
      await pinnedService.unpin(data.messageId, data.roomId, userId)

      io.to(data.roomId).emit('message:unpinned', {
        roomId: data.roomId,
        messageId: data.messageId,
      })
      callback({ success: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao desafixar mensagem'
      log.error(
        { err, userId, roomId: data.roomId, messageId: data.messageId },
        'message:unpin failed'
      )
      callback({ success: false, error: errorMessage })
    }
  })

  // ---- pinned:fetch ----
  socket.on('pinned:fetch', async (data, callback) => {
    metricsService.recordSocketEvent('pinned:fetch')

    try {
      const messages = await pinnedService.listPinned(data.roomId, userId)
      callback({ success: true, messages })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao buscar mensagens fixadas'
      log.error({ err, userId, roomId: data.roomId }, 'pinned:fetch failed')
      callback({ success: false, error: errorMessage })
    }
  })
}
