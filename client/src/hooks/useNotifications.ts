import { useEffect } from 'react'
import { useAuthStore } from '@store/auth.store'
import { useRoomStore } from '@store/room.store'
import { useNotificationStore } from '@store/notification.store'
import type { TypedSocket } from '@services/socket'
import type { MessagePayload } from '@/types/socket'
import type { ToastData } from './useToast'

interface UseNotificationsOptions {
  socket: TypedSocket | null
  isConnected: boolean
  addToast: (toast: Omit<ToastData, 'id'>) => void
}

let audioCtx: AudioContext | null = null

function playNotificationSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext()
    }

    const oscillator = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    oscillator.connect(gain)
    gain.connect(audioCtx.destination)

    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime)
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.3)
  } catch {
    // Audio not available (e.g. no user interaction yet)
  }
}

/**
 * Global notification hook — listens to message:new for ALL rooms.
 * When a message arrives for a room other than the currently selected one:
 * - Increments unread count in notification store
 * - Plays notification sound (if enabled)
 * - Shows a toast notification
 */
export function useNotifications({ socket, isConnected, addToast }: UseNotificationsOptions): void {
  const userId = useAuthStore((s) => s.user?.id)

  useEffect(() => {
    if (!socket || !isConnected) return

    function onNewMessage(message: MessagePayload) {
      // Don't notify for own messages
      if (message.userId === userId) return

      // Don't notify for the currently active room
      const selectedRoomId = useRoomStore.getState().selectedRoomId
      if (message.roomId === selectedRoomId) return

      // Increment unread count
      useNotificationStore.getState().incrementUnread(message.roomId)

      // Play notification sound
      const { soundEnabled } = useNotificationStore.getState()
      if (soundEnabled) {
        playNotificationSound()
      }

      // Show toast
      addToast({
        variant: 'info',
        title: message.user.name,
        description:
          message.type === 'TEXT'
            ? message.content.length > 60
              ? message.content.slice(0, 60) + '…'
              : message.content
            : message.type === 'IMAGE'
              ? 'Enviou uma imagem'
              : 'Enviou um arquivo',
        duration: 4000,
      })
    }

    socket.on('message:new', onNewMessage)

    return () => {
      socket.off('message:new', onNewMessage)
    }
  }, [socket, isConnected, userId, addToast])
}
