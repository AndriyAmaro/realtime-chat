import { userRepository } from '../repositories/user.repository.js'
import { socketRegistry } from '../services/socketRegistry.js'
import { getOnlineUserIds } from './room.handler.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Handles user online/offline status.
 * - On connect: set ONLINE + notify rooms
 * - On disconnect: set OFFLINE + notify rooms (only if no other sockets via registry)
 */
export function registerStatusHandlers(io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  // Mark user as ONLINE on connect
  setUserOnline(socket)

  // Mark user as OFFLINE on disconnect (if no other active sockets)
  socket.on('disconnect', async () => {
    try {
      // O(1) check via registry instead of io.fetchSockets() O(n)
      if (!socketRegistry.isOnline(userId)) {
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

async function setUserOnline(socket: TypedSocket): Promise<void> {
  const { userId } = socket.data

  try {
    await userRepository.updateStatus(userId, 'ONLINE')

    // Notify all rooms this socket is in
    socket.broadcast.emit('user:status', { userId, status: 'ONLINE' })
  } catch (err) {
    console.error('[socket] Failed to set user online:', err)
  }
}
