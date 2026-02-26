import { api } from './api'
import type { Friendship, UserProfile, SearchUser } from '@/types/friendship'

export const friendshipService = {
  listFriends() {
    return api.get<Friendship[]>('/friends')
  },

  sendRequest(receiverId: string) {
    return api.post<Friendship>('/friends/requests', { receiverId })
  },

  respondToRequest(friendshipId: string, action: 'accept' | 'decline') {
    return api.patch<Friendship>(`/friends/requests/${friendshipId}`, { action })
  },

  removeFriend(friendshipId: string) {
    return api.delete<void>(`/friends/${friendshipId}`)
  },

  listPendingReceived() {
    return api.get<Friendship[]>('/friends/requests/received')
  },

  listPendingSent() {
    return api.get<Friendship[]>('/friends/requests/sent')
  },

  countPending() {
    return api.get<{ count: number }>('/friends/requests/count')
  },
}

export const userService = {
  getProfile(userId: string) {
    return api.get<UserProfile>(`/users/${userId}/profile`)
  },

  search(query: string) {
    return api.get<SearchUser[]>(`/users/search?q=${encodeURIComponent(query)}`)
  },
}
