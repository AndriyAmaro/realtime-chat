import { z } from 'zod'

// ============ ROOM SCHEMAS ============

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  description: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres').trim().optional(),
  isPrivate: z.boolean().default(false),
})

export const updateRoomSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .trim()
    .nullable()
    .optional(),
  isPrivate: z.boolean().optional(),
})

export const joinRoomSchema = z.object({
  inviteCode: z.string().optional(),
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
})

export const roomIdParamSchema = z.object({
  roomId: z.string().uuid('ID de sala inválido'),
})

export const memberIdParamSchema = z.object({
  roomId: z.string().uuid('ID de sala inválido'),
  memberId: z.string().uuid('ID de membro inválido'),
})

export const addMemberSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
})

export const listRoomsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().optional(),
})

// ============ TYPES ============

export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>
export type JoinRoomInput = z.infer<typeof joinRoomSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
export type AddMemberInput = z.infer<typeof addMemberSchema>
export type ListRoomsQuery = z.infer<typeof listRoomsQuerySchema>
