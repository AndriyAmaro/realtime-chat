import jwt from 'jsonwebtoken'
import { createHmac } from 'crypto'
import { env } from '../config/env.js'

interface ResetTokenPayload {
  userId: string
  email: string
}

/**
 * Derives a per-user signing secret by combining JWT_SECRET with
 * the user's current password hash. When the password changes,
 * any previously issued token becomes invalid automatically.
 */
function deriveSecret(passwordHash: string): string {
  return createHmac('sha256', env.JWT_SECRET).update(passwordHash).digest('hex')
}

export function generateResetToken(payload: ResetTokenPayload, passwordHash: string): string {
  return jwt.sign(payload, deriveSecret(passwordHash), {
    expiresIn: '15m',
  } as jwt.SignOptions)
}

export function verifyResetToken(token: string, passwordHash: string): ResetTokenPayload {
  return jwt.verify(token, deriveSecret(passwordHash)) as ResetTokenPayload
}
