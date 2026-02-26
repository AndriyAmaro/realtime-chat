import { Router } from 'express'
import healthRouter from './health.js'
import authRouter from './auth.routes.js'
import roomRouter from './room.routes.js'
import uploadRouter from './upload.routes.js'
import friendshipRouter from './friendship.routes.js'
import userRouter from './user.routes.js'
import eventRouter from './event.routes.js'
import { adminRouter } from './admin.routes.js'

const router = Router()

// Health check (no auth required)
router.use(healthRouter)

// Auth routes (register, login, refresh, logout, me)
router.use('/auth', authRouter)

// Room routes (CRUD + members + invite codes)
router.use('/rooms', roomRouter)

// Event routes (nested under /rooms/:roomId/events)
router.use('/rooms', eventRouter)

// Upload routes (file uploads)
router.use('/uploads', uploadRouter)

// Friendship routes (friend requests, list friends)
router.use('/friends', friendshipRouter)

// User routes (search, profile)
router.use('/users', userRouter)

// Admin routes (metrics, errors — protected)
router.use('/admin', adminRouter)

export default router
