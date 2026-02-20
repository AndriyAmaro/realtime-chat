import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import { createServer } from 'http'

import swaggerUi from 'swagger-ui-express'

import { env } from './config/index.js'
import { swaggerSpec } from './config/swagger.js'
import { initializeSocket } from './config/socket.js'
import { requestLogger } from './middleware/requestLogger.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
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
app.use(requestLogger)
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
  console.log(`🚀 Server running on port ${env.PORT}`)
  console.log(`📍 Environment: ${env.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${env.PORT}/api/v1/health`)
  console.log(`📚 API Docs: http://localhost:${env.PORT}/api/docs`)
})

// ============ GRACEFUL SHUTDOWN ============

function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`)
  io.close()
  httpServer.close(() => {
    console.log('✅ HTTP server closed')
    process.exit(0)
  })

  // Force exit after 10s
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

export { app, httpServer, io }
