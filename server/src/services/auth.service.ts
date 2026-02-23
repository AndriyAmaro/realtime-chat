import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userRepository } from '../repositories/user.repository.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { generateResetToken, verifyResetToken } from '../utils/resetToken.js'
import { emailService } from './email.service.js'
import { AuthError, ConflictError } from '../errors/index.js'
import { env } from '../config/env.js'
import type {
  RegisterInput,
  LoginInput,
  AuthTokens,
  AuthResponse,
  UpdateProfileInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../types/auth.js'
import type { AuthPayload } from '../types/api.js'

const SALT_ROUNDS = 12

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse & { refreshToken: string }> {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      throw new ConflictError('Email already registered')
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    })

    const payload: AuthPayload = { userId: user.id, email: user.email }
    const tokens = generateTokenPair(payload)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  },

  async login(input: LoginInput): Promise<AuthResponse & { refreshToken: string }> {
    const user = await userRepository.findByEmail(input.email)
    if (!user) {
      throw new AuthError('Invalid email or password')
    }

    const validPassword = await bcrypt.compare(input.password, user.password)
    if (!validPassword) {
      throw new AuthError('Invalid email or password')
    }

    const payload: AuthPayload = { userId: user.id, email: user.email }
    const tokens = generateTokenPair(payload)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  },

  async refreshToken(token: string): Promise<AuthTokens> {
    try {
      const payload = verifyRefreshToken(token)
      const user = await userRepository.findById(payload.userId)

      if (!user) {
        throw new AuthError('User not found')
      }

      const newPayload: AuthPayload = { userId: user.id, email: user.email }
      return generateTokenPair(newPayload)
    } catch (err) {
      if (err instanceof AuthError) throw err
      throw new AuthError('Invalid or expired refresh token')
    }
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AuthError('User not found')
    }
    return user
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AuthError('User not found')
    }

    const data: { name?: string; avatar?: string | null } = {}
    if (input.name !== undefined) data.name = input.name
    if (input.avatar !== undefined) data.avatar = input.avatar

    return userRepository.updateProfile(userId, data)
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await userRepository.findByIdWithPassword(userId)
    if (!user) {
      throw new AuthError('User not found')
    }

    const validPassword = await bcrypt.compare(input.currentPassword, user.password)
    if (!validPassword) {
      throw new AuthError('Current password is incorrect')
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS)
    await userRepository.updatePassword(userId, hashedPassword)
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await userRepository.findByEmailWithPassword(input.email)

    // Always return success to prevent email enumeration
    if (!user) return

    const token = generateResetToken({ userId: user.id, email: user.email }, user.password)
    const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`

    await emailService.sendResetEmail({
      to: user.email,
      name: user.name,
      resetLink,
    })
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    // Decode without verification to extract userId
    const decoded = jwt.decode(input.token) as { userId?: string } | null
    if (!decoded?.userId) {
      throw new AuthError('Invalid or expired reset token')
    }

    // Fetch user with current password hash
    const user = await userRepository.findByIdWithPassword(decoded.userId)
    if (!user) {
      throw new AuthError('Invalid or expired reset token')
    }

    // Verify token signature using current password hash as part of secret
    try {
      verifyResetToken(input.token, user.password)
    } catch {
      throw new AuthError('Invalid or expired reset token')
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)
    await userRepository.updatePassword(decoded.userId, hashedPassword)
  },
}

function generateTokenPair(payload: AuthPayload): AuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}
