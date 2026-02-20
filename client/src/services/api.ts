import { useAuthStore } from '@store/auth.store'

// Always use relative paths — Vite proxy (dev) and Vercel rewrites (prod)
// handle forwarding to the actual backend server.
const BASE_URL = '/api/v1'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { accessToken } = useAuthStore.getState()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send cookies (refresh token)
  })

  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok) {
    // On 401, try refreshing token once
    if (response.status === 401 && accessToken && !endpoint.includes('/auth/refresh')) {
      const refreshed = await tryRefresh()
      if (refreshed) {
        return request<T>(endpoint, options)
      }
      useAuthStore.getState().logout()
    }

    throw new ApiError(json.error ?? 'Request failed', response.status, json.data)
  }

  return json.data as T
}

async function tryRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) return false

    const json = (await response.json()) as ApiResponse<{ accessToken: string }>
    if (json.data?.accessToken) {
      useAuthStore.getState().setAccessToken(json.data.accessToken)
      return true
    }
    return false
  } catch {
    return false
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

export { ApiError }
