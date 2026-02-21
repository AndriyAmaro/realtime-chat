import type { TypedSocket } from '../types/socket.js'

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

/**
 * Creates a per-event rate limiter for socket handlers.
 * Tracks request counts per userId within a sliding window.
 * Returns `true` if allowed, `false` if rate limited (also emits error).
 */
export function createSocketRateLimiter(opts: RateLimitOptions) {
  const counters = new Map<string, RateLimitEntry>()

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of counters) {
      if (now > entry.resetAt) {
        counters.delete(key)
      }
    }
  }, 60_000)
  cleanupInterval.unref() // don't keep process alive

  return function checkRateLimit(socket: TypedSocket): boolean {
    const key = socket.data.userId
    const now = Date.now()
    const entry = counters.get(key)

    if (!entry || now > entry.resetAt) {
      counters.set(key, { count: 1, resetAt: now + opts.windowMs })
      return true
    }

    if (entry.count >= opts.maxRequests) {
      socket.emit('error', { message: 'Muitas requisições. Aguarde alguns segundos.' })
      return false
    }

    entry.count++
    return true
  }
}

// Pre-configured limiters per event type
export const rateLimiters = {
  messageSend: createSocketRateLimiter({ maxRequests: 10, windowMs: 5_000 }),
  messageEdit: createSocketRateLimiter({ maxRequests: 5, windowMs: 5_000 }),
  messageDelete: createSocketRateLimiter({ maxRequests: 5, windowMs: 10_000 }),
  messageReact: createSocketRateLimiter({ maxRequests: 10, windowMs: 5_000 }),
  typingStart: createSocketRateLimiter({ maxRequests: 3, windowMs: 2_000 }),
}
