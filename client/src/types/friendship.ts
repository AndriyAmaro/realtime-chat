// ============ FRIENDSHIP TYPES ============

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface FriendshipUser {
  id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  status: 'ONLINE' | 'OFFLINE' | 'AWAY'
  createdAt: string
}

export interface Friendship {
  id: string
  senderId: string
  receiverId: string
  status: FriendshipStatus
  createdAt: string
  updatedAt: string
  sender: FriendshipUser
  receiver: FriendshipUser
}

export interface SharedRoom {
  id: string
  name: string
  isPrivate: boolean
  _count: { members: number }
}

export interface UserProfile extends FriendshipUser {
  sharedRooms: SharedRoom[]
  friendship: {
    id: string
    status: FriendshipStatus
    isSender: boolean
  } | null
}

export interface SearchUser {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  status: 'ONLINE' | 'OFFLINE' | 'AWAY'
}
