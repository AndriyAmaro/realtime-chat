import { useEffect, useRef, useState } from 'react'
import { Smile } from 'lucide-react'
import { cn } from '@shared/utils/cn'

interface InputEmojiPickerProps {
  onSelect: (emoji: string) => void
  disabled?: boolean
}

const EMOJI_CATEGORIES = [
  {
    label: 'Smileys',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '🤣',
      '😂',
      '🙂',
      '😊',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '😗',
      '😋',
      '😛',
      '😜',
      '🤪',
      '😝',
      '🤑',
      '🤗',
      '🤭',
      '🤫',
      '🤔',
      '🫡',
      '🤐',
      '🤨',
      '😐',
      '😑',
      '😶',
      '😏',
      '😒',
      '🙄',
      '😬',
      '🤥',
      '😌',
      '😔',
      '😪',
      '🤤',
      '😴',
      '😷',
      '🤒',
      '🤕',
      '🤢',
      '🤮',
      '🥵',
      '🥶',
    ],
  },
  {
    label: 'Gestos',
    emojis: [
      '👍',
      '👎',
      '👊',
      '✊',
      '🤛',
      '🤜',
      '👏',
      '🙌',
      '👐',
      '🤲',
      '🤝',
      '🙏',
      '✌️',
      '🤞',
      '🤟',
      '🤘',
      '👌',
      '🤌',
      '👈',
      '👉',
      '👆',
      '👇',
      '☝️',
      '✋',
      '🤚',
      '🖐️',
      '🖖',
      '👋',
      '🤙',
      '💪',
    ],
  },
  {
    label: 'Corações',
    emojis: [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❤️‍🔥',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
      '💘',
      '💝',
    ],
  },
  {
    label: 'Objetos',
    emojis: [
      '🔥',
      '⭐',
      '🌟',
      '✨',
      '💫',
      '🎉',
      '🎊',
      '🎁',
      '🏆',
      '🥇',
      '🎯',
      '💡',
      '📌',
      '📎',
      '✅',
      '❌',
      '⚠️',
      '💯',
      '🆗',
      '🆒',
    ],
  },
  {
    label: 'Animais',
    emojis: [
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐸',
      '🐵',
      '🐔',
      '🐧',
      '🐦',
      '🦅',
      '🦋',
    ],
  },
  {
    label: 'Comida',
    emojis: [
      '🍎',
      '🍕',
      '🍔',
      '🌮',
      '🍟',
      '🍿',
      '🍩',
      '🍪',
      '🎂',
      '🍰',
      '☕',
      '🍵',
      '🥤',
      '🍺',
      '🍷',
      '🥂',
      '🍸',
      '🧃',
      '🥛',
      '🍫',
    ],
  },
]

export function InputEmojiPicker({ onSelect, disabled }: InputEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'rounded-lg p-2 transition-colors',
          isOpen
            ? 'bg-[var(--bg-muted)] text-[var(--primary-500)]'
            : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)]'
        )}
        disabled={disabled}
        aria-label="Emojis"
        aria-expanded={isOpen}
      >
        <Smile size={20} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] shadow-xl">
          {/* Category tabs */}
          <div className="flex gap-1 border-b border-[var(--border-default)] px-2 pt-2 pb-1">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(i)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs transition-colors',
                  activeCategory === i
                    ? 'bg-[var(--primary-500)]/10 font-medium text-[var(--primary-500)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
                )}
              >
                {cat.emojis[0]}
              </button>
            ))}
          </div>

          {/* Category label */}
          <div className="px-3 pt-2 pb-1">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {EMOJI_CATEGORIES[activeCategory].label}
            </span>
          </div>

          {/* Emoji grid */}
          <div className="grid max-h-[200px] grid-cols-6 gap-0.5 overflow-y-auto px-2 pb-2 sm:grid-cols-8">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelect(emoji)
                  setIsOpen(false)
                }}
                className="rounded-lg p-1.5 text-xl transition-transform hover:scale-110 hover:bg-[var(--bg-muted)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
