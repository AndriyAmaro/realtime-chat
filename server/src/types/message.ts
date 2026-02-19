import { z } from 'zod'

// ============ MESSAGE QUERY SCHEMAS ============

export const searchMessagesQuerySchema = z.object({
  q: z.string().min(1, 'Termo de busca obrigatório').max(100, 'Termo muito longo').trim(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type SearchMessagesQuery = z.infer<typeof searchMessagesQuerySchema>
