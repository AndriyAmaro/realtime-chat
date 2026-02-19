import { useEffect, useState } from 'react'
import type { TypedSocket } from '@services/socket'

type UserStatus = 'ONLINE' | 'OFFLINE' | 'AWAY'

interface UseOnlineStatusOptions {
  socket: TypedSocket | null
  roomId: string
  isConnected: boolean
}

interface UseOnlineStatusReturn {
  /** Set of user IDs currently online in this room */
  onlineUserIds: Set<string>
  /** Get real-time status for a specific user (falls back to provided default) */
  getUserStatus: (userId: string, fallback: string) => UserStatus
  /** Count of online users */
  onlineCount: number
}

/**
 * Tracks real-time online/offline status of users in a room.
 * Listens to `user:status` and `room:members_online` socket events.
 */
export function useOnlineStatus({
  socket,
  roomId,
  isConnected,
}: UseOnlineStatusOptions): UseOnlineStatusReturn {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  // Reset when room changes
  const [prevRoomId, setPrevRoomId] = useState(roomId)
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId)
    setOnlineUserIds(new Set())
  }

  useEffect(() => {
    if (!socket || !isConnected) return

    function onMembersOnline(data: { roomId: string; userIds: string[] }) {
      if (data.roomId !== roomId) return
      setOnlineUserIds(new Set(data.userIds))
    }

    function onUserStatus(data: { userId: string; status: UserStatus }) {
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        if (data.status === 'ONLINE') {
          next.add(data.userId)
        } else {
          next.delete(data.userId)
        }
        return next
      })
    }

    socket.on('room:members_online', onMembersOnline)
    socket.on('user:status', onUserStatus)

    return () => {
      socket.off('room:members_online', onMembersOnline)
      socket.off('user:status', onUserStatus)
    }
  }, [socket, isConnected, roomId])

  function getUserStatus(userId: string, fallback: string): UserStatus {
    if (onlineUserIds.has(userId)) return 'ONLINE'
    // If we have online data and user is not in it, they're offline
    if (onlineUserIds.size > 0) return 'OFFLINE'
    // No socket data yet — use the REST API fallback
    return fallback as UserStatus
  }

  return {
    onlineUserIds,
    getUserStatus,
    onlineCount: onlineUserIds.size,
  }
}
