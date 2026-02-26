import { userRepository } from '../repositories/user.repository.js'
import { friendshipRepository } from '../repositories/friendship.repository.js'
import { socketRegistry } from '../services/socketRegistry.js'
import { getOnlineUserIds } from './room.handler.js'
import { createChildLogger } from '../config/logger.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

const log = createChildLogger('socket:status')

/**
 * Handles user online/offline status.
 * - On connect: set ONLINE + notify rooms
 * - On disconnect: set OFFLINE + notify rooms (only if no other sockets via registry)
 */
export function registerStatusHandlers(io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  // Mark user as ONLINE on connect
  setUserOnline(io, socket)

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

        // Notify friends about offline status
        await notifyFriendsStatus(io, userId, 'OFFLINE')
      }
    } catch (err) {
      log.error({ err, userId }, 'Failed to handle disconnect status')
    }
  })
}

// ============ HELPERS ============

async function setUserOnline(io: TypedServer, socket: TypedSocket): Promise<void> {
  const { userId } = socket.data

  try {
    await userRepository.updateStatus(userId, 'ONLINE')

    // Notify only rooms this socket has joined (not all connections globally)
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue // skip default room
      socket.to(roomId).emit('user:status', { userId, status: 'ONLINE' })
    }

    // Notify friends about online status
    await notifyFriendsStatus(io, userId, 'ONLINE')
  } catch (err) {
    log.error({ err, userId }, 'Failed to set user online')
  }
}

async function notifyFriendsStatus(
  io: TypedServer,
  userId: string,
  status: 'ONLINE' | 'OFFLINE'
): Promise<void> {
  try {
    const friendships = await friendshipRepository.findFriends(userId)

    for (const friendship of friendships) {
      const friendId = friendship.senderId === userId ? friendship.receiverId : friendship.senderId

      for (const sid of socketRegistry.getSocketIds(friendId)) {
        io.to(sid).emit('user:status', { userId, status })
      }
    }
  } catch (err) {
    log.error({ err, userId }, 'Failed to notify friends about status change')
  }
}
