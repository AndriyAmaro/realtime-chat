import { z } from 'zod'

// ============ VALIDATION SCHEMAS ============

export const sendRequestSchema = z.object({
  receiverId: z.string().uuid('ID de usuário inválido'),
})

export const respondRequestSchema = z.object({
  action: z.enum(['accept', 'decline']),
})

export const friendshipIdParamSchema = z.object({
  friendshipId: z.string().uuid(),
})

export const userIdParamSchema = z.object({
  userId: z.string().uuid(),
})

export const searchQuerySchema = z.object({
  q: z.string().min(2, 'Busca deve ter pelo menos 2 caracteres').max(50),
})

// ============ TYPES ============

export type SendRequestInput = z.infer<typeof sendRequestSchema>
export type RespondRequestInput = z.infer<typeof respondRequestSchema>
export type SearchQuery = z.infer<typeof searchQuerySchema>
