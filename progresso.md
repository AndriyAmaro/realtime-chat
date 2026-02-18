# Progresso — Chat em Tempo Real com Salas

> Atualizado a cada fase concluída. Acompanha o estado real do projeto.

---

## Visão Geral das Fases

| # | Fase | Status | Data Início | Data Fim |
|---|---|---|---|---|
| 1 | Setup do Projeto (repo, estrutura, configs) | ✅ Concluída | — | 18/02/2026 |
| 2 | Copiar Design System do Pulse | ✅ Concluída | — | 18/02/2026 |
| 3 | Adaptar componentes (Next.js → React/Vite) | ✅ Concluída | — | 18/02/2026 |
| 4 | Backend: Setup (Express, Prisma, PostgreSQL, Docker) | 🔶 Em progresso | — | — |
| 5 | Backend: Autenticação (register, login, JWT, refresh token) | ⬚ Pendente | — | — |
| 6 | Frontend: Páginas de Auth (Login, Registro, Forgot Password) | ⬚ Pendente | — | — |
| 7 | Backend: CRUD de Salas + Membros | ⬚ Pendente | — | — |
| 8 | Frontend: Lista de Salas + Criar/Entrar em Sala | ⬚ Pendente | — | — |
| 9 | Backend: Socket.io + Eventos de Conexão | ⬚ Pendente | — | — |
| 10 | Mensagens em Tempo Real (envio/recebimento) | ⬚ Pendente | — | — |
| 11 | Indicador "digitando..." + Status online/offline | ⬚ Pendente | — | — |
| 12 | Histórico de Mensagens + Scroll Infinito | ⬚ Pendente | — | — |
| 13 | Upload de Imagens/Arquivos nas Mensagens | ⬚ Pendente | — | — |
| 14 | Notificações (badge, som, destaque visual) | ⬚ Pendente | — | — |
| 15 | Busca dentro das Mensagens | ⬚ Pendente | — | — |
| 16 | Indicador de Leitura (visto ✓✓) | ⬚ Pendente | — | — |
| 17 | Responsividade Completa (mobile) | ⬚ Pendente | — | — |
| 18 | Testes (Jest + React Testing Library) | ⬚ Pendente | — | — |
| 19 | Documentação Swagger da API | ⬚ Pendente | — | — |
| 20 | Docker Compose (tudo funciona com 1 comando) | ⬚ Pendente | — | — |
| 21 | CI/CD (GitHub Actions) | ⬚ Pendente | — | — |
| 22 | Deploy (Vercel + Railway) | ⬚ Pendente | — | — |
| 23 | README profissional + Screenshots/GIFs | ⬚ Pendente | — | — |

**Progresso global: 3/23 fases concluídas (~13%) + 1 em progresso**

---

## Detalhe por Fase

### Fase 1 — Setup do Projeto ✅

- [x] Criar repositório no GitHub (`realtime-chat`)
- [x] Inicializar estrutura monorepo (`client/` + `server/`)
- [x] Configurar ESLint + Prettier (raiz + eslint.config.mjs + .prettierrc)
- [x] Configurar Husky + lint-staged (pre-commit + commit-msg hooks)
- [x] Configurar Conventional Commits (commitlint.config.mjs)
- [x] Criar `.env.example` (DB, Redis, JWT, Upload configs)
- [x] Criar `docker-compose.yml` base (PostgreSQL 16 + Redis 7 com health checks)

### Fase 2 — Copiar Design System do Pulse ✅

- [x] Copiar `core/tokens/` (cores, espaçamento, radius, z-index, animações)
- [x] Copiar `core/primitives/` — **15 componentes:**
  - Button, Input, Avatar, Badge, Spinner, Skeleton, Checkbox, Switch, Textarea, Select, Radio, Tooltip, Tag, Divider, ThemeToggle
- [x] Copiar `core/organisms/` — **5 componentes:**
  - Card, Modal, Drawer, DropdownMenu, Form (com React Hook Form + Zod)
- [x] Copiar `core/patterns/` — **17 componentes:**
  - AuthCard, AuthBackground, ChatUI, Toast, SearchBar, Tabs, FileUpload, Alert, EmptyState, Accordion, Breadcrumbs, NotificationCenter, Pagination, PasswordInput, SocialLoginButtons, FormField
- [x] Copiar `core/layouts/` — **3 componentes:**
  - Sidebar (colapsável + mobile drawer), Header (responsivo), MainContent
- [x] Copiar `shared/utils/cn.ts` (clsx + tailwind-merge)
- [x] Copiar `shared/types/index.ts`
- [x] Copiar `globals.css` (design tokens, dark mode, animações premium)

