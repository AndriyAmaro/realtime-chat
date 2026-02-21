import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError, ValidationError } from '../errors/index.js'
import { env } from '../config/env.js'
import { createChildLogger } from '../config/logger.js'
import { errorTracker } from '../services/errorTracker.service.js'
import type { ApiResponse, AuthenticatedRequest } from '../types/api.js'

const log = createChildLogger('error-handler')

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = (req as Request & { id?: string }).id
  const userId = (req as AuthenticatedRequest).user?.userId

  // Zod validation errors -> 422
  if (err instanceof ZodError) {
    const formatted = err.flatten().fieldErrors as Record<string, string[]>
    log.warn({ requestId, url: req.url, errors: formatted }, 'Validation failed (Zod)')

    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: formatted,
      requestId,
    }
    res.status(422).json(response)
    return
  }

  // Custom validation errors -> 422
  if (err instanceof ValidationError) {
    log.warn({ requestId, url: req.url, errors: err.errors }, 'Validation failed')

    const response: ApiResponse = {
      success: false,
      error: err.message,
      data: err.errors,
      requestId,
    }
    res.status(err.statusCode).json(response)
    return
  }

  // Known operational errors -> specific status code
  if (err instanceof AppError) {
    const logLevel = err.statusCode >= 500 ? 'error' : 'warn'
    log[logLevel]({ requestId, url: req.url, statusCode: err.statusCode, err }, err.message)

    if (err.statusCode >= 500) {
      errorTracker.track({
        error: err,
        statusCode: err.statusCode,
        requestId,
        userId,
        url: req.url,
        method: req.method,
      })
    }

    const response: ApiResponse = {
      success: false,
      error: err.message,
      requestId,
    }
    res.status(err.statusCode).json(response)
    return
  }

  // Unknown errors -> 500
  log.error({ requestId, url: req.url, method: req.method, err }, 'Unexpected error')
  errorTracker.track({
    error: err,
    statusCode: 500,
    requestId,
    userId,
    url: req.url,
    method: req.method,
  })

  const response: ApiResponse = {
    success: false,
    error:
      env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error',
    requestId,
  }
  res.status(500).json(response)
}
