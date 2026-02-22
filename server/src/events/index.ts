import { registerRoomHandlers } from './room.handler.js'
import { registerMessageHandlers } from './message.handler.js'
import { registerStatusHandlers } from './status.handler.js'
import { registerReadHandlers } from './read.handler.js'
import { roomMemberRepository } from '../repositories/room.repository.js'
import { socketRegistry } from '../services/socketRegistry.js'
import { rateLimiters } from '../middleware/socketRateLimiter.js'
import { createChildLogger } from '../config/logger.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

const log = createChildLogger('socket:events')

/**
 * Register all socket event handlers for a connected socket.
 * Called once per client connection after auth middleware passes.
 */
export function registerSocketHandlers(io: TypedServer, socket: TypedSocket): void {
  const { userId } = socket.data

  // Track socket in registry
  socketRegistry.add(userId, socket.id)
  emitDeviceCount(io, userId)

  // Auto-join all user's rooms so they receive message:new for every room
  autoJoinUserRooms(socket)

  // Typing indicator events
  registerTypingHandlers(socket)

  // Room join/leave
  registerRoomHandlers(io, socket)

  // Messages (send/history)
  registerMessageHandlers(io, socket)

  // Online/offline status
  registerStatusHandlers(io, socket)

  // Read receipts
  registerReadHandlers(io, socket)

  // Unregister socket on disconnect
  socket.on('disconnect', () => {
    socketRegistry.remove(userId, socket.id)
    emitDeviceCount(io, userId)
  })
}

// ============ AUTO-JOIN ============

async function autoJoinUserRooms(socket: TypedSocket): Promise<void> {
  try {
    const roomIds = await roomMemberRepository.findRoomIdsByUserId(socket.data.userId)
    await Promise.all(roomIds.map((roomId) => socket.join(roomId)))
    log.info(
      { userId: socket.data.userId, socketId: socket.id, rooms: roomIds.length },
      'Auto-joined rooms'
    )
  } catch (err) {
    log.error({ err, userId: socket.data.userId }, 'Failed to auto-join rooms')
  }
}

// ============ TYPING ============

/** Emit device count to all sockets of a user */
async function emitDeviceCount(io: TypedServer, userId: string): Promise<void> {
  const count = socketRegistry.getSocketCount(userId)
  const socketIds = socketRegistry.getSocketIds(userId)
  for (const sid of socketIds) {
    io.to(sid).emit('user:devices', { count })
  }
}

function registerTypingHandlers(socket: TypedSocket): void {
  socket.on('typing:start', (roomId) => {
    if (!rateLimiters.typingStart(socket)) return

    socket.to(roomId).emit('typing:start', {
      roomId,
      userId: socket.data.userId,
      userName: '', // will be enriched on the client from members list
    })
  })

  socket.on('typing:stop', (roomId) => {
    socket.to(roomId).emit('typing:stop', {
      roomId,
      userId: socket.data.userId,
    })
  })
}