### Fase 3 — Adaptar Componentes ✅

- [x] Remover dependências Next.js dos componentes (zero imports de `next/`)
- [x] Implementar dark mode sem `next-themes` (useTheme hook + ThemeProvider custom)
- [x] Ajustar todos os caminhos de importação (aliases @core, @shared, @components)
- [x] Instalar dependências necessárias (11 pacotes Radix UI, CVA, tailwind-merge, clsx)
- [x] Verificar que todos os componentes compilam sem erros (App.tsx usa vários componentes)

### Fase 4 — Backend: Setup 🔶

- [x] Inicializar Node.js + Express + TypeScript (Express 5, TypeScript 5.9, tsx)
- [x] Configurar PostgreSQL no Docker (docker-compose.yml com health checks)
- [x] Configurar Prisma ORM (Prisma 7 instalado, prisma.config.ts)
- [x] Criar schema do banco (User, Room, RoomMember, Message + 3 enums + indexes)
- [ ] Rodar primeira migration (`prisma migrate dev`)
- [ ] Criar script de seed com dados demo (`prisma/seed.ts`)
- [ ] Criar `src/app.ts` (servidor Express com middleware base)
- [ ] Criar estrutura de pastas do backend (controllers/, routes/, services/, middleware/)

### Fase 5 — Backend: Autenticação ⬚

- [ ] Rota POST `/auth/register` (bcrypt + JWT)
- [ ] Rota POST `/auth/login` (access + refresh token)
- [ ] Rota POST `/auth/refresh-token`
- [ ] Rota POST `/auth/forgot-password`
- [ ] Middleware de autenticação (verificar JWT)
- [ ] Rate limiter nas rotas de auth

### Fase 6 — Frontend: Auth ⬚

- [ ] Página de Login (reutilizando AuthCard + AuthBackground do Pulse)
- [ ] Página de Registro
- [ ] Página de Recuperação de Senha
- [ ] Integração com API (React Query)
- [ ] Proteção de rotas (ProtectedRoute)
- [ ] Botão "Entrar como Demo"

### Fase 7 — Backend: Salas ⬚

- [ ] CRUD de salas (criar, listar, editar, deletar)
- [ ] Sistema de membros (entrar, sair, remover)
- [ ] Salas públicas vs privadas
- [ ] Convite por link (invite code)
- [ ] Roles (ADMIN, MEMBER)

### Fase 8 — Frontend: Salas ⬚

- [ ] Lista de salas na Sidebar (reutilizando Sidebar do Pulse)
- [ ] Card de sala com info (membros online, última mensagem)
- [ ] Modal para criar sala
- [ ] Entrar em sala por convite
- [ ] Lista de membros da sala

### Fase 9 — Backend: Socket.io ⬚

- [ ] Configurar Socket.io no servidor
- [ ] Autenticação via Socket (JWT no handshake)
- [ ] Eventos: `join-room`, `leave-room`
- [ ] Gestão de status online/offline/away
- [ ] Broadcast de eventos por sala

### Fase 10 — Mensagens em Tempo Real ⬚

- [ ] Evento `send-message` + `receive-message`
- [ ] Persistir mensagens no banco (Prisma)
- [ ] Frontend: ChatWindow + MessageBubble + MessageInput
- [ ] Emojis no input de mensagens

### Fase 11 — Indicadores em Tempo Real ⬚

- [ ] Evento `typing` + `stop-typing`
- [ ] Frontend: TypingIndicator component
- [ ] Status online/offline/away em tempo real
- [ ] Avatar com indicador de status (reutilizando Avatar do Pulse)

### Fase 12 — Histórico de Mensagens ⬚

- [ ] Endpoint GET `/rooms/:id/messages` com paginação cursor-based
- [ ] Frontend: scroll infinito (carregar mais ao subir)
- [ ] Skeleton loading enquanto carrega

### Fase 13 — Upload de Arquivos ⬚

- [ ] Endpoint de upload (imagens + arquivos)
- [ ] Frontend: FileUpload (reutilizando do Pulse)
- [ ] Preview de imagens nas mensagens
- [ ] Download de arquivos

### Fase 14 — Notificações ⬚

- [ ] Badge com contagem de não lidas (reutilizando Badge do Pulse)
- [ ] Som de notificação para novas mensagens
- [ ] Destaque visual em salas com mensagens novas
- [ ] Toast notifications (reutilizando Toast do Pulse)

### Fase 15 — Busca de Mensagens ⬚

- [ ] Endpoint GET `/rooms/:id/messages/search?q=`
- [ ] Frontend: SearchBar (reutilizando do Pulse)
- [ ] Highlight do texto encontrado
- [ ] Navegar até a mensagem encontrada

