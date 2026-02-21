import pinoHttp from 'pino-http'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'
import type { IncomingMessage, ServerResponse } from 'http'

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage) => {
    return (req as IncomingMessage & { id?: string }).id || crypto.randomUUID()
  },
  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if (res.statusCode >= 500 || err) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
  autoLogging: {
    ignore: (req: IncomingMessage) => {
      if (env.NODE_ENV === 'production' && req.url === '/api/v1/health') return true
      return false
    },
  },
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
    return `${req.method} ${req.url} ${res.statusCode}`
  },
  customErrorMessage: (req: IncomingMessage, _res: ServerResponse, err: Error) => {
    return `${req.method} ${req.url} failed: ${err.message}`
  },
})
