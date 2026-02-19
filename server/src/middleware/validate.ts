import type { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

interface ValidationSchemas {
  body?: ZodSchema
  params?: ZodSchema
  query?: ZodSchema
}

/**
 * Validates request data against Zod schemas.
 * Parsed body replaces req.body. For params/query (read-only in Express 5),
 * validated results are stored in res.locals.validated for controllers.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body)
    }
    if (schemas.params) {
      res.locals.params = schemas.params.parse(req.params)
    }
    if (schemas.query) {
      res.locals.query = schemas.query.parse(req.query)
    }
    next()
  }
}
