export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* ── Layer 1: Subtle dot grid (depth) ── */}
      <div className="hero-dot-grid absolute inset-0 opacity-[0.018] dark:opacity-[0.035]" />

      {/* ── Layer 2: Network topology — connected user nodes ── */}
      <svg
        className="absolute inset-0 h-full w-full text-[var(--primary-500)]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Connection lines */}
        <g stroke="currentColor" strokeWidth="0.8" className="opacity-[0.05] dark:opacity-[0.09]">
          {/* Left cluster */}
          <line x1="80" y1="180" x2="160" y2="300" />
          <line x1="160" y1="300" x2="100" y2="450" />
          <line x1="80" y1="180" x2="200" y2="110" />
          <line x1="200" y1="110" x2="300" y2="200" />
          <line x1="160" y1="300" x2="300" y2="200" />

          {/* Right cluster */}
          <line x1="940" y1="120" x2="1060" y2="220" />
          <line x1="1060" y1="220" x2="1120" y2="380" />
          <line x1="1060" y1="220" x2="960" y2="360" />
          <line x1="940" y1="120" x2="1100" y2="90" />
          <line x1="960" y1="360" x2="1120" y2="380" />

          {/* Bottom bridge */}
          <line x1="380" y1="700" x2="520" y2="740" />
          <line x1="520" y1="740" x2="680" y2="680" />
          <line x1="680" y1="680" x2="820" y2="720" />
        </g>

        {/* Static nodes */}
        <g fill="currentColor" className="opacity-[0.08] dark:opacity-[0.14]">
          <circle cx="80" cy="180" r="3" />
          <circle cx="100" cy="450" r="2.5" />
          <circle cx="200" cy="110" r="2" />
          <circle cx="300" cy="200" r="3" />
          <circle cx="940" cy="120" r="3" />
          <circle cx="1120" cy="380" r="2.5" />
          <circle cx="960" cy="360" r="2" />
          <circle cx="1100" cy="90" r="3" />
          <circle cx="380" cy="700" r="2.5" />
          <circle cx="520" cy="740" r="3" />
          <circle cx="680" cy="680" r="2" />
        </g>

        {/* Active pulsing nodes */}
        <g fill="currentColor">
          <circle
            cx="160"
            cy="300"
            r="4"
            className="hero-node-pulse opacity-[0.12] dark:opacity-[0.2]"
          />
          <circle
            cx="1060"
            cy="220"
            r="4"
            className="hero-node-pulse-delayed opacity-[0.1] dark:opacity-[0.18]"
          />
          <circle
            cx="820"
            cy="720"
            r="3"
            className="hero-node-pulse opacity-[0.08] dark:opacity-[0.15]"
          />
        </g>

        {/* Expanding ring pulses ("message sent" effect) */}
        <circle
          cx="160"
          cy="300"
          r="4"
          stroke="currentColor"
          fill="none"
          strokeWidth="1"
          className="hero-ring-pulse opacity-[0.1] dark:opacity-[0.14]"
        />
        <circle
          cx="1060"
          cy="220"
          r="4"
          stroke="currentColor"
          fill="none"
          strokeWidth="1"
          className="hero-ring-pulse-delayed opacity-[0.07] dark:opacity-[0.11]"
        />
      </svg>

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

      {/* Mid-right — floating triangle cluster (small network icon) */}
      <div className="animate-float-delayed absolute top-[26%] right-[6%] opacity-[0.04] dark:opacity-[0.07]">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-[#8b5cf6]">
          <circle cx="18" cy="8" r="3" fill="currentColor" />
          <circle cx="8" cy="28" r="2.5" fill="currentColor" />
          <circle cx="28" cy="28" r="2" fill="currentColor" />
          <line
            x1="18"
            y1="8"
            x2="8"
            y2="28"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.6"
          />
          <line
            x1="18"
            y1="8"
            x2="28"
            y2="28"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.6"
          />
          <line
            x1="8"
            y1="28"
            x2="28"
            y2="28"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.6"
          />
        </svg>
      </div>
    </div>
  )
}
