import { Router } from 'express'
import healthRouter from './health.js'
import authRouter from './auth.routes.js'
import roomRouter from './room.routes.js'

const router = Router()

// Health check (no auth required)
router.use(healthRouter)

// Auth routes (register, login, refresh, logout, me)
router.use('/auth', authRouter)

// Room routes (CRUD + members + invite codes)
router.use('/rooms', roomRouter)

export default router
