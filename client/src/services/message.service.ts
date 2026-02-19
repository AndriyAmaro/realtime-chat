import { api } from './api'
import type { MessagePayload } from '@/types/socket'

interface SearchMessagesParams {
  roomId: string
  q: string
  page?: number
  limit?: number
}

export interface SearchMessagesResult {
  messages: MessagePayload[]
  page: number
  limit: number
  total: number
}

export const messageService = {
  async search({
    roomId,
    q,
    page = 1,
    limit = 20,
  }: SearchMessagesParams): Promise<SearchMessagesResult> {
    const params = new URLSearchParams({
      q,
      page: String(page),
      limit: String(limit),
    })
    return api.get<SearchMessagesResult>(`/rooms/${roomId}/messages/search?${params}`)
  },
}
