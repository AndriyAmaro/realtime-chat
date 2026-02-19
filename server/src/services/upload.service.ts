import multer from 'multer'
import path from 'path'
import { randomBytes } from 'crypto'
import { mkdirSync, existsSync } from 'fs'
import { env } from '../config/env.js'
import { AppError } from '../errors/index.js'

// ============ CONSTANTS ============

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
]

// ============ ENSURE UPLOAD DIR EXISTS ============

const uploadDir = path.resolve(env.UPLOAD_DIR)
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
}

// ============ MULTER STORAGE ============

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueId = randomBytes(8).toString('hex')
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueId}${ext}`)
  },
})

// ============ MULTER INSTANCE ============

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(new AppError('File type not allowed', 400))
      return
    }
    cb(null, true)
  },
})

// ============ HELPERS ============

export function isImageFile(mimetype: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimetype)
}

export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`
}
