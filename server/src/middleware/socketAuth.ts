import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { AuthPayload } from '../types/api.js'
import type { TypedSocket } from '../types/socket.js'

/**
 * Socket.io authentication middleware.
 * Verifies JWT from handshake auth token and attaches user data to socket.
 */
export function socketAuth(socket: TypedSocket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth?.token as string | undefined

  if (!token) {
    return next(new Error('Authentication required'))
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload
    socket.data.userId = payload.userId
    socket.data.email = payload.email
    next()
  } catch {
    next(new Error('Invalid or expired token'))
  }
}
