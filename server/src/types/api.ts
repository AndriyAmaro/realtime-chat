import type { Request } from 'express'

// ============ API RESPONSE SHAPE ============

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: PaginationMeta
  requestId?: string
}

export interface PaginationMeta {
  page?: number
  limit?: number
  total?: number
  cursor?: string
  hasMore?: boolean
}

// ============ AUTHENTICATED REQUEST ============

export interface AuthPayload {
  userId: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user: AuthPayload
}

// ============ PAGINATION PARAMS ============

export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

export interface OffsetPaginationParams {
  page: number
  limit: number
}
