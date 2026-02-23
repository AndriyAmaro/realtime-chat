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
  refreshToken: string
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

interface UpdateProfilePayload {
  name?: string
  avatar?: string | null
}

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const authService = {
  register(payload: RegisterPayload) {
    return api.post<AuthData>('/auth/register', payload)
  },

  login(payload: LoginPayload) {
    return api.post<AuthData>('/auth/login', payload)
  },

  refreshToken(refreshToken?: string) {
    return api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh-token',
      refreshToken ? { refreshToken } : undefined
    )
  },

  logout() {
    return api.post<{ message: string }>('/auth/logout')
  },

  getProfile() {
    return api.get<User>('/auth/me')
  },

  updateProfile(payload: UpdateProfilePayload) {
    return api.patch<User>('/auth/profile', payload)
  },

  changePassword(payload: ChangePasswordPayload) {
    return api.patch<{ message: string }>('/auth/password', payload)
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return api.post<{ message: string }>('/auth/forgot-password', payload)
  },

  resetPassword(payload: ResetPasswordPayload) {
    return api.post<{ message: string }>('/auth/reset-password', payload)
  },
}

interface ForgotPasswordPayload {
  email: string
}

interface ResetPasswordPayload {
  token: string
  password: string
}

export type {
  User,
  AuthData,
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
}
