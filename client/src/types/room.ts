import type { User } from '@services/auth.service'

// ============ ROOM TYPES ============

export interface Room {
  id: string
  name: string
  description: string | null
  isPrivate: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
  owner: Pick<User, 'id' | 'name' | 'avatar'>
  _count?: { members: number; messages: number }
}

export interface RoomDetail extends Room {
  inviteCode?: string
  members: RoomMember[]
}

export interface RoomMember {
  id: string
  userId: string
  roomId: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: string
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar'> & { status: string }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
