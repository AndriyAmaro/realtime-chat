import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { ThemeContext } from '@shared/hooks/useTheme'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'chat-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey)
    return (stored as Theme) || defaultTheme
  })

  const resolvedTheme = useMemo((): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem(storageKey, newTheme)
    },
    [storageKey]
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setThemeState((prev) => (prev === 'system' ? 'system' : prev))
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
