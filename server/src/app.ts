import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import { createServer } from 'http'

import swaggerUi from 'swagger-ui-express'

import { env, logger, prisma } from './config/index.js'
import { swaggerSpec } from './config/swagger.js'
import { initializeSocket } from './config/socket.js'
import { requestId } from './middleware/requestId.js'
import { responseTime } from './middleware/responseTime.js'
import { httpLogger } from './middleware/httpLogger.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { shutdownService } from './services/shutdown.service.js'
import { metricsService } from './services/metrics.service.js'
import { errorTracker } from './services/errorTracker.service.js'
import routes from './routes/index.js'

// ============ EXPRESS APP ============

const app = express()
const httpServer = createServer(app)

// ============ TRUST PROXY (Railway, Vercel, etc.) ============

app.set('trust proxy', 1)

// ============ GLOBAL MIDDLEWARE ============

app.use(helmet())
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(requestId)
app.use(responseTime)
app.use(httpLogger)
app.use(apiLimiter)

// ============ STATIC FILES ============

app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)))

// ============ API DOCS ============

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Realtime Chat API — Swagger',
  })
)
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec)
})

// ============ ROUTES ============

app.use('/api/v1', routes)

// ============ ERROR HANDLER ============

app.use(errorHandler)

// ============ SOCKET.IO ============

const io = initializeSocket(httpServer)

// ============ SERVER START ============

httpServer.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, healthCheck: `/api/v1/health`, apiDocs: `/api/docs` },
    'Server started'
  )
})

// ============ GRACEFUL SHUTDOWN ============

shutdownService.register('Socket.io shutdown', async () => {
  io.disconnectSockets(true)
  io.close()
})

shutdownService.register('HTTP server shutdown', async () => {
  await new Promise<void>((resolve, reject) => {
    httpServer.close((err) => (err ? reject(err) : resolve()))
  })
})

shutdownService.register('Prisma disconnect', async () => {
  await prisma.$disconnect()
})

shutdownService.register('Final metrics log', async () => {
  logger.info({ metrics: metricsService.getSnapshot() }, 'Final metrics snapshot')
})

async function gracefulShutdown(signal: string): Promise<void> {
  const forceExitTimer = setTimeout(() => {
    logger.error('Forced shutdown after 10s timeout')
    process.exit(1)
  }, 10_000)
  forceExitTimer.unref()

  await shutdownService.execute(signal)
  process.exit(0)
}

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM').catch(() => process.exit(1))
})
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT').catch(() => process.exit(1))
})

// ============ UNHANDLED ERRORS ============

process.on('unhandledRejection', (reason: unknown) => {
  const err = reason instanceof Error ? reason : new Error(String(reason))
  logger.fatal({ err }, 'Unhandled promise rejection')
  errorTracker.track({ error: err, statusCode: 500 })
})

process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down')
  errorTracker.track({ error: err, statusCode: 500 })
  setTimeout(() => process.exit(1), 1000)
})

export { app, httpServer, io }
