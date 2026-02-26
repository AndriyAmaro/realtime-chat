import { api } from './api'
import type {
  EventPayload,
  CreateEventInput,
  SendInvitesInput,
  EventInvitePayload,
} from '@/types/event'

export const eventService = {
  async listEvents(roomId: string) {
    return api.get<EventPayload[]>(`/rooms/${roomId}/events`)
  },

  async createEvent(roomId: string, input: CreateEventInput) {
    return api.post<EventPayload>(`/rooms/${roomId}/events`, input)
  },

  async updateEvent(roomId: string, eventId: string, input: Partial<CreateEventInput>) {
    return api.patch<EventPayload>(`/rooms/${roomId}/events/${eventId}`, input)
  },

  async cancelEvent(roomId: string, eventId: string) {
    return api.delete<void>(`/rooms/${roomId}/events/${eventId}`)
  },

  async sendInvites(roomId: string, eventId: string, input: SendInvitesInput) {
    return api.post<EventInvitePayload[]>(`/rooms/${roomId}/events/${eventId}/invites`, input)
  },

  async respondInvite(roomId: string, eventId: string, status: 'ACCEPTED' | 'DECLINED') {
    return api.patch<EventInvitePayload>(`/rooms/${roomId}/events/${eventId}/invites/respond`, {
      status,
    })
  },
}
