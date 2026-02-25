import { cn } from '@shared/utils/cn'

interface AuthBackgroundProps {
  className?: string
}

const MESSAGES = [
  { text: 'Hey! 👋', sent: false, delay: '0.4s' },
  { text: 'Oi! Tudo bem?', sent: true, delay: '1.2s' },
  { text: 'Sim! E você? 😊', sent: false, delay: '2s' },
  { text: 'Tudo ótimo! 🎉', sent: true, delay: '2.8s' },
] as const

export function AuthBackground({ className }: AuthBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Base — rich vibrant teal gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #1ACFAE 0%, #14B89C 25%, #10A68D 50%, #0D8F7A 75%, #0A7A69 100%)',
        }}
      />

      {/* Depth overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, transparent 0%, rgba(8, 90, 78, 0.2) 100%)',
        }}
      />

      {/* Chat conversation mockup */}
      <div className="absolute inset-0 flex items-center justify-center px-12 pb-28">
        <div className="w-full max-w-[360px]">
          {/* Window frame */}
          <div className="rounded-2xl border border-white/20 bg-white/[0.08] shadow-2xl backdrop-blur-sm">
            {/* Header bar */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-white/30" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              </div>
              <span className="ml-2 text-xs font-medium text-white/50">Realtime Chat</span>
            </div>

            {/* Messages */}
            <div className="space-y-3 p-5">
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
                    <div className="mt-1 mr-2.5 h-7 w-7 shrink-0 rounded-full bg-white/20" />
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] px-4 py-2.5 text-[13px] leading-relaxed text-white/90',
                      msg.sent
                        ? 'rounded-2xl rounded-br-md bg-white/20'
                        : 'rounded-2xl rounded-bl-md bg-white/[0.12]'
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div
                className="animate-auth-chat-in flex justify-start opacity-0"
                style={{ animationDelay: '3.5s' }}
              >
                <div className="mt-1 mr-2.5 h-7 w-7 shrink-0 rounded-full bg-white/20" />
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/[0.12] px-4 py-3">
                  <div
                    className="animate-auth-typing-dot h-1.5 w-1.5 rounded-full bg-white/60"
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className="animate-auth-typing-dot h-1.5 w-1.5 rounded-full bg-white/60"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <div
                    className="animate-auth-typing-dot h-1.5 w-1.5 rounded-full bg-white/60"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle ambient glow — upper area */}
      <div
        className="absolute top-[8%] right-[10%] h-[300px] w-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          filter: 'blur(45px)',
        }}
      />

      {/* Noise texture */}
      <div className="noise-overlay absolute inset-0" />
    </div>
  )
}
