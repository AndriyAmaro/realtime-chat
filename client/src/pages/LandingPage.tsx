import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@core/primitives/Button'
import { ThemeToggle } from '@core/primitives/ThemeToggle'
import { Logo } from '@components/Logo'
import { HeroBackground } from '@components/HeroBackground'
import { TechMarquee } from '@components/TechMarquee'
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
      <section className="relative overflow-hidden border-t border-[var(--border-default)] py-20 sm:py-28">
        {/* Gradient orbs background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-[#61DAFB]/[0.06] blur-[100px] dark:bg-[#61DAFB]/[0.08]" />
          <div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-[#4169E1]/[0.06] blur-[100px] dark:bg-[#4169E1]/[0.08]" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#68A063]/[0.04] blur-[80px] dark:bg-[#68A063]/[0.06]" />
        </div>

        {/* Floating tech icons */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* React atom — top left */}
          <div className="animate-float-slow absolute top-[12%] left-[6%] opacity-[0.08] dark:opacity-[0.14]">
            <svg viewBox="0 0 32 32" fill="none" className="h-16 w-16 text-[#61DAFB]">
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="0.8">
                <ellipse cx="16" cy="16" rx="12" ry="4.5" />
                <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(60 16 16)" />
                <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(120 16 16)" />
              </g>
            </svg>
          </div>

          {/* Express terminal — right side */}
          <div className="animate-float-delayed absolute top-[20%] right-[5%] opacity-[0.08] dark:opacity-[0.14]">
            <svg viewBox="0 0 32 32" fill="none" className="h-14 w-14 text-[#68A063]">
              <path
                d="M6 8l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M16 22h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* PostgreSQL cylinder — bottom left */}
          <div className="animate-float absolute bottom-[10%] left-[8%] opacity-[0.08] dark:opacity-[0.14]">
            <svg viewBox="0 0 32 32" fill="none" className="h-14 w-14 text-[#4169E1]">
              <ellipse cx="16" cy="8" rx="10" ry="4" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M6 8v16c0 2.2 4.5 4 10 4s10-1.8 10-4V8"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="10"
                ry="4"
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* React atom small — bottom right */}
          <div className="animate-float-delayed absolute right-[10%] bottom-[18%] opacity-[0.06] dark:opacity-[0.1]">
            <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10 text-[#61DAFB]">
              <circle cx="16" cy="16" r="2.5" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="0.8">
                <ellipse cx="16" cy="16" rx="12" ry="4.5" />
                <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(60 16 16)" />
                <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(120 16 16)" />
              </g>
            </svg>
          </div>

          {/* Express terminal small — top center-right */}
          <div className="animate-float-slow absolute top-[8%] right-[30%] opacity-[0.06] dark:opacity-[0.1]">
            <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10 text-[#68A063]">
              <path
                d="M6 8l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M16 22h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* PostgreSQL cylinder small — top left area */}
          <div className="animate-float absolute top-[30%] left-[20%] opacity-[0.06] dark:opacity-[0.1]">
            <svg viewBox="0 0 32 32" fill="none" className="h-10 w-10 text-[#4169E1]">
              <ellipse cx="16" cy="8" rx="10" ry="4" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M6 8v16c0 2.2 4.5 4 10 4s10-1.8 10-4V8"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="scroll-reveal mb-14 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              <span className="animate-gradient bg-gradient-to-r from-[var(--primary-500)] via-[#8b5cf6] to-[var(--primary-500)] bg-clip-text text-transparent">
                Arquitetura
              </span>
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              3 camadas no backend, comunicação bidirecional via WebSocket.
            </p>
          </div>

          {/* Architecture diagram: 3 columns connected by arrows */}
          <div className="scroll-reveal-scale scroll-reveal grid items-start gap-6 sm:grid-cols-3">
            {/* Frontend */}
            <div className="group glass card-glow relative overflow-hidden rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.06] transition-all hover:-translate-y-1 lg:p-8 dark:shadow-none dark:ring-white/[0.06]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#61DAFB] to-transparent" />
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#61DAFB]/10 text-[#61DAFB] transition-colors group-hover:bg-[#61DAFB] group-hover:text-white">
                  <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5">
                    <circle cx="16" cy="16" r="2.5" fill="currentColor" />
                    <g stroke="currentColor" strokeWidth="1.2">
                      <ellipse cx="16" cy="16" rx="12" ry="4.5" />
                      <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(60 16 16)" />
                      <ellipse cx="16" cy="16" rx="12" ry="4.5" transform="rotate(120 16 16)" />
                    </g>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Frontend</h3>
                  <span className="text-[10px] font-medium tracking-wider text-[var(--primary-500)]">
                    VERCEL
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#61DAFB]" />
                  React 19 + Vite + TypeScript
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#61DAFB]" />
                  Tailwind CSS 4 + Design System Pulse
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#61DAFB]" />
                  Zustand + React Router 7
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#61DAFB]" />
                  40+ componentes reutilizáveis
                </li>
              </ul>

              {/* Arrow connector (visible on sm+) */}
              <div className="pointer-events-none absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 text-[var(--text-muted)] sm:block">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10h12m-4-4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Backend */}
            <div className="group glass card-glow relative overflow-hidden rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.06] transition-all hover:-translate-y-1 lg:p-8 dark:shadow-none dark:ring-white/[0.06]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#68A063] to-transparent" />
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#68A063]/10 text-[#68A063] transition-colors group-hover:bg-[#68A063] group-hover:text-white">
                  <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5">
                    <path
                      d="M6 8l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 22h10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Backend</h3>
                  <span className="text-[10px] font-medium tracking-wider text-[var(--primary-500)]">
                    RAILWAY
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#68A063]" />
                  Express 5 + Socket.io + Pino
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#68A063]" />
                  Controller → Service → Repository
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#68A063]" />
                  JWT auth + refresh tokens
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#68A063]" />
                  Zod validation + error handling
                </li>
              </ul>

              {/* Arrow connector (visible on sm+) */}
              <div className="pointer-events-none absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 text-[var(--text-muted)] sm:block">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10h12m-4-4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Database */}
            <div className="group glass card-glow relative overflow-hidden rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.06] transition-all hover:-translate-y-1 lg:p-8 dark:shadow-none dark:ring-white/[0.06]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#4169E1] to-transparent" />
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4169E1]/10 text-[#4169E1] transition-colors group-hover:bg-[#4169E1] group-hover:text-white">
                  <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5">
                    <ellipse
                      cx="16"
                      cy="8"
                      rx="10"
                      ry="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M6 8v16c0 2.2 4.5 4 10 4s10-1.8 10-4V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
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
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Database</h3>
                  <span className="text-[10px] font-medium tracking-wider text-[var(--primary-500)]">
                    RAILWAY
                  </span>
                </div>
              </div>

              <ul className="space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#4169E1]" />
                  PostgreSQL 16 + Prisma 7 ORM
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#4169E1]" />6 models +
                  cursor-based pagination
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#4169E1]" />
                  Soft delete + audit timestamps
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#4169E1]" />
                  Full-text search + indexes
                </li>
              </ul>
            </div>
          </div>

          {/* Stats bar */}
          <div className="scroll-reveal mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <div className="text-center">
              <span className="block text-lg font-bold text-[var(--text-primary)]">24</span>
              <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)]">
                ENDPOINTS REST
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border-default)]" />
            <div className="text-center">
              <span className="block text-lg font-bold text-[var(--text-primary)]">18</span>
              <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)]">
                EVENTOS SOCKET.IO
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border-default)]" />
            <div className="text-center">
              <span className="block text-lg font-bold text-[var(--text-primary)]">37</span>
              <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)]">
                TESTES
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border-default)]" />
            <div className="text-center">
              <span className="block text-lg font-bold text-[var(--text-primary)]">29</span>
              <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)]">
                FASES
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative border-t border-[var(--border-default)] py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="scroll-reveal mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              <span className="animate-gradient bg-gradient-to-r from-[var(--primary-500)] via-[#8b5cf6] to-[var(--primary-500)] bg-clip-text text-transparent">
                Tech Stack
              </span>
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Tecnologias modernas para uma arquitetura escalável e performática.
            </p>
          </div>
        </div>

        <div className="scroll-reveal">
          <TechMarquee />
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
