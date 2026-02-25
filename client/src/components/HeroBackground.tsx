export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* ── Layer 1: Subtle dot grid (depth) ── */}
      <div className="hero-dot-grid absolute inset-0 opacity-[0.018] dark:opacity-[0.035]" />

      {/* ── Layer 2: Floating chat icons — Pulse teal palette ── */}

      {/* Chat bubble with dots — top left */}
      <div className="animate-float-slow absolute top-[12%] left-[5%] opacity-[0.15] dark:opacity-[0.25]">
        <svg viewBox="0 0 32 32" fill="none" className="h-14 w-14 text-[var(--primary-500)]">
          <path
            d="M6 6h20a2 2 0 012 2v12a2 2 0 01-2 2H14l-6 4v-4H6a2 2 0 01-2-2V8a2 2 0 012-2z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle cx="12" cy="14" r="1.2" fill="currentColor" />
          <circle cx="16" cy="14" r="1.2" fill="currentColor" />
          <circle cx="20" cy="14" r="1.2" fill="currentColor" />
        </svg>
      </div>

      {/* Paper plane — top right */}
      <div className="animate-float absolute top-[10%] right-[7%] opacity-[0.15] dark:opacity-[0.25]">
        <svg viewBox="0 0 32 32" fill="none" className="h-12 w-12 text-[#2DD1B1]">
          <path
            d="M4 4l24 12L4 28l4-12L4 4z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path d="M8 16h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Double check (read receipt) — mid left */}
      <div className="animate-float-delayed absolute top-[14%] right-[7%] opacity-[0.12] sm:top-[40%] sm:right-auto sm:left-[6%] dark:opacity-[0.20]">
        <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10 text-[var(--primary-500)]">
          <path
            d="M4 16l5 5L19 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 16l5 5L27 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Heart reaction — mid right */}
      <div className="animate-float-slow absolute top-[38%] right-[5%] hidden opacity-[0.15] sm:block dark:opacity-[0.25]">
        <svg viewBox="0 0 32 32" fill="none" className="h-11 w-11 text-[#2DD1B1]">
          <path
            d="M16 28S4 20 4 12a6 6 0 0112-1 6 6 0 0112 1c0 8-12 16-12 16z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      </div>

      {/* Notification bell — bottom left */}
      <div className="animate-float absolute bottom-[18%] left-[10%] opacity-[0.12] dark:opacity-[0.20]">
        <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10 text-[var(--primary-500)]">
          <path
            d="M16 4a8 8 0 018 8c0 4 2 6 2 8H6c0-2 2-4 2-8a8 8 0 018-8z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M13 22a3 3 0 006 0"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="24" cy="8" r="3" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </div>

      {/* Double chat bubbles — bottom right */}
      <div className="animate-float-delayed absolute right-[8%] bottom-[15%] opacity-[0.15] dark:opacity-[0.25]">
        <svg viewBox="0 0 32 32" fill="none" className="h-12 w-12 text-[#2DD1B1]">
          <path
            d="M4 5h16a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 3v-3H4a2 2 0 01-2-2V7a2 2 0 012-2z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M12 19h8a2 2 0 012 2v6a2 2 0 01-2 2h-2v-2l-3 2v-2h-3a2 2 0 01-2-2v-6a2 2 0 012-2z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Emoji smile — top center-left */}
      <div className="animate-float absolute top-[20%] left-[3%] opacity-[0.10] sm:left-[25%] dark:opacity-[0.18]">
        <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9 text-[var(--primary-500)]">
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle cx="12" cy="14" r="1.3" fill="currentColor" />
          <circle cx="20" cy="14" r="1.3" fill="currentColor" />
          <path
            d="M11 19a6 6 0 0010 0"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* @ symbol — bottom center-right */}
      <div className="animate-float-slow absolute right-[3%] bottom-[22%] opacity-[0.10] sm:right-[22%] dark:opacity-[0.18]">
        <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9 text-[#2DD1B1]">
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M21 16v3a3 3 0 006 0"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Small chat bubble — center left area */}
      <div className="animate-float-delayed absolute top-auto bottom-[18%] left-[3%] opacity-[0.10] sm:top-[55%] sm:bottom-auto sm:left-[20%] dark:opacity-[0.18]">
        <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-[var(--primary-500)]">
          <path
            d="M6 6h20a2 2 0 012 2v12a2 2 0 01-2 2H14l-6 4v-4H6a2 2 0 01-2-2V8a2 2 0 012-2z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      </div>

      {/* Small paper plane — top right area */}
      <div className="animate-float absolute top-[22%] left-[50%] -translate-x-1/2 opacity-[0.10] sm:top-[30%] sm:right-[18%] sm:left-auto sm:translate-x-0 dark:opacity-[0.18]">
        <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 text-[#2DD1B1]">
          <path
            d="M4 4l24 12L4 28l4-12L4 4z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Keyboard / typing — bottom center-left */}
      <div className="animate-float-slow absolute bottom-[10%] left-[50%] opacity-[0.10] sm:bottom-[30%] sm:left-[35%] dark:opacity-[0.18]">
        <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-[var(--primary-500)]">
          <rect
            x="4"
            y="8"
            width="24"
            height="16"
            rx="3"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <rect x="8" y="12" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
          <rect x="13" y="12" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
          <rect x="18" y="12" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
          <rect x="10" y="17" width="12" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
      </div>

      {/* Hashtag (rooms) — center right area */}
      <div className="animate-float-delayed absolute top-auto right-[38%] bottom-[10%] opacity-[0.10] sm:top-[48%] sm:right-[15%] sm:bottom-auto dark:opacity-[0.18]">
        <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-[#2DD1B1]">
          <path
            d="M12 4l-2 24M22 4l-2 24M4 12h24M4 20h24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
