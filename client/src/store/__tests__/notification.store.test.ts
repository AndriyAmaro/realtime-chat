import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from '../notification.store'

describe('NotificationStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useNotificationStore.setState({
      unreadCounts: {},
      soundEnabled: true,
    })
  })

  describe('incrementUnread', () => {
    it('should start at 1 for a new room', () => {
      useNotificationStore.getState().incrementUnread('room-1')

      expect(useNotificationStore.getState().unreadCounts['room-1']).toBe(1)
    })

    it('should increment existing count', () => {
      const { incrementUnread } = useNotificationStore.getState()

      incrementUnread('room-1')
      incrementUnread('room-1')
      incrementUnread('room-1')

      expect(useNotificationStore.getState().unreadCounts['room-1']).toBe(3)
    })

    it('should track counts independently per room', () => {
      const { incrementUnread } = useNotificationStore.getState()

      incrementUnread('room-1')
      incrementUnread('room-1')
      incrementUnread('room-2')

      const { unreadCounts } = useNotificationStore.getState()
      expect(unreadCounts['room-1']).toBe(2)
      expect(unreadCounts['room-2']).toBe(1)
    })
  })

  describe('clearUnread', () => {
    it('should remove the count for a specific room', () => {
      const state = useNotificationStore.getState()
      state.incrementUnread('room-1')
      state.incrementUnread('room-2')

      useNotificationStore.getState().clearUnread('room-1')

      const { unreadCounts } = useNotificationStore.getState()
      expect(unreadCounts['room-1']).toBeUndefined()
      expect(unreadCounts['room-2']).toBe(1)
    })

    it('should not throw when clearing a room with no unreads', () => {
      expect(() => {
        useNotificationStore.getState().clearUnread('nonexistent')
      }).not.toThrow()
    })
  })

  describe('resetAll', () => {
    it('should clear all unread counts', () => {
      const state = useNotificationStore.getState()
      state.incrementUnread('room-1')
      state.incrementUnread('room-2')
      state.incrementUnread('room-3')

      useNotificationStore.getState().resetAll()

      expect(useNotificationStore.getState().unreadCounts).toEqual({})
    })
  })

  describe('toggleSound', () => {
    it('should toggle sound from enabled to disabled', () => {
      expect(useNotificationStore.getState().soundEnabled).toBe(true)

      useNotificationStore.getState().toggleSound()

      expect(useNotificationStore.getState().soundEnabled).toBe(false)
    })

    it('should toggle back to enabled', () => {
      useNotificationStore.getState().toggleSound() // true → false
      useNotificationStore.getState().toggleSound() // false → true

      expect(useNotificationStore.getState().soundEnabled).toBe(true)
    })
  })
})
