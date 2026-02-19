import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { env } from './env.js'
import { socketAuth } from '../middleware/socketAuth.js'
import { registerSocketHandlers } from '../events/index.js'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketUser,
  TypedServer,
  TypedSocket,
} from '../types/socket.js'

/**
 * Initialize Socket.io on the existing HTTP server.
 * - CORS configured from env
 * - JWT auth middleware on handshake
 * - All event handlers registered per connection
 */
export function initializeSocket(httpServer: HttpServer): TypedServer {
  const io: TypedServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketUser
  >(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
  })

  // ---- Auth middleware ----
  io.use(socketAuth)

  // ---- Connection handler ----
  io.on('connection', (socket: TypedSocket) => {
    console.log(`[socket] Connected: ${socket.data.userId} (${socket.id})`)

    // Register all event handlers
    registerSocketHandlers(io, socket)

    socket.on('disconnect', (reason) => {
      console.log(`[socket] Disconnected: ${socket.data.userId} (${reason})`)
    })
  })

  console.log('[socket] Socket.io initialized')

  return io
}
