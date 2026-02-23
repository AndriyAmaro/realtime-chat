import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { authLimiter, resetPasswordLimiter } from '../middleware/rateLimiter.js'
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../types/auth.js'

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

// PATCH /api/v1/auth/profile (protected)
router.patch(
  '/profile',
  authenticate,
  validate({ body: updateProfileSchema }),
  authController.updateProfile
)

// PATCH /api/v1/auth/password (protected)
router.patch(
  '/password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword
)

// POST /api/v1/auth/forgot-password
router.post(
  '/forgot-password',
  resetPasswordLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
)

// POST /api/v1/auth/reset-password
router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  authController.resetPassword
)

export default router
