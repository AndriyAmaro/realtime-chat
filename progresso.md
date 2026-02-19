# Progresso — Chat em Tempo Real com Salas

> Atualizado a cada fase concluída. Acompanha o estado real do projeto.

---

## Visão Geral das Fases

| # | Fase | Status | Data Início | Data Fim |
|---|---|---|---|---|
| 1 | Setup do Projeto (repo, estrutura, configs) | ✅ Concluída | — | 18/02/2026 |
| 2 | Copiar Design System do Pulse | ✅ Concluída | — | 18/02/2026 |
| 3 | Adaptar componentes (Next.js → React/Vite) | ✅ Concluída | — | 18/02/2026 |
| 4 | Backend: Setup (Express, Prisma, PostgreSQL, Docker) | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 5 | Backend: Autenticação (register, login, JWT, refresh token) | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 6 | Frontend: Páginas de Auth (Login, Registro, Forgot Password) | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 7 | Backend: CRUD de Salas + Membros | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 8 | Frontend: Lista de Salas + Criar/Entrar em Sala | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 9 | Backend: Socket.io + Eventos de Conexão | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 10 | Mensagens em Tempo Real (envio/recebimento) | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 11 | Indicador "digitando..." + Status online/offline | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 12 | Histórico de Mensagens + Scroll Infinito | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 13 | Upload de Imagens/Arquivos nas Mensagens | ✅ Concluída | 18/02/2026 | 18/02/2026 |
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

**Progresso global: 13/23 fases concluídas (~57%)**

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

### Fase 4 — Backend: Setup ✅

- [x] Inicializar Node.js + Express + TypeScript (Express 5, TypeScript 5.9, tsx)
- [x] Configurar PostgreSQL no Docker (docker-compose.yml com health checks)
- [x] Configurar Prisma ORM (Prisma 7 + @prisma/adapter-pg + pg driver)
- [x] Criar schema do banco (User, Room, RoomMember, Message + 3 enums + indexes)
- [x] Rodar primeira migration (`prisma migrate dev --name init`)
- [x] Criar script de seed com dados demo (5 users, 4 rooms, 13 memberships, 14 messages)
- [x] Criar `src/app.ts` (Express server + helmet + cors + rate limiter + morgan + error handler)
- [x] Criar estrutura de pastas do backend:
  - `src/config/` — env.ts (Zod validation), database.ts (Prisma + PrismaPg adapter), index.ts
  - `src/errors/` — AppError, AuthError, ForbiddenError, NotFoundError, ConflictError, RateLimitError, ValidationError
  - `src/middleware/` — auth.ts (JWT), errorHandler.ts, rateLimiter.ts, requestLogger.ts (Morgan), validate.ts (Zod)
  - `src/routes/` — health.ts (GET /api/v1/health), index.ts (route aggregator)
  - `src/types/` — api.ts (ApiResponse, AuthPayload, AuthenticatedRequest, pagination types)
- [x] Health check endpoint testado (GET /api/v1/health → { success: true, data: { server: "ok", database: "ok" } })

### Fase 5 — Backend: Autenticação ✅

- [x] Arquitetura 3 camadas: Controller → Service → Repository
  - `src/repositories/user.repository.ts` — Queries Prisma (findByEmail, findById, create, updateStatus)
  - `src/services/auth.service.ts` — Lógica de negócio (register, login, refreshToken, getProfile)
  - `src/controllers/auth.controller.ts` — Request handling + response formatting + cookie management
- [x] Rota POST `/api/v1/auth/register` (bcrypt saltRounds:12 + JWT + validação Zod)
- [x] Rota POST `/api/v1/auth/login` (access token 15min + refresh token 7d httpOnly cookie)
- [x] Rota POST `/api/v1/auth/refresh-token` (lê refresh do cookie, gera novo par)
- [x] Rota POST `/api/v1/auth/logout` (limpa cookie do refresh token)
- [x] Rota GET `/api/v1/auth/me` (rota protegida, retorna perfil do user autenticado)
- [x] JWT utils (generateAccessToken, generateRefreshToken, verifyRefreshToken)
- [x] Validação Zod: registerSchema (name 2-50, email, password 6-128), loginSchema
- [x] Middleware de autenticação (verificar JWT) — já criado na Fase 4
- [x] Rate limiter nas rotas de auth (10 req/min) — já criado na Fase 4
- [x] Todos os endpoints testados com curl (9 testes: register, duplicate, validation, login, wrong password, me auth, me no token, refresh, logout)

### Fase 6 — Frontend: Auth ✅

