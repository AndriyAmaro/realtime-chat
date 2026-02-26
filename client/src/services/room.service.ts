import { api } from './api'
import type { Room, RoomDetail, RoomMember } from '@/types/room'

interface CreateRoomPayload {
  name: string
  description?: string
  isPrivate: boolean
}

interface UpdateRoomPayload {
  name?: string
  description?: string | null
  isPrivate?: boolean
}

interface ListRoomsParams {
  page?: number
  limit?: number
  search?: string
}

function buildQuery(params: ListRoomsParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  const str = query.toString()
  return str ? `?${str}` : ''
}

export const roomService = {
  listMyRooms(params: ListRoomsParams = {}) {
    return api.get<Room[]>(`/rooms${buildQuery(params)}`)
  },

  listPublicRooms(params: ListRoomsParams = {}) {
    return api.get<Room[]>(`/rooms/public${buildQuery(params)}`)
  },

  getRoom(roomId: string) {
    return api.get<RoomDetail>(`/rooms/${roomId}`)
  },

  createRoom(payload: CreateRoomPayload) {
    return api.post<Room & { inviteCode: string | null }>('/rooms', payload)
  },

  updateRoom(roomId: string, payload: UpdateRoomPayload) {
    return api.post<Room>(`/rooms/${roomId}`, payload)
  },

  deleteRoom(roomId: string) {
    return api.delete<void>(`/rooms/${roomId}`)
  },

  joinRoom(roomId: string, inviteCode?: string) {
    return api.post<RoomMember>(`/rooms/${roomId}/join`, { inviteCode })
  },

  leaveRoom(roomId: string) {
    return api.post<void>(`/rooms/${roomId}/leave`)
  },

  listMembers(roomId: string) {
    return api.get<RoomMember[]>(`/rooms/${roomId}/members`)
  },

  addMember(roomId: string, userId: string) {
    return api.post<RoomMember>(`/rooms/${roomId}/members`, { userId })
  },

  removeMember(roomId: string, memberId: string) {
    return api.delete<void>(`/rooms/${roomId}/members/${memberId}`)
  },

  regenerateInviteCode(roomId: string) {
    return api.post<{ id: string; inviteCode: string }>(`/rooms/${roomId}/invite-code`)
  },
}

export type { CreateRoomPayload, UpdateRoomPayload, ListRoomsParams }
