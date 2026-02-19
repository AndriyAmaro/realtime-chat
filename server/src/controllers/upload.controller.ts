import type { Request, Response } from 'express'
import { AppError } from '../errors/index.js'
import { isImageFile, getFileUrl } from '../services/upload.service.js'

export const uploadController = {
  /** Upload a single file */
  uploadFile(req: Request, res: Response): void {
    if (!req.file) {
      throw new AppError('No file uploaded', 400)
    }

    const { filename, mimetype, size, originalname } = req.file

    res.status(201).json({
      success: true,
      data: {
        url: getFileUrl(filename),
        filename,
        originalName: originalname,
        mimetype,
        size,
        isImage: isImageFile(mimetype),
      },
    })
  },
}
