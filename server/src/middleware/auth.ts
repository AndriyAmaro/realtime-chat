import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AuthError } from '../errors/index.js'
import type { AuthPayload, AuthenticatedRequest } from '../types/api.js'

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid authorization header')
  }

  const token = header.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload
    ;(req as AuthenticatedRequest).user = payload
    next()
  } catch {
    throw new AuthError('Invalid or expired token')
  }
}
