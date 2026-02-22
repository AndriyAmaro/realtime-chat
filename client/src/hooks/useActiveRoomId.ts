/**
 * Module-level ref for the currently active room ID.
 * Used by useNotifications to read the active room inside
 * Socket.io event handlers (outside the React render cycle).
 * Kept in sync by ChatLayout on every render.
 */
let _activeRoomId: string | null = null

export function getActiveRoomId(): string | null {
  return _activeRoomId
}

export function setActiveRoomId(id: string | null): void {
  _activeRoomId = id
}
