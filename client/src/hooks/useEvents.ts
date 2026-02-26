import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { eventService } from '@services/event.service'
import { useSocket } from '@hooks/useSocket'
import type { CreateEventInput, EventPayload } from '@/types/event'

// ============ QUERY KEYS ============

const eventKeys = {
  all: ['events'] as const,
  room: (roomId: string) => [...eventKeys.all, roomId] as const,
}

// ============ QUERY HOOKS ============

export function useRoomEvents(roomId: string | null) {
  const queryClient = useQueryClient()
  const { socket, isConnected } = useSocket()

  const query = useQuery({
    queryKey: eventKeys.room(roomId ?? ''),
    queryFn: () => eventService.listEvents(roomId!),
    enabled: !!roomId,
    staleTime: 30_000,
  })

  // Real-time socket listeners for event updates
  useEffect(() => {
    if (!socket || !roomId || !isConnected) return

    const handleCreated = (data: { roomId: string; event: EventPayload }) => {
      if (data.roomId !== roomId) return
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    }

    const handleUpdated = (data: { roomId: string; event: EventPayload }) => {
      if (data.roomId !== roomId) return
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    }

    const handleCancelled = (data: { roomId: string; eventId: string }) => {
      if (data.roomId !== roomId) return
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    }

    const handleRsvp = (data: { roomId: string; eventId: string }) => {
      if (data.roomId !== roomId) return
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    }

    socket.on('event:created', handleCreated)
    socket.on('event:updated', handleUpdated)
    socket.on('event:cancelled', handleCancelled)
    socket.on('event:rsvp', handleRsvp)

    return () => {
      socket.off('event:created', handleCreated)
      socket.off('event:updated', handleUpdated)
      socket.off('event:cancelled', handleCancelled)
      socket.off('event:rsvp', handleRsvp)
    }
  }, [socket, roomId, isConnected, queryClient])

  return query
}

// ============ MUTATION HOOKS ============

export function useCreateEvent(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEventInput) => eventService.createEvent(roomId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    },
  })
}

export function useCancelEvent(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventService.cancelEvent(roomId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    },
  })
}

export function useSendInvites(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, userIds }: { eventId: string; userIds: string[] }) =>
      eventService.sendInvites(roomId, eventId, { userIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    },
  })
}

export function useRespondInvite(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'ACCEPTED' | 'DECLINED' }) =>
      eventService.respondInvite(roomId, eventId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.room(roomId) })
    },
  })
}
