import type { Request, Response, NextFunction } from 'express'
import { metricsService } from '../services/metrics.service.js'

/**
 * Measures request duration, sets X-Response-Time header,
 * and records the metric for the /admin/metrics endpoint.
 */
export function responseTime(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint()

  // Override writeHead to inject header before it's sent
  const originalWriteHead = res.writeHead
  let headerSet = false

  res.writeHead = function (this: Response, ...args: unknown[]) {
    if (!headerSet) {
      const durationNs = Number(process.hrtime.bigint() - start)
      const durationMs = Math.round(durationNs / 1_000_000)
      this.setHeader('X-Response-Time', `${durationMs}ms`)
      headerSet = true
    }
    return originalWriteHead.apply(this, args as [statusCode: number])
  } as typeof res.writeHead

  res.on('finish', () => {
    const durationNs = Number(process.hrtime.bigint() - start)
    const durationMs = Math.round(durationNs / 1_000_000)
    const url = req.route?.path
      ? `${req.baseUrl}${req.route.path}`
      : (req.originalUrl?.split('?')[0] ?? req.url)

    metricsService.recordHttpRequest(req.method, url, res.statusCode, durationMs)
  })

  next()
}
