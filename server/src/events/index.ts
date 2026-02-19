import { registerRoomHandlers } from './room.handler.js'
import { registerMessageHandlers } from './message.handler.js'
import { registerStatusHandlers } from './status.handler.js'
import type { TypedServer, TypedSocket } from '../types/socket.js'

/**
 * Register all socket event handlers for a connected socket.
 * Called once per client connection after auth middleware passes.
 */
export function registerSocketHandlers(io: TypedServer, socket: TypedSocket): void {
  // Typing indicator events
  registerTypingHandlers(socket)

  // Room join/leave
  registerRoomHandlers(io, socket)

  // Messages (send/history)
  registerMessageHandlers(io, socket)

  // Online/offline status
  registerStatusHandlers(io, socket)
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
