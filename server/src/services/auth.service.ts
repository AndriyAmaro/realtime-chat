import bcrypt from 'bcryptjs'
import { userRepository } from '../repositories/user.repository.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { AuthError, ConflictError } from '../errors/index.js'
import type { RegisterInput, LoginInput, AuthTokens, AuthResponse } from '../types/auth.js'
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
}

function generateTokenPair(payload: AuthPayload): AuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}
