import { registerRoomHandlers } from './room.handler.js'
import { registerMessageHandlers } from './message.handler.js'
import { registerStatusHandlers } from './status.handler.js'
import { registerReadHandlers } from './read.handler.js'
import { roomMemberRepository } from '../repositories/room.repository.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Register all socket event handlers for a connected socket.
 * Called once per client connection after auth middleware passes.
 */
export function registerSocketHandlers(io: TypedServer, socket: TypedSocket): void {
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
}

// ============ AUTO-JOIN ============

async function autoJoinUserRooms(socket: TypedSocket): Promise<void> {
  try {
    const roomIds = await roomMemberRepository.findRoomIdsByUserId(socket.data.userId)
    await Promise.all(roomIds.map((roomId) => socket.join(roomId)))
  } catch (err) {
    console.error('[socket] Failed to auto-join rooms:', err)
  }
}

// ============ TYPING ============

function registerTypingHandlers(socket: TypedSocket): void {
  socket.on('typing:start', (roomId) => {
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
