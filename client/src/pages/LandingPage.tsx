import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@core/primitives/Button'
import { ThemeToggle } from '@core/primitives/ThemeToggle'
import { Logo } from '@components/Logo'
import { HeroBackground } from '@components/HeroBackground'
import {
  Zap,
  Hash,
  Keyboard,
  CheckCheck,
  SmilePlus,
  Search,
  WifiOff,
  Shield,
  ArrowRight,
  Github,
  BookOpen,
  FileText,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    title: 'Mensagens em tempo real',
    description: 'WebSocket bidirecional com Socket.io. Envie e receba mensagens instantaneamente.',
  },
  {
    icon: Hash,
    title: 'Salas públicas e privadas',
    description: 'Crie salas abertas ou protegidas com código de convite para acesso restrito.',
  },
  {
    icon: Keyboard,
    title: 'Indicadores de digitação',
    description: 'Veja quem está digitando em tempo real com auto-timeout de 3 segundos.',
  },
  {
    icon: CheckCheck,
    title: 'Confirmação de leitura',
    description: 'Status de mensagem enviada e lida com indicadores visuais por sala.',
  },
  {
    icon: SmilePlus,
    title: 'Reações com emoji',
    description: 'Reaja às mensagens com emojis. Toggle pattern com contagem agregada.',
  },
  {
    icon: Search,
    title: 'Busca de mensagens',
    description: 'Busca full-text com highlight nos resultados e navegação para a mensagem.',
  },
  {
    icon: WifiOff,
    title: 'Fila offline',
    description: 'Mensagens enfileiradas quando offline. Retry automático com backoff exponencial.',
  },
  {
    icon: Shield,
    title: 'Observabilidade',
    description: 'Logging estruturado com Pino, métricas de performance e tracking de erros.',
  },
] as const

const TECH_STACK = [
  { name: 'React 19', color: 'text-[#61DAFB]' },
  { name: 'TypeScript', color: 'text-[#3178C6]' },
  { name: 'Vite', color: 'text-[#646CFF]' },
  { name: 'Tailwind CSS', color: 'text-[#06B6D4]' },
  { name: 'Express 5', color: 'text-[#68A063]' },
  { name: 'Socket.io', color: 'text-[var(--text-primary)]' },
  { name: 'Prisma 7', color: 'text-[#2D3748]' },
  { name: 'PostgreSQL', color: 'text-[#4169E1]' },
  { name: 'Docker', color: 'text-[#2496ED]' },
  { name: 'Pino', color: 'text-[#687634]' },
] as const

export default function LandingPage() {
  const sectionsRef = useRef<HTMLDivElement>(null)

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    const container = sectionsRef.current
    if (!container) return

    const elements = container.querySelectorAll('.scroll-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionsRef} className="min-h-screen bg-[var(--bg-base)]">
      {/* Nav */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Realtime Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-14">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary-500/20 animate-hero-orb-1 absolute top-20 left-1/4 h-72 w-72 rounded-full blur-[100px]" />
          <div className="animate-hero-orb-2 absolute top-40 right-1/4 h-96 w-96 rounded-full bg-[#6366f1]/15 blur-[120px]" />
          <div className="animate-hero-orb-3 absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#8b5cf6]/10 blur-[80px]" />
        </div>

        {/* Abstract chat & network background */}
        <HeroBackground />

        <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <div className="scroll-reveal">
            <div className="animate-hero-logo mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
              <Logo size={56} />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              Chat em{' '}
              <span className="animate-gradient bg-gradient-to-r from-[var(--primary-500)] via-[#8b5cf6] to-[var(--primary-500)] bg-clip-text text-transparent">
                Tempo Real
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              Aplicação full-stack com salas, indicadores de digitação, confirmação de leitura,
              reações, fila offline e observabilidade. Construído com React 19, Socket.io, Express 5
              e PostgreSQL.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" className="animate-glow-pulse">
                  Comece agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Entrar com conta existente
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Demo: andriy@example.com / password123
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="scroll-reveal mb-12 text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Funcionalidades
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Tudo que um chat moderno precisa, com arquitetura de produção.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`scroll-reveal stagger-${i + 1} glass card-glow group rounded-xl p-5 transition-all hover:-translate-y-1`}
              >
                <div className="bg-primary-500/10 text-primary-500 mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:bg-[var(--primary-500)] group-hover:text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="relative border-t border-[var(--border-default)] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="scroll-reveal mb-12 text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Arquitetura
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              3 camadas no backend, comunicação bidirecional via WebSocket.
            </p>
          </div>

          <div className="scroll-reveal-scale scroll-reveal grid gap-4 sm:grid-cols-3">
            {/* Client */}
            <div className="glass card-glow flex flex-col items-center rounded-xl p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#61DAFB]/10 text-[#61DAFB]">
                <span className="text-xl font-bold">R</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Frontend</h3>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                React 19 + Vite + Tailwind CSS 4 + 40+ componentes do Design System Pulse
              </p>
              <span className="mt-3 text-[10px] font-medium text-[var(--text-muted)]">VERCEL</span>
            </div>

            {/* Server */}
            <div className="glass card-glow flex flex-col items-center rounded-xl p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#68A063]/10 text-[#68A063]">
                <span className="text-xl font-bold">E</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Backend</h3>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Express 5 + Prisma 7 + Socket.io + Pino + Controller → Service → Repository
              </p>
              <span className="mt-3 text-[10px] font-medium text-[var(--text-muted)]">RAILWAY</span>
            </div>

            {/* Database */}
            <div className="glass card-glow flex flex-col items-center rounded-xl p-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#4169E1]/10 text-[#4169E1]">
                <span className="text-xl font-bold">P</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Database</h3>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                PostgreSQL 16 + 6 models + cursor-based pagination + soft delete
              </p>
              <span className="mt-3 text-[10px] font-medium text-[var(--text-muted)]">RAILWAY</span>
            </div>
          </div>

          <div className="scroll-reveal mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-medium text-[var(--text-muted)]">24 endpoints REST</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-xs font-medium text-[var(--text-muted)]">
              18 eventos Socket.io
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-xs font-medium text-[var(--text-muted)]">37 testes</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-xs font-medium text-[var(--text-muted)]">29 fases</span>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative border-t border-[var(--border-default)] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="scroll-reveal mb-10 text-center">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Tech Stack
            </h2>
          </div>

          <div className="scroll-reveal flex flex-wrap items-center justify-center gap-3">
            {TECH_STACK.map((tech) => (
              <span
                key={tech.name}
                className="glass card-glow rounded-full px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
              >
                <span className={tech.color}>●</span> {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative border-t border-[var(--border-default)] py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="scroll-reveal">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Teste agora
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Crie uma conta gratuita ou use as credenciais de demonstração.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" className="animate-glow-pulse">
                  Criar conta gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="text-xs text-[var(--text-muted)]">Realtime Chat — Andriy Amaro</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/AndriyAmaro/realtime-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://server-production-f308.up.railway.app/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Swagger
            </a>
            <a
              href="https://github.com/AndriyAmaro/realtime-chat/blob/main/docs/architecture.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <FileText className="h-3.5 w-3.5" />
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
