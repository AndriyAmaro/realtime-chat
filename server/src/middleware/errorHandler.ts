import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError, ValidationError } from '../errors/index.js'
import { env } from '../config/env.js'
import type { ApiResponse } from '../types/api.js'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Zod validation errors → 422
  if (err instanceof ZodError) {
    const formatted = err.flatten().fieldErrors as Record<string, string[]>
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: formatted,
    }
    res.status(422).json(response)
    return
  }

  // Custom validation errors → 422
  if (err instanceof ValidationError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
      data: err.errors,
    }
    res.status(err.statusCode).json(response)
    return
  }

  // Known operational errors → specific status code
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
    }
    res.status(err.statusCode).json(response)
    return
  }

  // Unknown errors → 500
  console.error('💥 Unexpected error:', err)

  const response: ApiResponse = {
    success: false,
    error:
      env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error',
  }
  res.status(500).json(response)
}
