import { roomMemberRepository } from '../repositories/room.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Handles room join/leave via Socket.io rooms.
 * - Validates membership before joining a socket room
 * - Notifies other members when someone joins/leaves
 * - Tracks online users per room
 */
export function registerRoomHandlers(io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  // ---- room:join ----
  socket.on('room:join', async (roomId) => {
    try {
      // Verify the user is actually a member
      const membership = await roomMemberRepository.findMembership(userId, roomId)
      if (!membership) {
        socket.emit('error', { message: 'You are not a member of this room' })
        return
      }

      // Join socket room + fetch all supplementary data in parallel
      const [, user, onlineUserIds, readReceipts] = await Promise.all([
        socket.join(roomId),
        userRepository.findById(userId),
        getOnlineUserIds(io, roomId),
        roomMemberRepository.getReadReceipts(roomId),
      ])

      const userName = user?.name ?? 'Unknown'

      // Notify others in the room
      socket.to(roomId).emit('room:joined', { roomId, userId, userName })

      // Send list of online members + read receipts
      socket.emit('room:members_online', { roomId, userIds: onlineUserIds })
      socket.emit('messages:read_receipts', {
        roomId,
        receipts: readReceipts.map((r) => ({
          userId: r.userId,
          readAt: r.lastReadAt?.toISOString() ?? null,
        })),
      })
    } catch {
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // ---- room:leave ----
  socket.on('room:leave', async (roomId) => {
    try {
      await socket.leave(roomId)

      const user = await userRepository.findById(userId)
      const userName = user?.name ?? 'Unknown'

      socket.to(roomId).emit('room:left', { roomId, userId, userName })
    } catch {
      socket.emit('error', { message: 'Failed to leave room' })
    }
  })
}

// ============ HELPERS ============

/** Get the user IDs of all online sockets in a given room */
export async function getOnlineUserIds(io: TypedServer, roomId: string): Promise<string[]> {
  const socketIds = await io.in(roomId).fetchSockets()
  const userIds = new Set<string>()

  for (const s of socketIds) {
    if (s.data.userId) {
      userIds.add(s.data.userId)
    }
  }

  return Array.from(userIds)
}
