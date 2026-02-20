import { messageService } from '../services/message.service.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Handles real-time messaging events.
 * - message:send    — persist + broadcast to room
 * - message:history — cursor-based pagination
 * - message:edit    — edit content + broadcast
 * - message:delete  — soft delete + broadcast
 * - message:react   — toggle reaction + broadcast
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
        replyToId: data.replyToId,
      })

      io.to(data.roomId).emit('message:new', message)
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

  // ---- message:edit ----
  socket.on('message:edit', async (data, callback) => {
    try {
      const message = await messageService.editMessage(
        userId,
        data.roomId,
        data.messageId,
        data.content
      )

      io.to(data.roomId).emit('message:edited', message)
      callback({ success: true, messageId: message.id })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit message'
      callback({ success: false, error: errorMessage })
    }
  })

  // ---- message:delete ----
  socket.on('message:delete', async (data, callback) => {
    try {
      await messageService.deleteMessage(userId, data.roomId, data.messageId)

      io.to(data.roomId).emit('message:deleted', {
        roomId: data.roomId,
        messageId: data.messageId,
      })
      callback({ success: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message'
      callback({ success: false, error: errorMessage })
    }
  })

  // ---- message:react ----
  socket.on('message:react', async (data, callback) => {
    try {
      const reactions = await messageService.toggleReaction(
        userId,
        data.roomId,
        data.messageId,
        data.emoji
      )

      io.to(data.roomId).emit('message:reaction_updated', {
        roomId: data.roomId,
        messageId: data.messageId,
        reactions,
      })
      callback({ success: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to react'
      callback({ success: false, error: errorMessage })
    }
  })
}
