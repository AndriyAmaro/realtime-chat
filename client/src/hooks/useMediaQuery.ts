import { useState, useEffect } from 'react'

/**
 * Reactive media query hook using `window.matchMedia`.
 * Returns true when the query matches.
 *
 * @example
 * const isMobile = !useMediaQuery('(min-width: 768px)')
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)

    function onChange(e: MediaQueryListEvent) {
      setMatches(e.matches)
    }

    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
