import { userRepository } from '../repositories/user.repository.js'
import { getOnlineUserIds } from './room.handler.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Handles user online/offline status.
 * - On connect: set ONLINE + notify rooms
 * - On disconnect: set OFFLINE + notify rooms (only if no other sockets)
 */
export function registerStatusHandlers(io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  // Mark user as ONLINE on connect
  setUserOnline(io, socket)

  // Mark user as OFFLINE on disconnect (if no other active sockets)
  socket.on('disconnect', async () => {
    try {
      // Check if user still has other active sockets
      const sockets = await io.fetchSockets()
      const hasOtherSocket = sockets.some((s) => s.data.userId === userId && s.id !== socket.id)

      if (!hasOtherSocket) {
        await userRepository.updateStatus(userId, 'OFFLINE')

        // Notify all rooms this socket was in
        for (const roomId of socket.rooms) {
          if (roomId === socket.id) continue // skip default room
          socket.to(roomId).emit('user:status', { userId, status: 'OFFLINE' })

          // Update online members list for each room
          const onlineUserIds = await getOnlineUserIds(io, roomId)
          io.to(roomId).emit('room:members_online', { roomId, userIds: onlineUserIds })
        }
      }
    } catch (err) {
      console.error('[socket] Failed to handle disconnect status:', err)
    }
  })
}

// ============ HELPERS ============

async function setUserOnline(_io: TypedServer, socket: TypedSocket): Promise<void> {
  const { userId } = socket.data

  try {
    await userRepository.updateStatus(userId, 'ONLINE')

    // Notify all rooms this socket is in (will be populated after room:join)
    // For now broadcast to all connected sockets — rooms will get specific updates on join
    socket.broadcast.emit('user:status', { userId, status: 'ONLINE' })
  } catch (err) {
    console.error('[socket] Failed to set user online:', err)
  }
}
