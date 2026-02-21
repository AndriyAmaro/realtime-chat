/**
 * In-memory error tracker.
 * Groups errors by fingerprint, stores samples, and provides summary.
 * Bounded to prevent memory leaks (max 100 entries, 5 samples each).
 */

interface TrackedError {
  fingerprint: string
  message: string
  stack?: string
  statusCode: number
  firstSeen: string
  lastSeen: string
  count: number
  samples: Array<{
    timestamp: string
    requestId?: string
    userId?: string
    url?: string
    method?: string
  }>
}

const MAX_ENTRIES = 100
const MAX_SAMPLES = 5

class ErrorTrackerService {
  private errors = new Map<string, TrackedError>()

  track(params: {
    error: Error
    statusCode: number
    requestId?: string
    userId?: string
    url?: string
    method?: string
  }): void {
    const { error, statusCode, requestId, userId, url, method } = params
    const fingerprint = this.computeFingerprint(error, statusCode)
    const now = new Date().toISOString()

    const existing = this.errors.get(fingerprint)

    if (existing) {
      existing.count++
      existing.lastSeen = now
      existing.samples.push({ timestamp: now, requestId, userId, url, method })
      if (existing.samples.length > MAX_SAMPLES) {
        existing.samples = existing.samples.slice(-MAX_SAMPLES)
      }
    } else {
      // Evict oldest if at capacity
      if (this.errors.size >= MAX_ENTRIES) {
        const oldestKey = this.errors.keys().next().value
        if (oldestKey) this.errors.delete(oldestKey)
      }

      this.errors.set(fingerprint, {
        fingerprint,
        message: error.message,
        stack: error.stack,
        statusCode,
        firstSeen: now,
        lastSeen: now,
        count: 1,
        samples: [{ timestamp: now, requestId, userId, url, method }],
      })
    }
  }

  getAll(): TrackedError[] {
    return Array.from(this.errors.values()).sort(
      (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    )
  }

  getSummary(): {
    uniqueErrors: number
    totalOccurrences: number
    topErrors: Array<{ fingerprint: string; message: string; count: number }>
  } {
    const all = this.getAll()
    return {
      uniqueErrors: all.length,
      totalOccurrences: all.reduce((sum, e) => sum + e.count, 0),
      topErrors: all.slice(0, 10).map((e) => ({
        fingerprint: e.fingerprint,
        message: e.message,
        count: e.count,
      })),
    }
  }

  clear(): void {
    this.errors.clear()
  }

  private computeFingerprint(error: Error, statusCode: number): string {
    const firstFrame = error.stack?.split('\n')[1]?.trim() ?? 'unknown'
    const raw = `${error.name}:${error.message}:${firstFrame}:${statusCode}`
    let hash = 0
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i)
      hash = ((hash << 5) - hash + char) | 0
    }
    return `err_${Math.abs(hash).toString(36)}`
  }
}

export const errorTracker = new ErrorTrackerService()
