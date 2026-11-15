import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { env } from './env.js'
import { createChildLogger } from './logger.js'
import { metricsService } from '../services/metrics.service.js'
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

const log = createChildLogger('socket')

let ioInstance: TypedServer | null = null

/** Get the Socket.io server instance (available after initializeSocket) */
export function getIO(): TypedServer | null {
  return ioInstance
}

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
    // Keep intervals short for Cloudflare Worker proxy compatibility (max ~25s)
    pingInterval: 10_000,
    pingTimeout: 5_000,
  })

  // ---- Auth middleware ----
  io.use(socketAuth)

  // ---- Connection handler ----
  io.on('connection', (socket: TypedSocket) => {
    log.info({ userId: socket.data.userId, socketId: socket.id }, 'Socket connected')
    metricsService.recordSocketConnection()

    // Register all event handlers
    registerSocketHandlers(io, socket)

    socket.on('disconnect', (reason) => {
      log.info({ userId: socket.data.userId, socketId: socket.id, reason }, 'Socket disconnected')
      metricsService.recordSocketDisconnection()
    })
  })

  ioInstance = io
  log.info('Socket.io initialized')

  return io
}
