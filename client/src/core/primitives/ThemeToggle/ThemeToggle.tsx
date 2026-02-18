import * as React from 'react'
import { useTheme } from '@shared/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/utils/cn'

// ============ VARIANTS ============

const themeToggleVariants = cva(
  [
    'relative flex items-center justify-center rounded-lg',
    'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
    'hover:bg-[var(--bg-muted)]',
    'transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
  ],
  {
    variants: {
      size: {
        sm: 'h-10 w-10 sm:h-8 sm:w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const iconVariants = cva('transition-all duration-300', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

// ============ TYPES ============

export interface ThemeToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof themeToggleVariants> {
  /** Show label text */
  showLabel?: boolean
  /** Custom aria-label */
  ariaLabel?: string
}

// ============ COMPONENT ============

const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, size, showLabel = false, ariaLabel, ...props }, ref) => {
    const { setTheme, resolvedTheme } = useTheme()

    const toggleTheme = React.useCallback(() => {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }, [resolvedTheme, setTheme])

    const isDark = resolvedTheme === 'dark'

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggleTheme}
        className={cn(themeToggleVariants({ size }), className)}
        aria-label={ariaLabel ?? `Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        {...props}
      >
        <span className="relative">
          {/* Sun Icon - visible in dark mode */}
          <Sun
            className={cn(
              iconVariants({ size }),
              'absolute inset-0',
              isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
            )}
          />
          {/* Moon Icon - visible in light mode */}
          <Moon
            className={cn(
              iconVariants({ size }),
              isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
            )}
          />
        </span>
        {showLabel && <span className="ml-2 text-sm font-medium">{isDark ? 'Light' : 'Dark'}</span>}
      </button>
    )
  }
)

ThemeToggle.displayName = 'ThemeToggle'

// ============ EXPORTS ============

export { ThemeToggle, themeToggleVariants, iconVariants }
