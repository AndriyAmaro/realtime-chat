import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============ MOCKS ============

vi.mock('../../repositories/user.repository.js', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

vi.mock('../../utils/jwt.js', () => ({
  generateAccessToken: vi.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
  verifyRefreshToken: vi.fn(),
}))

// ============ IMPORTS (after mocks) ============

import { authService } from '../auth.service.js'
import { userRepository } from '../../repositories/user.repository.js'
import bcrypt from 'bcryptjs'
import { verifyRefreshToken } from '../../utils/jwt.js'

// ============ FACTORIES ============

function createUserRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2a$12$hashedpassword',
    avatar: null,
    status: 'OFFLINE' as const,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

function createUserProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: null,
    status: 'OFFLINE' as const,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  }
}

// ============ TESTS ============

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- register ----

  describe('register', () => {
    it('should create a new user with hashed password and return tokens', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never)
      vi.mocked(userRepository.create).mockResolvedValue(
        createUserProfile({ password: 'hashed_password' }) as never
      )

      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(userRepository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
      })
      expect(result).toMatchObject({
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    })

    it('should throw ConflictError when email is already registered', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(createUserRecord())

      await expect(
        authService.register({
          name: 'Other User',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email already registered')

      expect(userRepository.create).not.toHaveBeenCalled()
    })
  })

  // ---- login ----

  describe('login', () => {
    it('should return user and tokens for valid credentials', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(createUserRecord())
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2a$12$hashedpassword')
      expect(result).toMatchObject({
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    })

    it('should throw AuthError when email is not found', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null)

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'password123' })
      ).rejects.toThrow('Invalid email or password')

      expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('should throw AuthError when password is incorrect', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(createUserRecord())
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid email or password')
    })
  })

  // ---- refreshToken ----

  describe('refreshToken', () => {
    it('should return new token pair for valid refresh token', async () => {
      vi.mocked(verifyRefreshToken).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
      })
      vi.mocked(userRepository.findById).mockResolvedValue(createUserProfile() as never)

      const result = await authService.refreshToken('valid-refresh-token')

      expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token')
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    })

    it('should throw AuthError when user no longer exists', async () => {
      vi.mocked(verifyRefreshToken).mockReturnValue({
        userId: 'deleted-user',
        email: 'deleted@example.com',
      })
      vi.mocked(userRepository.findById).mockResolvedValue(null)

      await expect(authService.refreshToken('valid-token')).rejects.toThrow('User not found')
    })

    it('should throw AuthError when token is invalid', async () => {
      vi.mocked(verifyRefreshToken).mockImplementation(() => {
        throw new Error('jwt malformed')
      })

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        'Invalid or expired refresh token'
      )
    })
  })

  // ---- getProfile ----

  describe('getProfile', () => {
    it('should return user profile by ID', async () => {
      const profile = createUserProfile()
      vi.mocked(userRepository.findById).mockResolvedValue(profile as never)

      const result = await authService.getProfile('user-1')

      expect(userRepository.findById).toHaveBeenCalledWith('user-1')
      expect(result).toEqual(profile)
    })

    it('should throw AuthError when user is not found', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null)

      await expect(authService.getProfile('nonexistent')).rejects.toThrow('User not found')
    })
  })
})
