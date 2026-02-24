export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* ── Layer 1: Subtle dot grid (depth) ── */}
      <div className="hero-dot-grid absolute inset-0 opacity-[0.018] dark:opacity-[0.035]" />

      {/* ── Layer 2: Scattered chat icons ── */}

      {/* Double checkmark (read receipt) — left side */}
      <div className="animate-float absolute top-[42%] left-[5%] opacity-[0.06] dark:opacity-[0.1]">
        <svg
          width="36"
          height="22"
          viewBox="0 0 36 22"
          fill="none"
          className="text-[var(--primary-500)]"
        >
          <path
            d="M2 11 L8 17 L18 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 11 L18 17 L28 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Paper plane (send) — right side */}
      <div className="animate-float-delayed absolute top-[58%] right-[4%] -rotate-12 opacity-[0.05] dark:opacity-[0.08]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#8b5cf6]">
          <path d="M28 4 L4 14 L13 18 L18 28 Z" fill="currentColor" />
          <line
            x1="28"
            y1="4"
            x2="13"
            y2="18"
            stroke="white"
            strokeWidth="1.2"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* Heart reaction — top left area */}
      <div className="animate-float-slow absolute top-[15%] left-[18%] opacity-[0.05] blur-[0.5px] dark:opacity-[0.08]">
        <svg
          width="24"
          height="22"
          viewBox="0 0 28 26"
          fill="none"
          className="text-[var(--primary-500)]"
        >
          <path
            d="M14 24 C5 18 1 12 1 7 A5.5 5.5 0 0 1 14 5 A5.5 5.5 0 0 1 27 7 C27 12 23 18 14 24Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Smiley face — bottom right area */}
      <div className="animate-float absolute right-[12%] bottom-[28%] opacity-[0.04] dark:opacity-[0.07]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          className="text-[var(--primary-500)]"
        >
          <circle cx="16" cy="16" r="14" fill="currentColor" />
          <circle cx="11" cy="13" r="2" fill="white" fillOpacity="0.3" />
          <circle cx="21" cy="13" r="2" fill="white" fillOpacity="0.3" />
          <path
            d="M10 19 Q16 24 22 19"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* Reply arrow — left lower area */}
      <div className="animate-float-delayed absolute bottom-[35%] left-[8%] opacity-[0.04] blur-[0.5px] dark:opacity-[0.07]">
        <svg width="26" height="22" viewBox="0 0 28 24" fill="none" className="text-[#8b5cf6]">
          <path
            d="M12 3 L3 12 L12 21"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 12 H18 A6 6 0 0 1 24 18 V21"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* @ mention badge — top right area */}
      <div className="animate-float absolute top-[18%] right-[15%] opacity-[0.05] dark:opacity-[0.08]">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-[#8b5cf6]">
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <path
            d="M22 18 A6 6 0 1 1 22 14 V18 A3 3 0 0 0 25 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* ── Layer 3: Abstract chat bubbles at edges ── */}

      {/* Top-left — large message bubble */}
      <div className="animate-float-slow absolute -top-6 -left-14 opacity-[0.06] blur-[2px] sm:-left-10 sm:opacity-[0.07] dark:opacity-[0.1]">
        <svg
          width="200"
          height="156"
          viewBox="0 0 200 156"
          fill="none"
          className="text-[var(--primary-500)]"
        >
          <rect x="8" y="8" width="152" height="88" rx="24" fill="currentColor" />
          <path d="M40 96 L28 128 L62 96" fill="currentColor" />
          <rect x="30" y="32" width="96" height="7" rx="3.5" fill="white" fillOpacity="0.25" />
          <rect x="30" y="48" width="68" height="7" rx="3.5" fill="white" fillOpacity="0.18" />
          <rect x="30" y="64" width="82" height="7" rx="3.5" fill="white" fillOpacity="0.12" />
        </svg>
      </div>

      {/* Top-right — stacked conversation (incoming + outgoing) */}
      <div className="absolute -top-2 -right-16 -rotate-3 opacity-[0.04] blur-[1px] sm:-right-10 sm:opacity-[0.05] dark:opacity-[0.07]">
        <svg width="240" height="148" viewBox="0 0 240 148" fill="none">
          {/* Incoming */}
          <rect x="4" y="4" width="120" height="48" rx="16" className="fill-[#8b5cf6]" />
          <rect x="20" y="20" width="72" height="5" rx="2.5" fill="white" fillOpacity="0.3" />
          <rect x="20" y="30" width="48" height="5" rx="2.5" fill="white" fillOpacity="0.2" />
          {/* Outgoing */}
          <rect
            x="80"
            y="64"
            width="148"
            height="48"
            rx="16"
            className="fill-[var(--primary-500)]"
          />
          <path d="M204 112 L216 132 L192 112" className="fill-[var(--primary-500)]" />
          <rect x="96" y="80" width="96" height="5" rx="2.5" fill="white" fillOpacity="0.25" />
          <rect x="96" y="90" width="64" height="5" rx="2.5" fill="white" fillOpacity="0.18" />
        </svg>
      </div>

      {/* Bottom-right — small reply bubble */}
      <div className="animate-float-delayed absolute -right-6 bottom-[12%] rotate-6 opacity-[0.05] blur-[2px] dark:opacity-[0.08]">
        <svg
          width="132"
          height="100"
          viewBox="0 0 132 100"
          fill="none"
          className="text-[var(--primary-500)]"
        >
          <rect x="8" y="8" width="104" height="52" rx="18" fill="currentColor" />
          <path d="M88 60 L100 80 L76 60" fill="currentColor" />
          <rect x="22" y="26" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.25" />
          <rect x="22" y="36" width="40" height="5" rx="2.5" fill="white" fillOpacity="0.18" />
        </svg>
      </div>

      {/* Bottom-left — tiny bubble */}
      <div className="absolute bottom-[18%] -left-4 -rotate-6 opacity-[0.04] blur-[2px] dark:opacity-[0.06]">
        <svg width="108" height="84" viewBox="0 0 108 84" fill="none">
          <rect x="6" y="6" width="80" height="42" rx="14" className="fill-[#8b5cf6]" />
          <path d="M20 48 L14 66 L34 48" className="fill-[#8b5cf6]" />
          <rect x="18" y="22" width="48" height="4" rx="2" fill="white" fillOpacity="0.25" />
          <rect x="18" y="30" width="30" height="4" rx="2" fill="white" fillOpacity="0.18" />
        </svg>
      </div>

      {/* Mid-left — floating mini chat icon */}
      <div className="animate-float absolute top-[32%] left-[3%] opacity-[0.05] blur-[0.5px] dark:opacity-[0.09]">
        <svg
          width="36"
          height="32"
          viewBox="0 0 36 32"
          fill="none"
          className="text-[var(--primary-500)]"
        >
          <rect x="2" y="2" width="26" height="18" rx="7" fill="currentColor" />
          <path d="M8 20 L5 28 L14 20" fill="currentColor" />
        </svg>
      </div>

      {/* Mid-right — floating typing indicator bubble */}
      <div className="animate-float-delayed absolute top-[26%] right-[6%] opacity-[0.05] blur-[0.5px] dark:opacity-[0.08]">
        <svg width="52" height="40" viewBox="0 0 52 40" fill="none" className="text-[#8b5cf6]">
          <rect x="2" y="2" width="42" height="24" rx="10" fill="currentColor" />
          <path d="M10 26 L6 36 L18 26" fill="currentColor" />
          <circle cx="15" cy="14" r="2.5" fill="white" fillOpacity="0.3" />
          <circle cx="23" cy="14" r="2.5" fill="white" fillOpacity="0.3" />
          <circle cx="31" cy="14" r="2.5" fill="white" fillOpacity="0.3" />
        </svg>
      </div>
    </div>
  )
}
