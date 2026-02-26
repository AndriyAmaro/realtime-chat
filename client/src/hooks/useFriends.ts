import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { friendshipService, userService } from '@services/friendship.service'
import type { Friendship } from '@/types/friendship'

// ============ QUERY KEYS ============

export const friendKeys = {
  all: ['friends'] as const,
  list: () => [...friendKeys.all, 'list'] as const,
  pendingReceived: () => [...friendKeys.all, 'pending-received'] as const,
  pendingSent: () => [...friendKeys.all, 'pending-sent'] as const,
  pendingCount: () => [...friendKeys.all, 'pending-count'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  userSearch: (query: string) => ['user', 'search', query] as const,
}

// ============ QUERIES ============

export function useFriends() {
  return useQuery({
    queryKey: friendKeys.list(),
    queryFn: () => friendshipService.listFriends(),
    staleTime: 1000 * 30,
  })
}

export function usePendingReceived() {
  return useQuery({
    queryKey: friendKeys.pendingReceived(),
    queryFn: () => friendshipService.listPendingReceived(),
    staleTime: 1000 * 15,
  })
}

export function usePendingSent() {
  return useQuery({
    queryKey: friendKeys.pendingSent(),
    queryFn: () => friendshipService.listPendingSent(),
    staleTime: 1000 * 15,
  })
}

export function usePendingCount() {
  return useQuery({
    queryKey: friendKeys.pendingCount(),
    queryFn: () => friendshipService.countPending(),
    staleTime: 1000 * 10,
  })
}

export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: friendKeys.userProfile(userId ?? ''),
    queryFn: () => userService.getProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30,
  })
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: friendKeys.userSearch(query),
    queryFn: () => userService.search(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 15,
  })
}

// ============ MUTATIONS ============

export function useSendFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (receiverId: string) => friendshipService.sendRequest(receiverId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: friendKeys.pendingSent() })
      void queryClient.invalidateQueries({ queryKey: friendKeys.list() })
    },
  })
}

export function useRespondToRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      friendshipId,
      action,
    }: {
      friendshipId: string
      action: 'accept' | 'decline'
    }) => friendshipService.respondToRequest(friendshipId, action),
    onMutate: async ({ friendshipId }) => {
      await queryClient.cancelQueries({ queryKey: friendKeys.pendingReceived() })
      const previousPending = queryClient.getQueryData<Friendship[]>(friendKeys.pendingReceived())
      queryClient.setQueryData<Friendship[]>(friendKeys.pendingReceived(), (old) =>
        old?.filter((f) => f.id !== friendshipId)
      )
      return { previousPending }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPending) {
        queryClient.setQueryData(friendKeys.pendingReceived(), context.previousPending)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: friendKeys.all })
    },
  })
}

export function useRemoveFriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (friendshipId: string) => friendshipService.removeFriend(friendshipId),
    onMutate: async (friendshipId) => {
      await queryClient.cancelQueries({ queryKey: friendKeys.list() })
      const previousFriends = queryClient.getQueryData<Friendship[]>(friendKeys.list())
      queryClient.setQueryData<Friendship[]>(friendKeys.list(), (old) =>
        old?.filter((f) => f.id !== friendshipId)
      )
      return { previousFriends }
    },
    onError: (_err, _friendshipId, context) => {
      if (context?.previousFriends) {
        queryClient.setQueryData(friendKeys.list(), context.previousFriends)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: friendKeys.all })
    },
  })
}
