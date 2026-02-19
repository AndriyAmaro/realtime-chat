import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../services/upload.service.js'
import { uploadController } from '../controllers/upload.controller.js'

const router = Router()

// POST /api/v1/uploads — Upload a file (authenticated)
router.post('/', authenticate, upload.single('file'), uploadController.uploadFile)

export default router
