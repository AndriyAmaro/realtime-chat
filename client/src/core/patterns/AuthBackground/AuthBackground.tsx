import { cn } from '@shared/utils/cn'

interface AuthBackgroundProps {
  className?: string
}

interface Message {
  readonly text: string
  readonly sent: boolean
  readonly time: string
  readonly delay: string
}

const MESSAGES: readonly Message[] = [
  { text: 'Hey! Como vai? 👋', sent: false, time: '10:24', delay: '0.5s' },
  { text: 'Oi! Tudo ótimo 😊', sent: true, time: '10:24', delay: '1.4s' },
  { text: 'Que bom! Vamos conversar?', sent: false, time: '10:25', delay: '2.3s' },
  { text: 'Claro! Estou online', sent: true, time: '10:25', delay: '3.2s' },
]

function ReadReceipt() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-white/40">
      <path
        d="M2 8l3 3L10 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 8l3 3L14 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  )
}

export function AuthBackground({ className }: AuthBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Animated gradient base */}
      <div className="auth-gradient-bg absolute inset-0" />

      {/* Depth overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, transparent 0%, rgba(8, 90, 78, 0.25) 100%)',
        }}
      />

      {/* Floating ambient orbs */}
      <div className="animate-auth-float-1 absolute top-[10%] right-[5%] h-[280px] w-[280px] rounded-full bg-white/[0.04] blur-[80px]" />
      <div className="animate-auth-float-2 absolute bottom-[15%] left-[0%] h-[200px] w-[200px] rounded-full bg-[#2DD1B1]/[0.08] blur-[60px]" />
      <div className="animate-auth-float-3 absolute top-[50%] left-[10%] h-[120px] w-[120px] rounded-full bg-white/[0.03] blur-[40px]" />

      {/* Floating chat icons — left side */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Chat bubble — top left */}
        <div className="animate-float-slow absolute top-[8%] left-[4%] opacity-[0.08]">
          <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10 text-white">
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

        {/* @ symbol — mid left */}
        <div className="animate-float-delayed absolute top-[38%] left-[3%] opacity-[0.07]">
          <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-white">
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

        {/* Bell — bottom left */}
        <div className="animate-float absolute bottom-[12%] left-[5%] opacity-[0.07]">
          <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9 text-white">
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
          </svg>
        </div>

        {/* Emoji — lower left */}
        <div className="animate-float-slow absolute bottom-[35%] left-[2%] opacity-[0.06]">
          <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 text-white">
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

        {/* Paper plane — top right */}
        <div className="animate-float absolute top-[12%] right-[3%] opacity-[0.08]">
          <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9 text-white">
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

        {/* Hashtag — mid right */}
        <div className="animate-float-delayed absolute top-[42%] right-[2%] opacity-[0.07]">
          <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 text-white">
            <path
              d="M12 4l-2 24M22 4l-2 24M4 12h24M4 20h24"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Double check — upper right */}
        <div className="animate-float-slow absolute top-[25%] right-[6%] opacity-[0.06]">
          <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7 text-white">
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

        {/* Double bubbles — bottom right */}
        <div className="animate-float absolute right-[4%] bottom-[10%] opacity-[0.07]">
          <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9 text-white">
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
      </div>

      {/* Content layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/90 p-3.5 shadow-lg ring-4 ring-white/20 ring-offset-0">
            <svg viewBox="0 0 64 64" fill="none" className="h-12 w-12">
              <defs>
                <linearGradient
                  id="auth-logo-g"
                  x1="2"
                  y1="2"
                  x2="62"
                  y2="58"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#2DD1B1" />
                  <stop offset="1" stopColor="#0D7768" />
                </linearGradient>
              </defs>
              <path
                d="M12 2H52A10 10 0 0 1 62 12V32A10 10 0 0 1 52 42H22L10 58L14 42A10 10 0 0 1 2 32V12A10 10 0 0 1 12 2Z"
                fill="url(#auth-logo-g)"
              />
              <polyline
                points="8,22 16,22 20,22 24,8 30,36 34,14 37,22 44,22 56,22"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="auth-shimmer-text text-3xl font-bold tracking-tight">Realtime Chat</h2>
          <p className="mt-2 text-sm font-medium text-white/40">Conecte-se em tempo real</p>
        </div>

        {/* Chat window */}
        <div className="relative w-full max-w-[380px]">
          {/* Glow behind card */}
          <div className="absolute -inset-6 rounded-3xl bg-white/[0.03] blur-2xl" />

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.15] bg-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            {/* Gradient accent bar */}
            <div className="h-[3px] bg-gradient-to-r from-white/10 via-white/40 to-white/10" />

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
              <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-white/30 to-white/10">
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/80">
                  J
                </span>
                <div className="animate-auth-online-pulse absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#10A68D] bg-[#4ADE80]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80">João Silva</p>
                <p className="text-[11px] text-white/35">online</p>
              </div>
              <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-white/30" />
                <div className="h-1 w-1 rounded-full bg-white/30" />
                <div className="h-1 w-1 rounded-full bg-white/30" />
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 px-5 py-5">
              {MESSAGES.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'animate-auth-chat-in flex opacity-0',
                    msg.sent ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: msg.delay }}
                >
                  {!msg.sent && (
                    <div className="mt-auto mr-2 h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-white/25 to-white/10">
                      <span className="flex h-full items-center justify-center text-[9px] font-semibold text-white/70">
                        J
                      </span>
                    </div>
                  )}
                  <div>
                    <div
                      className={cn(
                        'px-4 py-2.5 text-[13px] leading-relaxed',
                        msg.sent
                          ? 'rounded-2xl rounded-br-sm bg-white/[0.18] text-white/90'
                          : 'rounded-2xl rounded-bl-sm bg-white/[0.10] text-white/80'
                      )}
                    >
                      {msg.text}
                    </div>
                    <div
                      className={cn(
                        'mt-1 flex items-center gap-1 text-[10px] text-white/25',
                        msg.sent ? 'justify-end pr-1' : 'justify-start pl-1'
                      )}
                    >
                      <span>{msg.time}</span>
                      {msg.sent && <ReadReceipt />}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div
                className="animate-auth-chat-in flex justify-start opacity-0"
                style={{ animationDelay: '4s' }}
              >
                <div className="mt-auto mr-2 h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-white/25 to-white/10">
                  <span className="flex h-full items-center justify-center text-[9px] font-semibold text-white/70">
                    J
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/[0.10] px-4 py-3">
                  <div
                    className="animate-auth-typing-dot h-1.5 w-1.5 rounded-full bg-white/50"
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className="animate-auth-typing-dot h-1.5 w-1.5 rounded-full bg-white/50"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <div
                    className="animate-auth-typing-dot h-1.5 w-1.5 rounded-full bg-white/50"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-white/10 px-5 py-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-2.5">
                <span className="flex-1 text-[12px] text-white/20">Digite uma mensagem...</span>
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-white/20">
                  <path d="M3 3l14 7-14 7V3z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Noise texture */}
      <div className="noise-overlay absolute inset-0" />
    </div>
  )
}
