import { create } from 'zustand'

interface RoomState {
  selectedRoomId: string | null
  selectRoom: (roomId: string) => void
  clearRoom: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  selectedRoomId: null,
  selectRoom: (roomId) => set({ selectedRoomId: roomId }),
  clearRoom: () => set({ selectedRoomId: null }),
}))
