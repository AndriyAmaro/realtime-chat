import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { registerSchema, loginSchema } from '../types/auth.js'

const router = Router()

// Rate limit all auth routes
router.use(authLimiter)

// POST /api/v1/auth/register
router.post('/register', validate({ body: registerSchema }), authController.register)

// POST /api/v1/auth/login
router.post('/login', validate({ body: loginSchema }), authController.login)

// POST /api/v1/auth/refresh-token
router.post('/refresh-token', authController.refreshToken)

// POST /api/v1/auth/logout
router.post('/logout', authController.logout)

// GET /api/v1/auth/me (protected)
router.get('/me', authenticate, authController.getProfile)

export default router
