import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import { env } from '../config/env.js'
import type { AuthenticatedRequest } from '../types/api.js'
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../types/auth.js'

const REFRESH_TOKEN_COOKIE = 'refresh_token'

// API calls always arrive same-origin (Vite proxy in dev, Cloudflare Worker rewrite in prod),
// so cookies are first-party. SameSite=Lax is the safest cross-browser default.
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
}

export const authController = {
  async register(req: Request, res: Response) {
    const input = req.body as RegisterInput
    const result = await authService.register(input)

    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieOptions)

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    })
  },

  async login(req: Request, res: Response) {
    const input = req.body as LoginInput
    const result = await authService.login(input)

    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieOptions)

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    })
  },

  async refreshToken(req: Request, res: Response) {
    // Accept refresh token from cookie OR request body (fallback for proxied environments)
    const token =
      req.cookies?.[REFRESH_TOKEN_COOKIE] || (req.body as { refreshToken?: string })?.refreshToken

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No refresh token provided',
      })
      return
    }

    const tokens = await authService.refreshToken(token)

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions)

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    })
  },

  async getProfile(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const user = await authService.getProfile(userId)

    res.status(200).json({
      success: true,
      data: user,
    })
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' })

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    })
  },

  async updateProfile(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const input = req.body as UpdateProfileInput
    const user = await authService.updateProfile(userId, input)

    res.status(200).json({
      success: true,
      data: user,
    })
  },

  async changePassword(req: Request, res: Response) {
    const { userId } = (req as AuthenticatedRequest).user
    const input = req.body as ChangePasswordInput
    await authService.changePassword(userId, input)

    res.status(200).json({
      success: true,
      data: { message: 'Password changed successfully' },
    })
  },

  async forgotPassword(req: Request, res: Response) {
    const input = req.body as ForgotPasswordInput
    await authService.forgotPassword(input)

    // Always return 200 to prevent email enumeration
    res.status(200).json({
      success: true,
      data: { message: 'If this email is registered, you will receive a reset link' },
    })
  },

  async resetPassword(req: Request, res: Response) {
    const input = req.body as ResetPasswordInput
    await authService.resetPassword(input)

    res.status(200).json({
      success: true,
      data: { message: 'Password reset successfully' },
    })
  },
}
