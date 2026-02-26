import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomService } from '@services/room.service'
import type { CreateRoomPayload } from '@services/room.service'
import type { Room } from '@/types/room'

// ============ QUERY KEYS ============

export const roomKeys = {
  all: ['rooms'] as const,
  myRooms: () => [...roomKeys.all, 'my'] as const,
  publicRooms: (search?: string) => [...roomKeys.all, 'public', search] as const,
  detail: (id: string) => [...roomKeys.all, 'detail', id] as const,
  members: (id: string) => [...roomKeys.all, 'members', id] as const,
}

// ============ QUERIES ============

export function useMyRooms() {
  return useQuery({
    queryKey: roomKeys.myRooms(),
    queryFn: () => roomService.listMyRooms(),
    staleTime: 1000 * 30, // 30s — rooms update frequently
  })
}

export function usePublicRooms(search?: string) {
  return useQuery({
    queryKey: roomKeys.publicRooms(search),
    queryFn: () => roomService.listPublicRooms({ search }),
    staleTime: 1000 * 60, // 1min
  })
}

export function useRoom(roomId: string | null) {
  return useQuery({
    queryKey: roomKeys.detail(roomId ?? ''),
    queryFn: () => roomService.getRoom(roomId!),
    enabled: !!roomId,
  })
}

export function useRoomMembers(roomId: string | null) {
  return useQuery({
    queryKey: roomKeys.members(roomId ?? ''),
    queryFn: () => roomService.listMembers(roomId!),
    enabled: !!roomId,
  })
}

// ============ MUTATIONS ============

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => roomService.createRoom(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() })
      void queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useJoinRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, inviteCode }: { roomId: string; inviteCode?: string }) =>
      roomService.joinRoom(roomId, inviteCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() })
    },
  })
}

export function useLeaveRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => roomService.leaveRoom(roomId),
    onMutate: async (roomId) => {
      await queryClient.cancelQueries({ queryKey: roomKeys.myRooms() })
      const previousRooms = queryClient.getQueryData<Room[]>(roomKeys.myRooms())
      queryClient.setQueryData<Room[]>(roomKeys.myRooms(), (old) =>
        old?.filter((r) => r.id !== roomId)
      )
      return { previousRooms }
    },
    onError: (_err, _roomId, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(roomKeys.myRooms(), context.previousRooms)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => roomService.deleteRoom(roomId),
    onMutate: async (roomId) => {
      await queryClient.cancelQueries({ queryKey: roomKeys.myRooms() })
      const previousRooms = queryClient.getQueryData<Room[]>(roomKeys.myRooms())
      queryClient.setQueryData<Room[]>(roomKeys.myRooms(), (old) =>
        old?.filter((r) => r.id !== roomId)
      )
      queryClient.removeQueries({ queryKey: roomKeys.detail(roomId) })
      queryClient.removeQueries({ queryKey: roomKeys.members(roomId) })
      return { previousRooms }
    },
    onError: (_err, _roomId, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(roomKeys.myRooms(), context.previousRooms)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.myRooms() })
    },
  })
}

export function useRegenerateInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => roomService.regenerateInviteCode(roomId),
    onSuccess: (_data, roomId) => {
      void queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) })
    },
  })
}
