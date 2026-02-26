import { z } from 'zod'

// ============ EVENT SCHEMAS ============

export const createEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100).trim(),
  description: z.string().max(500).trim().optional(),
  startTime: z.string().datetime({ message: 'Data de início inválida' }),
  endTime: z.string().datetime({ message: 'Data de fim inválida' }),
})

export const updateEventSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
})

export const sendInvitesSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um membro'),
})

export const respondInviteSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
})

export const roomIdParamSchema = z.object({
  roomId: z.string().uuid(),
})

export const eventIdParamSchema = z.object({
  roomId: z.string().uuid(),
  eventId: z.string().uuid(),
})

// ============ TYPES ============

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type SendInvitesInput = z.infer<typeof sendInvitesSchema>
export type RespondInviteInput = z.infer<typeof respondInviteSchema>
