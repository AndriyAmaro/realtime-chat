import { roomMemberRepository } from '../repositories/room.repository.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Handles read receipt events.
 * When a user marks messages as read in a room:
 * - Updates lastReadAt in the database
 * - Broadcasts the read receipt to other room members
 */
export function registerReadHandlers(_io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  socket.on('messages:read', async (roomId) => {
    try {
      const readAt = new Date()

      await roomMemberRepository.updateLastReadAt(userId, roomId, readAt)

      // Broadcast to others in the room
      socket.to(roomId).emit('messages:read', {
        roomId,
        userId,
        readAt: readAt.toISOString(),
      })
    } catch (err) {
      console.error('[socket] Failed to update read receipt:', err)
    }
  })
}
