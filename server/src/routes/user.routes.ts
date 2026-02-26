import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { userController } from '../controllers/user.controller.js'
import { userIdParamSchema, searchQuerySchema } from '../types/friendship.js'

const router = Router()

// All user routes require authentication
router.use(authenticate)

// GET /users/search?q=... — search users by name
router.get('/search', validate({ query: searchQuerySchema }), userController.search)

// GET /users/:userId/profile — view user profile
router.get('/:userId/profile', validate({ params: userIdParamSchema }), userController.getProfile)

export default router
