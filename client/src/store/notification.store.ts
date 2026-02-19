import { create } from 'zustand'

interface NotificationState {
  /** Unread message count per roomId */
  unreadCounts: Record<string, number>
  /** Whether notification sound is enabled */
  soundEnabled: boolean

  incrementUnread: (roomId: string) => void
  clearUnread: (roomId: string) => void
  resetAll: () => void
  toggleSound: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCounts: {},
  soundEnabled: true,

  incrementUnread: (roomId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: (state.unreadCounts[roomId] ?? 0) + 1,
      },
    })),

  clearUnread: (roomId) =>
    set((state) => {
      const { [roomId]: _removed, ...rest } = state.unreadCounts
      void _removed
      return { unreadCounts: rest }
    }),

  resetAll: () => set({ unreadCounts: {} }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}))