- [x] AuthLayout split-screen (AuthBackground animada à esquerda + form à direita, responsivo)
- [x] Página de Login (`/login`) — reutilizando AuthCard, AuthDivider, AuthLink, Input, PasswordInput do Pulse
- [x] Página de Registro (`/register`) — reutilizando AuthCard, Form + ControlledField + FormLabel + FormControl + FormMessage, PasswordInput com showStrength
- [x] SocialLoginButtons (Google, GitHub) — visuais desativados (disabled), preparados para integração futura
- [x] API client com auto-refresh de token (`services/api.ts`) — intercepta 401, tenta refresh, retry
- [x] Auth service (`services/auth.service.ts`) — register, login, refreshToken, logout, getProfile
- [x] Auth store Zustand (`store/auth.store.ts`) — user, accessToken, isAuthenticated, isLoading
- [x] Proteção de rotas (`ProtectedRoute`) — redireciona para /login se não autenticado, Spinner durante loading
- [x] Restore de sessão no App mount — tenta refresh token + getProfile ao carregar
- [x] Botão "Entrar como Demo" (usa credenciais seed: andriy@example.com)
- [x] Server errors inline com estilo do design system
- [x] Validação Zod no frontend (nome 2-50, email, senha 6+) + errors por campo do backend (422)
- [x] Página placeholder pós-login (`/chat`) com header, avatar, nome do user, logout
- [x] Fluxo completo testado: register → login → /me → refresh → proxy Vite → tudo OK

### Fase 7 — Backend: Salas ✅

- [x] Arquitetura 3 camadas: Controller → Service → Repository
  - `src/repositories/room.repository.ts` — Room + RoomMember Prisma queries (CRUD, join, leave, role management)
  - `src/services/room.service.ts` — Lógica de negócio (permissões, invite codes, validações)
  - `src/controllers/room.controller.ts` — Request handling + response formatting
- [x] Tipos + validação Zod (`src/types/room.ts`) — createRoom, updateRoom, joinRoom, updateMemberRole, listRoomsQuery (paginação + search)
- [x] 12 endpoints RESTful:
  - `POST /rooms` — Criar sala (pública ou privada, gera invite code automático)
  - `GET /rooms` — Listar minhas salas (paginado + busca por nome)
  - `GET /rooms/public` — Descobrir salas públicas (paginado + busca)
  - `GET /rooms/:roomId` — Detalhes da sala (membros, contagem de mensagens)
  - `PATCH /rooms/:roomId` — Atualizar sala (admin/owner only)
  - `DELETE /rooms/:roomId` — Excluir sala (owner only)
  - `POST /rooms/:roomId/join` — Entrar (público direto, privado com invite code)
  - `POST /rooms/:roomId/leave` — Sair da sala (owner não pode sair)
  - `GET /rooms/:roomId/members` — Listar membros
  - `PATCH /rooms/:roomId/members/:memberId` — Alterar cargo (admin/owner only)
  - `DELETE /rooms/:roomId/members/:memberId` — Remover membro (admin/owner only)
  - `POST /rooms/:roomId/invite-code` — Regenerar código de convite
- [x] Regras de negócio: owner auto-ADMIN, owner não pode sair, proteção contra auto-alteração de cargo, admin não remove admin (só owner), invite code 8 chars hex
- [x] Fix Express 5: `req.query`/`req.params` read-only → dados validados em `res.locals`
- [x] 16 testes manuais via curl — todos passaram

### Fase 8 — Frontend: Salas ✅

- [x] ChatLayout completo (header + sidebar colapsável + main area)
- [x] RoomSidebar com tabs "Minhas salas" / "Descobrir" (salas públicas)
  - Reutiliza: Tabs (underline), SearchBar (filled, debounce 300ms), EmptyState, Avatar, Badge
- [x] RoomItem com ícone (Hash/Lock), nome, descrição, badge "dono"
- [x] CreateRoomModal — Form com React Hook Form + Zod, Switch para sala privada
  - Reutiliza: Modal (compound), Form + ControlledField, Input, Switch, SubmitButton
- [x] JoinRoomModal — Entrar via ID da sala + código de convite
  - Reutiliza: Modal, Input, Button, Spinner
- [x] RoomView — Header da sala + painel de membros + placeholder para mensagens
  - Copiar ID da sala, ver invite code (admin/owner), sair/excluir sala
  - Reutiliza: Avatar (com status online/offline/away), Badge, Button, EmptyState
- [x] Room service (`services/room.service.ts`) — CRUD + join/leave + members API calls
- [x] React Query hooks (`hooks/useRooms.ts`) — useMyRooms, usePublicRooms, useRoom, useRoomMembers, mutations (create, join, leave, delete)
- [x] Zustand store (`store/room.store.ts`) — selectedRoomId
- [x] Types (`types/room.ts`) — Room, RoomDetail, RoomMember, PaginationMeta
- [x] App.tsx atualizado: /chat agora renderiza ChatLayout
- [x] Zero erros TypeScript, fluxo completo testado via proxy Vite

