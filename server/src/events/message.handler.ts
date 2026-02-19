import { messageService } from '../services/message.service.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Handles real-time messaging events.
 * - message:send — persist + broadcast to room
 * - message:history — cursor-based pagination
 */
export function registerMessageHandlers(io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  // ---- message:send ----
  socket.on('message:send', async (data, callback) => {
    try {
      const message = await messageService.send({
        content: data.content,
        type: data.type,
        fileUrl: data.fileUrl,
        userId,
        roomId: data.roomId,
      })

      // Broadcast to everyone in the room (including sender)
      io.to(data.roomId).emit('message:new', message)

      // Acknowledge to the sender
      callback({ success: true, messageId: message.id })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      callback({ success: false, error: errorMessage })
    }
  })

  // ---- message:history ----
  socket.on('message:history', async (data) => {
    try {
      const result = await messageService.getHistory(userId, data.roomId, data.cursor, data.limit)

      socket.emit('message:history', result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages'
      socket.emit('error', { message: errorMessage })
    }
  })
}