### Fase 16 — Indicador de Leitura ⬚

- [ ] Marcar mensagens como lidas ao visualizar
- [ ] Evento `messages-read` via Socket
- [ ] Frontend: ícone ✓✓ nas mensagens

### Fase 17 — Responsividade ⬚

- [ ] Layout mobile para o chat (drawer para salas)
- [ ] Testar em vários tamanhos de ecrã
- [ ] Touch-friendly em todos os componentes

### Fase 18 — Testes ⬚

- [ ] Testes unitários do backend (auth, rooms, messages)
- [ ] Testes de integração das rotas API
- [ ] Testes frontend (React Testing Library)
- [ ] Cobertura mínima de 70%

### Fase 19 — Documentação Swagger ⬚

- [ ] Configurar Swagger/OpenAPI no Express
- [ ] Documentar todas as rotas
- [ ] Exemplos de request/response

### Fase 20 — Docker Compose Final ⬚

- [ ] Frontend + Backend + PostgreSQL num só `docker-compose up`
- [ ] Volumes para persistência do banco
- [ ] Health checks
- [ ] Script de seed automático

### Fase 21 — CI/CD ⬚

- [ ] GitHub Actions: lint + tests em cada PR
- [ ] Badge de CI no README
- [ ] Auto-deploy no merge para main

### Fase 22 — Deploy ⬚

- [ ] Frontend no Vercel
- [ ] Backend no Railway ou Render
- [ ] PostgreSQL managed (Railway/Neon)
- [ ] Variáveis de ambiente configuradas
- [ ] Link live no README

### Fase 23 — README Profissional ⬚

- [ ] Descrição impactante
- [ ] Screenshots e GIFs do app funcionando
- [ ] Badges (CI, license, tech stack)
- [ ] Secção "Built with Pulse Design System" com link
- [ ] Instruções de como rodar (1 comando)
- [ ] Link para Swagger docs
- [ ] Link para demo live

---

## Reutilização do Pulse Design System

> Mapeamento de como os componentes do Pulse são reutilizados neste projeto.

| Componente Pulse | Uso no Chat | Fase |
|---|---|---|
| `Avatar` (com status) | Foto do user + indicador online/offline/away | 11 |
| `Badge` | Contagem de mensagens não lidas | 14 |
| `Button` | Enviar mensagem, criar sala, ações | 6+ |
| `Input` | Campos de busca, forms | 6+ |
| `Skeleton` | Loading states das mensagens | 12 |
| `Spinner` | Loading geral | 6+ |
| `Tag` | Tags nas salas | 8 |
| `ThemeToggle` | Dark/Light mode | 3 ✅ |
| `Card` | Cards de salas | 8 |
| `Modal` | Criar sala, convidar membros | 8 |
| `Drawer` | Painel lateral mobile | 17 |
| `DropdownMenu` | Menu de contexto (editar/apagar mensagem) | 10 |
| `Form` | Formulários de auth e criação de sala | 6, 8 |
| `AuthCard` | Container de Login/Registro | 6 |
| `AuthBackground` | Background animado nas páginas de auth | 6 |
| `ChatUI` | **Coração do app** — mensagens, input, typing | 10, 11 |
| `Toast` | Notificações toast | 14 |
| `SearchBar` | Busca de mensagens e salas | 15 |
| `FileUpload` | Upload de imagens/ficheiros | 13 |
| `EmptyState` | "Nenhuma mensagem ainda" | 10 |
| `Tabs` | Salas públicas/privadas | 8 |
| `Sidebar` | Lista de salas | 8 |
| `Header` | Header com busca e notificações | 8 |
| `PasswordInput` | Campo de senha com show/hide | 6 |
| `NotificationCenter` | Centro de notificações | 14 |
| `Pagination` | Histórico de mensagens | 12 |

---

## Notas e Decisões

- **Vite em vez de Next.js** — O chat não precisa de SSR; Vite oferece DX mais rápida e build mais leve
- **Express 5** — Versão mais recente com melhor suporte a async/await
- **Prisma 7** — Versão mais recente com melhor performance e type safety
- **React 19** — Versão mais recente com concurrent features
- **Tailwind CSS 4** — Nova versão com @theme e CSS-first config
- **Dark mode custom** — Substituímos `next-themes` por useTheme hook + ThemeProvider próprios
- **PostgreSQL na porta 5433** — Para não conflitar com instalações locais (porta padrão 5432)
- **Redis na porta 6380** — Para não conflitar com instalações locais (porta padrão 6379)
