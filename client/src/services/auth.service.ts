import { api } from './api'

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  status?: string
  createdAt?: string
}

interface AuthData {
  user: User
  accessToken: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  register(payload: RegisterPayload) {
    return api.post<AuthData>('/auth/register', payload)
  },

  login(payload: LoginPayload) {
    return api.post<AuthData>('/auth/login', payload)
  },

  refreshToken() {
    return api.post<{ accessToken: string }>('/auth/refresh-token')
  },

  logout() {
    return api.post<{ message: string }>('/auth/logout')
  },

  getProfile() {
    return api.get<User>('/auth/me')
  },
}

export type { User, AuthData, RegisterPayload, LoginPayload }
