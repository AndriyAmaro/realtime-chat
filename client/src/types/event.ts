// ============ EVENT TYPES ============

export interface EventInvitePayload {
  id: string
  userId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  respondedAt: string | null
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

export interface EventPayload {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  roomId: string
  createdBy: string
  status: 'SCHEDULED' | 'CANCELLED'
  createdAt: string
  creator: {
    id: string
    name: string
    avatar: string | null
  }
  invites: EventInvitePayload[]
}

export interface CreateEventInput {
  title: string
  description?: string
  startTime: string
  endTime: string
}

export interface SendInvitesInput {
  userIds: string[]
}

export interface RespondInviteInput {
  status: 'ACCEPTED' | 'DECLINED'
}
