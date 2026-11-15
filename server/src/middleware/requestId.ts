import type { Request, Response, NextFunction } from 'express'

/**
 * Assigns a unique request ID to every incoming HTTP request.
 * - Checks for an existing X-Request-ID header (from load balancers / Cloudflare proxy)
 * - Falls back to crypto.randomUUID()
 * - Sets X-Request-ID on the response for client correlation
 * - Stores it on req.id for pino-http to pick up
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID()

  ;(req as Request & { id: string }).id = id
  res.setHeader('X-Request-ID', id)

  next()
}