### Fase 9 — Backend: Socket.io ✅

- [x] Configurar Socket.io no httpServer (`config/socket.ts`) — CORS, ping interval, typed server
- [x] Autenticação JWT no handshake (`middleware/socketAuth.ts`) — extrai token do `socket.handshake.auth`
- [x] Tipos tipados (`types/socket.ts`) — ServerToClientEvents, ClientToServerEvents, payloads, TypedServer/TypedSocket
- [x] Message repository (`repositories/message.repository.ts`) — create, cursor-based pagination (findByRoomId)
- [x] Message service (`services/message.service.ts`) — send (valida membership), getHistory (cursor + limit)
- [x] Event handlers em `events/`:
  - `room.handler.ts` — room:join (valida membership, notifica), room:leave, getOnlineUserIds helper
  - `message.handler.ts` — message:send (persist + broadcast + ACK), message:history (cursor pagination)
  - `status.handler.ts` — ONLINE no connect, OFFLINE no disconnect (verifica sockets múltiplos)
  - `index.ts` — registro central + typing:start/typing:stop
- [x] Integração no `app.ts` — `initializeSocket(httpServer)`, `io.close()` no graceful shutdown, export `io`
- [x] 14 eventos Socket.io: room:join, room:leave, room:joined, room:left, room:members_online, message:send, message:new, message:history, user:status, typing:start, typing:stop, error

### Fase 10 — Mensagens em Tempo Real ✅

- [x] socket.io-client instalado + socket singleton manager (`services/socket.ts`)
- [x] `useSocket` hook — conexão com JWT auth, auto-reconnect, derive socket do auth state
- [x] `useMessages` hook — send com ACK, receive broadcast, cursor-based history, load more
- [x] `useTyping` hook — emit typing:start/stop com auto-timeout 3s, listen de outros users
- [x] `ChatArea` component — reutiliza ChatMessage + ChatInput + TypingIndicator do Pulse
- [x] Scroll infinito — load more ao chegar no topo, preserva posição do scroll
- [x] Auto-scroll inteligente — só rola para baixo se estiver perto do bottom
- [x] Banner de conexão — mostra "Conectando..." quando socket desconectado
- [x] Empty state — "Nenhuma mensagem ainda. Seja o primeiro a enviar!"
- [x] RoomView atualizado — placeholder removido, `<ChatArea>` integrado
- [x] React 19 compliant — zero setState em effects, "adjust state during render" pattern
- [x] Zero erros TypeScript + ESLint

### Fase 11 — Indicadores em Tempo Real ✅

- [x] `useTyping` hook — emit typing:start/stop com auto-timeout 3s (implementado na Fase 10)
- [x] TypingIndicator do Pulse — animação bounce, mostra nomes dos users digitando
- [x] `useOnlineStatus` hook — escuta `user:status` e `room:members_online` via Socket.io
- [x] Status em tempo real no painel de membros — Avatar com indicador online/away/offline
- [x] Contador de online no header da sala — bolinha verde + número de online
- [x] Fallback inteligente — usa status da REST API enquanto não há dados do socket

### Fase 12 — Histórico de Mensagens ✅

- [x] Backend: cursor-based pagination no `message.repository.ts` (implementado na Fase 9)
- [x] `useMessages` hook — `message:history` com cursor + limit (implementado na Fase 10)
- [x] Scroll infinito — detecta scroll no topo, carrega mais, preserva posição do scroll
- [x] Botão "Carregar mensagens anteriores" como fallback
- [x] Spinner de loading enquanto carrega histórico
- [x] Auto-scroll inteligente — só rola para baixo se estiver perto do bottom

### Fase 13 — Upload de Arquivos ✅

- [x] Backend: Multer com disk storage (random hex filenames, 5MB max, filtro de tipos)
- [x] Backend: `upload.service.ts` — configuração Multer, filtro de MIME types (imagens + PDF + texto + ZIP)
- [x] Backend: `upload.controller.ts` — handler de upload, retorna { url, filename, originalName, mimetype, size, isImage }
- [x] Backend: `upload.routes.ts` — POST `/api/v1/uploads` (autenticado, single file)
- [x] Backend: Servir arquivos estáticos de `/uploads` via `express.static`
- [x] Frontend: `upload.service.ts` — FormData + fetch com auth token
- [x] Frontend: ChatArea integrado com upload — botão de anexo, upload antes de enviar
- [x] Frontend: `sendFileMessage` no `useMessages` hook — envia tipo IMAGE ou FILE com fileUrl
- [x] Frontend: Preview de imagens e links de arquivos nas mensagens (via ChatMessage attachments)
- [x] Frontend: Indicador de upload em progresso ("Enviando arquivo...")
- [x] Vite proxy `/uploads` → backend para servir arquivos em dev
- [x] Zero erros TypeScript + ESLint

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
