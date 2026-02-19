import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '../useMediaQuery'

describe('useMediaQuery', () => {
  let listeners: Map<string, (e: MediaQueryListEvent) => void>
  let matchesMap: Map<string, boolean>

  beforeEach(() => {
    listeners = new Map()
    matchesMap = new Map()

    // Mock window.matchMedia
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: matchesMap.get(query) ?? false,
        media: query,
        addEventListener: vi.fn((_event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.set(query, handler)
        }),
        removeEventListener: vi.fn(() => {
          listeners.delete(query)
        }),
      }))
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return true when media query matches', () => {
    matchesMap.set('(min-width: 768px)', true)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(true)
  })

  it('should return false when media query does not match', () => {
    matchesMap.set('(min-width: 768px)', false)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)
  })

  it('should update when the media query changes', () => {
    matchesMap.set('(min-width: 768px)', false)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)

    // Simulate a resize that matches the query
    act(() => {
      const handler = listeners.get('(min-width: 768px)')
      handler?.({ matches: true } as MediaQueryListEvent)
    })

    expect(result.current).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    matchesMap.set('(min-width: 1024px)', true)

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'))

    unmount()

    // After unmount, no listener should remain
    expect(listeners.has('(min-width: 1024px)')).toBe(false)
  })
})
