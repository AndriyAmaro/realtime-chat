import pino from 'pino'
import { env } from './env.js'

const isProduction = env.NODE_ENV === 'production'

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } },
  base: { env: env.NODE_ENV },
  redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'refreshToken'],
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
})

/**
 * Create a child logger bound to a specific module/context.
 */
export function createChildLogger(module: string) {
  return logger.child({ module })
}
