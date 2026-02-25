interface TechItem {
  name: string
  color: string
  icon: React.ReactNode
}

const TECH_ITEMS: TechItem[] = [
  {
    name: 'React 19',
    color: '#61DAFB',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <circle cx="16" cy="16" r="2.5" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.2">
          <ellipse cx="16" cy="16" rx="12" ry="4.5" />
          <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(60 16 16)" />
          <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(120 16 16)" />
        </g>
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    color: '#3178C6',
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7">
        <rect x="2" y="2" width="28" height="28" rx="4" fill="currentColor" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="700"
          fontFamily="system-ui,sans-serif"
        >
          TS
        </text>
      </svg>
    ),
  },
  {
    name: 'Vite',
    color: '#646CFF',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path
          d="M6 5l10 23L26 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 4l-5 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    color: '#06B6D4',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path
          d="M4 14c4-8 8-8 12-4s8 0 12-4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M4 22c4-8 8-8 12-4s8 0 12-4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    name: 'Express 5',
    color: '#68A063',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path
          d="M6 8l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M16 22h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'Socket.io',
    color: '#25c2a0',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path d="M4 16h8m8 0h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 12l-3 4 3 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 12l3 4-3 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: 'Prisma 7',
    color: '#5A67D8',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path
          d="M16 3L4 28h20L16 3z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M16 3l8 25" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'PostgreSQL',
    color: '#4169E1',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <ellipse cx="16" cy="8" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 8v16c0 2.2 4.5 4 10 4s10-1.8 10-4V8" stroke="currentColor" strokeWidth="1.5" />
        <ellipse
          cx="16"
          cy="16"
          rx="10"
          ry="4"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    ),
  },
  {
    name: 'Docker',
    color: '#2496ED',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <g stroke="currentColor" strokeWidth="1.2">
          <rect x="9" y="6" width="4" height="3.5" rx="0.5" />
          <rect x="14" y="6" width="4" height="3.5" rx="0.5" />
          <rect x="9" y="10.5" width="4" height="3.5" rx="0.5" />
          <rect x="14" y="10.5" width="4" height="3.5" rx="0.5" />
          <rect x="19" y="10.5" width="4" height="3.5" rx="0.5" />
        </g>
        <path
          d="M3 17c0-3 3-3 5-3h16c3 0 5 2 5 5 0 5-5 9-13 9S3 24 3 19v-2z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: 'Pino',
    color: '#8BC34A',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path
          d="M16 3l-6 9h4l-5 8h4l-4 7h14l-4-7h4l-5-8h4L16 3z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <line
          x1="16"
          y1="27"
          x2="16"
          y2="30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

function TechCard({ name, color, icon }: TechItem) {
  return (
    <div className="glass card-glow flex shrink-0 items-center gap-3 rounded-xl px-5 py-3.5 transition-transform hover:scale-[1.03]">
      <div style={{ color }} className="flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium whitespace-nowrap text-[var(--text-primary)]">
        {name}
      </span>
    </div>
  )
}

export function TechMarquee() {
  return (
    <div className="tech-marquee relative overflow-hidden py-2">
      <div className="flex">
        <div className="animate-marquee flex shrink-0 items-center gap-5 pr-5 [animation-duration:40s]">
          {TECH_ITEMS.map((item) => (
            <TechCard key={item.name} {...item} />
          ))}
        </div>
        <div
          className="animate-marquee flex shrink-0 items-center gap-5 pr-5 [animation-duration:40s]"
          aria-hidden="true"
        >
          {TECH_ITEMS.map((item) => (
            <TechCard key={`dup-${item.name}`} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}
