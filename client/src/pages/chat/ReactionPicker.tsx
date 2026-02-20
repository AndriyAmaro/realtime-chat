import { useEffect, useRef } from 'react'
import { cn } from '@shared/utils/cn'

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
  className?: string
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉', '🤔', '👀', '💯', '🙏']

export function ReactionPicker({ onSelect, onClose, className }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-6 gap-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] p-2 shadow-lg',
        className
      )}
      role="listbox"
      aria-label="Escolher reação"
    >
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="option"
          aria-selected={false}
          onClick={() => {
            onSelect(emoji)
            onClose()
          }}
          className="rounded-lg p-1.5 text-xl transition-transform hover:scale-125 hover:bg-[var(--bg-muted)]"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
