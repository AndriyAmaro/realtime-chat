import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { friendKeys } from './useFriends'
import type { TypedSocket } from '@services/socket'
import type { ToastData } from './useToast'

interface UseFriendNotificationsOptions {
  socket: TypedSocket | null
  isConnected: boolean
  addToast: (toast: Omit<ToastData, 'id'>) => void
}

/**
 * Listens to friend-related socket events and invalidates caches + shows toasts.
 */
export function useFriendNotifications({
  socket,
  isConnected,
  addToast,
}: UseFriendNotificationsOptions): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket || !isConnected) return

    function onRequestReceived(data: { friendship: { sender: { name: string } } }) {
      void queryClient.invalidateQueries({ queryKey: friendKeys.pendingReceived() })
      void queryClient.invalidateQueries({ queryKey: friendKeys.pendingCount() })

      addToast({
        variant: 'info',
        title: 'Pedido de amizade',
        description: `${data.friendship.sender.name} quer ser seu amigo`,
        duration: 5000,
      })
    }

    function onRequestAccepted(data: { friendship: { receiver: { name: string } } }) {
      void queryClient.invalidateQueries({ queryKey: friendKeys.list() })
      void queryClient.invalidateQueries({ queryKey: friendKeys.pendingSent() })

      addToast({
        variant: 'success',
        title: 'Amizade aceita!',
        description: `${data.friendship.receiver.name} aceitou seu pedido`,
        duration: 5000,
      })
    }

    function onFriendRemoved() {
      void queryClient.invalidateQueries({ queryKey: friendKeys.list() })
    }

    socket.on('friend:request_received', onRequestReceived)
    socket.on('friend:request_accepted', onRequestAccepted)
    socket.on('friend:removed', onFriendRemoved)

    return () => {
      socket.off('friend:request_received', onRequestReceived)
      socket.off('friend:request_accepted', onRequestAccepted)
      socket.off('friend:removed', onFriendRemoved)
    }
  }, [socket, isConnected, queryClient, addToast])
}
