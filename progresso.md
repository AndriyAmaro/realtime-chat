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
| 14 | Notificações (badge, som, destaque visual) | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 15 | Busca dentro das Mensagens | ✅ Concluída | 18/02/2026 | 18/02/2026 |
| 16 | Indicador de Leitura (visto ✓✓) | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 17 | Responsividade Completa (mobile) | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 18 | Testes (Vitest + React Testing Library) | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 19 | Documentação Swagger da API | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 20 | Docker Compose (tudo funciona com 1 comando) | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 21 | CI/CD (GitHub Actions) | ✅ Concluída | 19/02/2026 | 19/02/2026 |
| 22 | Deploy (Vercel + Railway) | ✅ Concluída | 19/02/2026 | 20/02/2026 |
| 23 | Perfil de Usuário + Configurações | ⬚ Pendente | — | — |
| 24 | Message Enhancements (Edit, Delete, Replies, Reactions) | ⬚ Pendente | — | — |
| 25 | Resilience Engineering (Offline Queue, Reconnexão, Anti-Spam) | ⬚ Pendente | — | — |
| 26 | Observability & Production Hardening | ⬚ Pendente | — | — |
| 27 | Performance Optimization (Code Splitting, Lighthouse 95+) | ⬚ Pendente | — | — |
| 28 | Architecture Documentation (/docs/) | ⬚ Pendente | — | — |
| 29 | README Profissional + Landing Page Senior | ⬚ Pendente | — | — |

**Progresso global: 22/29 fases concluídas (~76%)**

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

### Fase 14 — Notificações ✅

- [x] Backend: Auto-join de todas as salas do user no socket connect (para receber `message:new` de todas)
- [x] Backend: `roomMemberRepository.findRoomIdsByUserId()` — query leve para IDs das salas
- [x] `notification.store.ts` — Zustand store para unread counts + preferência de som
- [x] `useToast.ts` — Hook imperativo para gerenciar toasts (add/dismiss)
- [x] `useNotifications.ts` — Hook global que escuta `message:new` para salas não ativas
  - Incrementa unread count no notification store
  - Toca som de notificação via Web Audio API (oscilador 800→600Hz, 0.3s)
  - Mostra toast com nome do user + preview da mensagem (60 chars max)
  - Não notifica mensagens próprias nem da sala ativa
- [x] Badge de não lidas no `RoomItem` — bolinha vermelha com contagem (max "99+")
- [x] Destaque visual — nome da sala em negrito quando há mensagens não lidas
- [x] Limpa unreads ao clicar na sala
- [x] Botão de toggle som no header (Volume2/VolumeX icons)
- [x] `ToastProvider` + `ToastViewport` wired no `main.tsx` (position: top-right)
- [x] Toasts renderizados no `ChatLayout` com auto-dismiss em 4s
- [x] Zero erros TypeScript + ESLint

### Fase 15 — Busca de Mensagens ✅

- [x] Backend: `messageRepository.searchInRoom()` — busca case-insensitive com Prisma `contains`
- [x] Backend: `messageService.search()` — valida membership, offset-based pagination
- [x] Backend: `messageController.search()` — GET `/rooms/:roomId/messages/search?q=&page=&limit=`
- [x] Backend: Zod validation (`searchMessagesQuerySchema`) — q (1-100 chars), page, limit (max 50)
- [x] Frontend: `messageService.search()` — API client via React Query
- [x] Frontend: `useMessageSearch` hook — React Query com staleTime 30s, enabled quando query >= 1 char
- [x] Frontend: `MessageSearch` component — painel lateral com SearchBar (Pulse), resultados com avatar + timestamp
- [x] Frontend: `HighlightText` — regex-based highlight com `<mark>` amarelo nos termos encontrados
- [x] Frontend: `SearchResultItem` — clicável, navega até a mensagem no chat
- [x] Frontend: Scroll to message — `scrollIntoView({ behavior: 'smooth', block: 'center' })` + highlight pulse
- [x] Frontend: Botão de busca no header da sala (ícone Search) — abre/fecha painel de busca
- [x] Frontend: Painel de busca substitui painel de membros quando aberto
- [x] Zero erros TypeScript + ESLint

### Fase 16 — Indicador de Leitura ✅

- [x] Backend: `lastReadAt` DateTime no RoomMember (per-user per-room, não per-message)
- [x] Backend: Migration `add_last_read_at` aplicada
- [x] Backend: `roomMemberRepository.updateLastReadAt()` + `getReadReceipts()`
- [x] Backend: `read.handler.ts` — escuta `messages:read`, persiste no DB, broadcast para room
- [x] Backend: Envia read receipts iniciais no `room:join` (`messages:read_receipts`)
- [x] Socket types: `messages:read` (bidirecional) + `messages:read_receipts` (server→client)
- [x] Frontend: `useReadReceipts` hook — emit `messages:read` ao abrir sala + novos messages
  - Escuta `messages:read_receipts` (bulk inicial) e `messages:read` (updates em tempo real)
  - Expõe `isReadByOthers(createdAt)` — verifica se algum outro membro leu após o timestamp
  - Reset de receipts ao trocar de sala ("adjust state during render" pattern)
- [x] Frontend: ChatArea — `showStatus` habilitado no `ChatMessage`
  - `toChatMessage` agora calcula `status: 'read'` (✓✓ azul) vs `'sent'` (✓ branco)
  - Status só aparece em mensagens enviadas (`position === 'sent'`)
- [x] Reutiliza `MessageStatusIcon` do Pulse — `CheckCheck` azul para read, `Check` branco para sent
- [x] Zero erros TypeScript + ESLint

### Fase 17 — Responsividade ✅

- [x] `useMediaQuery` hook — reactivo via `window.matchMedia`, reutilizável em todo o app
- [x] ChatLayout: mobile-first full-screen swap (sidebar OR room view, como WhatsApp)
  - `< 768px`: sidebar full screen quando nenhuma sala selecionada, room view quando selecionada
  - `≥ 768px`: sidebar collapsível + room view side-by-side (comportamento anterior)
  - Header principal oculto no mobile quando dentro de uma sala (room tem header próprio)
  - Sidebar toggle button apenas no desktop
- [x] RoomView: back button (ArrowLeft) no mobile para voltar à lista de salas
  - Ícone da sala (`Hash`/`Lock`) oculto em `< 640px`, visível em `sm:flex`
  - Descrição da sala oculta em `< 640px`, visível em `sm:block`
  - Header padding responsivo: `px-3 sm:px-4 md:px-6`
  - Room name `text-sm` no mobile, `sm:text-base` no desktop
  - Botões com `gap-1 sm:gap-2` para melhor espaçamento
- [x] Painéis laterais responsivos com Drawer do Pulse:
  - `≥ 1024px` (desktop): painéis de membros e busca inline (side panels)
  - `< 1024px` (mobile/tablet): painéis em Drawer (slide-in right, `max-w-[92vw]`)
  - Member count clicável em `< lg` para abrir drawer de membros
  - Busca em Drawer com `sr-only` title para acessibilidade (Radix Dialog compliance)
- [x] `MembersList` extraído como componente reutilizado no inline e no Drawer (zero duplicação)
- [x] Touch-friendly: todos os botões ≥ 40px, tap targets adequados, gaps responsivos
- [x] Zero erros TypeScript + ESLint

### Fase 18 — Testes ✅

- [x] Vitest configurado para server e client (configs separadas, globals, ambientes node/jsdom)
- [x] Client: setup file com `@testing-library/jest-dom/vitest` para matchers extra
- [x] Scripts `test`, `test:watch`, `test:coverage` em ambos package.json
- [x] **Backend — 25 testes (2 suites):**
  - `auth.service.test.ts` (10 testes): register (success, duplicate email), login (success, wrong password, not found), refreshToken (success, user deleted, invalid token), getProfile (success, not found)
  - `room.service.test.ts` (15 testes): createRoom (public, private with invite code), joinRoom (public, private valid code, wrong code, already member, not found), leaveRoom (success, owner forbidden), deleteRoom (owner, non-owner), getRoom (member, hide invite code, show to owner, private forbidden)
  - Mocks: repositories com `vi.mock()`, bcryptjs, jwt utils
  - Factory functions: `createUserRecord()`, `createUserProfile()`, `createRoomRecord()`, `createMemberRecord()`
  - Padrão AAA (Arrange-Act-Assert), describe/it naming convention
- [x] **Frontend — 12 testes (2 suites):**
  - `notification.store.test.ts` (8 testes): incrementUnread (new room, existing, independent), clearUnread (specific room, nonexistent), resetAll, toggleSound (on→off, off→on)
  - `useMediaQuery.test.ts` (4 testes): matches true, matches false, update on change, cleanup listener on unmount
  - React Testing Library `renderHook` + `act` para testar hooks
  - Zustand store testado via `getState()`/`setState()` (sem DOM)
- [x] **Total: 37 testes, 4 suites, todos passando**
- [x] Zero erros TypeScript + ESLint

### Fase 19 — Documentação Swagger ✅

- [x] Instalado `swagger-ui-express` + `@types/swagger-ui-express`
- [x] Criado `server/src/config/swagger.ts` — spec OpenAPI 3.0.3 completo em TypeScript
- [x] Swagger UI montado em `/api/docs` com custom CSS (topbar removida)
- [x] JSON spec exposto em `/api/docs.json` para consumo externo
- [x] **20 operações documentadas em 16 paths:**
  - Health: `GET /health`
  - Auth (5): register, login, refresh-token, logout, me
  - Rooms (6): create, list, discover public, get details, update, delete
  - Room Actions (3): join, leave, regenerate invite code
  - Members (3): list, update role, remove
  - Messages (1): search
  - Uploads (1): file upload
- [x] **18 schemas reutilizáveis:** ApiResponse, ErrorResponse, ValidationErrorResponse, PaginationMeta, RegisterInput, LoginInput, AuthResponse, UserProfile, CreateRoomInput, UpdateRoomInput, JoinRoomInput, UpdateMemberRoleInput, Room, RoomDetail, RoomMember, RoomMemberWithUser, Message, UploadResult
- [x] **6 tags organizacionais:** Health, Auth, Rooms, Members, Messages, Uploads
- [x] Segurança: Bearer JWT documentado com `securitySchemes`
- [x] Parâmetros reutilizáveis: RoomId, MemberId, Page, Limit, Search
- [x] Respostas reutilizáveis: Unauthorized (401), Forbidden (403), NotFound (404), Conflict (409), ValidationError (422), RateLimited (429)
- [x] Exemplos de request/response em todos os endpoints
- [x] Console log do server atualizado com link para API Docs
- [x] Zero erros TypeScript + ESLint

### Fase 20 — Docker Compose Final ✅

- [x] **5 serviços orquestrados** com `docker compose up -d`:
  - `postgres` — PostgreSQL 16 Alpine com health check (`pg_isready`)
  - `redis` — Redis 7 Alpine com health check (`redis-cli ping`)
  - `server` — Backend Node.js (multi-stage build) com health check (wget /health)
  - `client` — Frontend Vite + Nginx Alpine com proxy reverso (API + Socket.io + uploads)
  - `migrate` — Container one-shot para `prisma migrate deploy` (run-once, `restart: no`)
- [x] **Multi-stage Dockerfiles:**
  - Server: `builder` (npm ci + prisma generate + tsc + CJS fix) → `runner` (prod deps only, ~245 pkgs)
  - Client: `builder` (npm ci + vite build) → `runner` (nginx:alpine, ~7MB static)
  - Fix Prisma 7 CJS: sed post-build substitui `import.meta.url` por equivalente CJS
- [x] **Nginx reverse proxy** (`client/nginx.conf`):
  - `/api/` → proxy para `server:4000` (HTTP)
  - `/socket.io/` → proxy para `server:4000` (WebSocket upgrade)
  - `/uploads/` → proxy para `server:4000`
  - `/` → SPA fallback (`try_files $uri /index.html`)
  - Gzip habilitado, cache de assets estáticos (1 ano, immutable)
- [x] **Volumes nomeados:** `postgres_data`, `redis_data`, `uploads_data` (persistência)
- [x] **Dependency ordering:** postgres/redis (healthy) → migrate + server → client
- [x] **Health checks** em todos os serviços com intervalos configurados
- [x] `.dockerignore` para server e client (exclui node_modules, .git, .env, coverage)
- [x] Ambiente de produção: `NODE_ENV=production`, todas as env vars configuráveis via `.env`
- [x] Testado end-to-end: server healthy, client HTTP 200, API proxy OK, Swagger OK, migrations OK

### Fase 21 — CI/CD ✅

- [x] Criado `.github/workflows/ci.yml` — pipeline completo com GitHub Actions
- [x] **4 jobs paralelos + sequenciais:**
  - `lint` — ESLint (client + server) + Prettier check (formatting)
  - `typecheck` — `tsc --noEmit` no server (com Prisma generate)
  - `test` — Vitest server (25 tests) + Vitest client (12 tests)
  - `build` — Compila server (`tsc`) + client (`vite build`) — roda após lint/typecheck/test passarem
- [x] **Triggers:** push para `main` + pull requests contra `main`
- [x] **Concurrency:** cancela runs anteriores da mesma branch (`cancel-in-progress: true`)
- [x] **Cache:** npm cache com `cache-dependency-path` para os 3 lock files (root, server, client)
- [x] **Node.js 22** em todas as jobs
- [x] Pipeline: lint + typecheck + test (paralelos) → build (sequencial, depende dos 3)

### Fase 22 — Deploy ✅

- [x] **Frontend no Vercel** — `https://realtime-chat-eight-beryl.vercel.app`
  - Root directory: `client`, Framework: Vite, auto-deploy on push to `main`
  - `vercel.json` com SPA rewrite (`/(.*) → /index.html`)
  - Env var: `VITE_API_URL` apontando para Railway
- [x] **Backend no Railway** — `https://server-production-f308.up.railway.app`
  - Dockerfile multi-stage, root directory: `server`
  - Health check: `/api/v1/health` (server ok + database ok)
  - Pre-deploy command: `npx prisma migrate deploy`
  - Auto-deploy trigger: push to `main` branch
  - Restart policy: on failure (max 3 retries)
- [x] **PostgreSQL managed (Railway)** — `postgres:16-alpine` com volume persistente
  - Private networking: `postgres.railway.internal:5432`
  - Database: `realtime_chat`, user: `chat_user`
- [x] **Variáveis de ambiente configuradas:**
  - Server: NODE_ENV, DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, PORT, etc.
  - Client: VITE_API_URL
- [x] **Links live:**
  - Client: https://realtime-chat-eight-beryl.vercel.app
  - Server: https://server-production-f308.up.railway.app
  - Health: https://server-production-f308.up.railway.app/api/v1/health
  - Swagger: https://server-production-f308.up.railway.app/api/docs

### Fase 23 — Perfil de Usuário + Configurações ⬚

> Feature básica que falta. Todo chat tem. Recrutador vai testar e espera poder mudar foto/nome.

**Backend:**
- [ ] `PATCH /api/v1/auth/profile` — Atualizar nome e avatar (Zod validation)
- [ ] `PATCH /api/v1/auth/password` — Trocar senha (confirmar senha atual + nova senha)
- [ ] `userRepository.updateProfile()` — Update name, avatar
- [ ] `userRepository.updatePassword()` — Hash + update password
- [ ] `authService.updateProfile()` + `authService.changePassword()` — Lógica de negócio
- [ ] Reutilizar upload existente (`/api/v1/uploads`) para foto de perfil
- [ ] Swagger: documentar novos endpoints

**Frontend:**
- [ ] `ProfileModal` — Modal acessível clicando no avatar no header
- [ ] Seções: Foto de perfil (upload com preview circular), Nome, Email (read-only), Trocar senha
- [ ] Upload de avatar: preview antes de salvar, crop circular, fallback para iniciais
- [ ] `useUpdateProfile` hook (React Query mutation + invalidate /me)
- [ ] `useChangePassword` hook (React Query mutation)
- [ ] Toast de sucesso/erro nas operações
- [ ] Atualizar `auth.store` com novos dados após save

---

### Fase 24 — Message Enhancements ⬚

> Features que todo chat moderno tem. Sem isso, parece incompleto para um recrutador.

**24a — Editar Mensagens:**
- [ ] Backend: `PATCH /api/v1/rooms/:roomId/messages/:messageId` — update content
- [ ] Backend: Campo `editedAt DateTime?` no Message (migration)
- [ ] Backend: Socket event `message:edit` (emit) → `message:edited` (broadcast)
- [ ] Backend: Validação — só o autor pode editar, apenas mensagens TEXT
- [ ] Frontend: Menu de contexto (DropdownMenu) com "Editar" nas mensagens próprias
- [ ] Frontend: Inline editing — input substitui o texto, Enter salva, Escape cancela
- [ ] Frontend: Label "(editado)" sutil nas mensagens editadas

**24b — Deletar Mensagens (Soft Delete):**
- [ ] Backend: Campo `deletedAt DateTime?` no Message (migration)
- [ ] Backend: `DELETE /api/v1/rooms/:roomId/messages/:messageId` — soft delete
- [ ] Backend: Socket event `message:delete` → `message:deleted` (broadcast)
- [ ] Backend: Filtrar deletadas no histórico e busca (`WHERE deletedAt IS NULL`)
- [ ] Frontend: "Excluir" no menu de contexto + confirmação
- [ ] Frontend: Placeholder "Mensagem excluída" no lugar (como WhatsApp)

**24c — Respostas (Reply):**
- [ ] Backend: Campo `replyToId String?` no Message + relação self-referencing (migration)
- [ ] Backend: Incluir `replyTo { id, content, user { name } }` no select de mensagens
- [ ] Backend: Socket payload incluir dados do reply
- [ ] Frontend: Botão "Responder" no hover/menu da mensagem
- [ ] Frontend: Barra de reply acima do input (nome + preview, botão X para cancelar)
- [ ] Frontend: Mensagem com reply mostra preview clicável acima (scroll-to on click)

**24d — Reações com Emoji:**
- [ ] Backend: Model `MessageReaction { id, messageId, userId, emoji, createdAt }` + migration
- [ ] Backend: `POST /api/v1/rooms/:roomId/messages/:messageId/reactions` (toggle)
- [ ] Backend: Socket event `message:react` → `message:reaction` (broadcast)
- [ ] Backend: Incluir contagem de reactions agrupadas por emoji no select de mensagens
- [ ] Frontend: Botão de smile no hover da mensagem → picker com 6 emojis rápidos
- [ ] Frontend: Mostrar reactions abaixo da mensagem (emoji + contagem, clicável para toggle)
- [ ] Frontend: Tooltip mostrando quem reagiu ao hover

---

### Fase 25 — Resilience Engineering ⬚

> Isso é o que separa junior de senior. Mostra que você pensa em produção real, não só "funciona no localhost".

**25a — Offline Message Queue:**
- [ ] `OfflineQueue` class — armazena mensagens em memória quando socket desconectado
- [ ] Ao enviar mensagem offline → salva na queue + mostra na UI com status "pendente" (ícone relógio)
- [ ] Ao reconectar → flush queue automaticamente (enviar todas as mensagens pendentes em ordem)
- [ ] Retry com exponential backoff por mensagem individual se falhar
- [ ] UI: mensagem pendente com opacidade reduzida + ícone de clock
- [ ] UI: mensagem falhada com ícone de erro + botão "Reenviar"
- [ ] Idempotency key (UUID gerado no client) para evitar duplicatas

**25b — Reconexão Inteligente:**
- [ ] Exponential backoff configurável (1s → 2s → 4s → 8s → 16s → 30s max)
- [ ] Banner de conexão melhorado: "Conectando..." → "Reconectando (tentativa 3/10)..." → "Sem conexão"
- [ ] Heartbeat monitor — detecta perda de conexão antes do socket timeout
- [ ] Auto-rejoin rooms após reconexão (re-emit `room:join` para todas as salas)
- [ ] Sync de mensagens perdidas — ao reconectar, pedir mensagens desde o último timestamp

**25c — Rate Limiting Anti-Spam (Socket-Level):**
- [ ] `socketRateLimiter` middleware — limitar mensagens por socket (ex: 10 msg/5s)
- [ ] Emit `error` com mensagem "Muitas mensagens, aguarde" quando limite excedido
- [ ] Rate limit por evento: `message:send` (10/5s), `typing:start` (3/2s), `message:react` (5/3s)
- [ ] Frontend: desabilitar botão "Enviar" temporariamente quando rate limited
- [ ] Frontend: feedback visual "Aguarde antes de enviar novamente"

**25d — Persistência de Socket por Usuário:**
- [ ] Map `userId → Set<socketId>` no servidor (suportar múltiplas abas/dispositivos)
- [ ] Status online baseado em `userSockets.size > 0` (não por socket individual)
- [ ] Ao desconectar um socket, só marcar OFFLINE se `userSockets.size === 0`
- [ ] Evento `user:devices` para informar quantas sessões ativas

---

### Fase 26 — Observability & Production Hardening ⬚

> Nível empresa. Recrutador técnico que lê o código vai ver isso e pensar "esse cara sabe o que faz em produção".

**26a — Structured Logging (Pino):**
- [ ] Substituir Morgan por Pino (JSON structured logs)
- [ ] Log levels: `debug`, `info`, `warn`, `error` — controlados por `LOG_LEVEL` env var
- [ ] Context em todo log: `{ requestId, userId, method, path, statusCode, duration }`
- [ ] Pretty printing em dev (`pino-pretty`), JSON em production
- [ ] Sanitização: nunca logar passwords, tokens, dados sensíveis

**26b — Request ID (Correlation ID):**
- [ ] Middleware `requestId.ts` — gera UUID e seta no `req.id` + header `X-Request-Id`
- [ ] Propagar para todos os logs: `logger.child({ requestId: req.id })`
- [ ] Propagar para error responses: `{ error, requestId }` — facilita debugging em produção
- [ ] Socket events: propagar requestId nos payloads

**26c — Métricas de Performance:**
- [ ] Middleware de response time — header `X-Response-Time` em toda resposta
- [ ] Endpoint `GET /api/v1/metrics` — retornar métricas básicas:
  - Uptime do servidor
  - Total de requests por rota
  - Tempo médio de resposta (p50, p95, p99)
  - Conexões WebSocket ativas
  - Mensagens por minuto
- [ ] In-memory metrics collector (sem dependência externa)

**26d — Error Tracking Middleware:**
- [ ] `errorTracker.ts` — captura todas exceções não tratadas
- [ ] Enriquece com contexto: requestId, userId, stack trace, request body (sanitized)
- [ ] Agrupa erros similares (por mensagem + stack fingerprint)
- [ ] Endpoint `GET /api/v1/admin/errors` — últimos 100 erros (protegido)
- [ ] Preparado para integrar com Sentry (interface compatível)

**26e — Graceful Shutdown Melhorado:**
- [ ] SIGTERM/SIGINT → parar aceitar conexões
- [ ] Notificar sockets: `server:shutdown` com countdown
- [ ] Drain conexões HTTP existentes (max 10s timeout)
- [ ] Fechar pool do banco de dados
- [ ] Log: "Server shut down gracefully in Xms"

---

### Fase 27 — Performance Optimization ⬚

> Lighthouse 95+ impressiona VISUALMENTE. Recrutador vê o score e pensa "esse cara se importa com performance".

**27a — Code Splitting & Lazy Loading:**
- [ ] `React.lazy()` para todas as rotas: LoginPage, RegisterPage, ChatLayout
- [ ] `Suspense` com fallback Spinner centralizado
- [ ] Lazy load de componentes pesados: MessageSearch, MembersPanel, modais
- [ ] Vite `manualChunks` — separar vendor (react, radix) de app code
- [ ] Bundle size target: main chunk < 200KB (gzip)

**27b — React Performance:**
- [ ] `React.memo` nos componentes de lista: RoomItem, ChatMessage
- [ ] `useCallback` para handlers passados a componentes memoizados
- [ ] `useMemo` para filtragem de salas e formatação de mensagens
- [ ] Virtualização de mensagens com `@tanstack/react-virtual` (para salas com 1000+ msgs)

**27c — Network Performance:**
- [ ] Prefetch de dados: ao hover numa sala, prefetch mensagens
- [ ] Stale time configurado por tipo: rooms (60s), messages (30s), profile (300s)
- [ ] Debounce search: 300ms (já existe)
- [ ] Image lazy loading com `loading="lazy"` em todas as imagens de mensagens
- [ ] Compression: `Content-Encoding: gzip` no server (já tem via helmet?)

**27d — Lighthouse Audit & Fixes:**
- [ ] Audit com Lighthouse CI
- [ ] Fixes: preload fonts, defer scripts, cache static assets
- [ ] Meta tags: description, og:image, viewport
- [ ] Target: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 90+
- [ ] Documentar scores no README com screenshot

---

### Fase 28 — Architecture Documentation ⬚

> Isso mostra maturidade técnica ABSURDA. Recrutador técnico abre /docs/ e pensa "esse cara pensa em sistema, não só em código".

**28a — `/docs/architecture.md`:**
- [ ] Diagrama de arquitetura (ASCII art): Client (Vercel) → API (Railway) → PostgreSQL → Redis (futuro)
- [ ] Diagrama de comunicação: HTTP REST + WebSocket
- [ ] Estrutura de pastas explicada (frontend + backend)
- [ ] Fluxo de autenticação (JWT access + refresh + httpOnly cookie)
- [ ] Fluxo de mensagem em tempo real (client → socket → server → DB → broadcast)
- [ ] Fluxo de reconexão e offline queue

**28b — `/docs/decisions.md` (Architecture Decision Records):**
- [ ] ADR-001: Por que Vite e não Next.js (chat não precisa de SSR)
- [ ] ADR-002: Por que Express 5 e não Fastify (ecosystem maturity)
- [ ] ADR-003: Por que Prisma 7 com adapter pattern (type safety + flexibility)
- [ ] ADR-004: Por que cursor-based pagination para mensagens (performance em dados append-only)
- [ ] ADR-005: Por que Zustand e não Redux (simplicidade, zero boilerplate)
- [ ] ADR-006: Por que Socket.io e não raw WebSocket (auto-reconnect, rooms, fallback polling)
- [ ] ADR-007: Por que Pino e não Winston (performance, structured JSON, Node.js native)
- [ ] ADR-008: Por que monorepo simples e não Turborepo (complexidade desnecessária para 2 packages)
- [ ] Cada ADR segue template: Context → Decision → Consequences → Alternatives Considered

**28c — `/docs/scaling.md`:**
- [ ] Como escalar para 10K usuários simultâneos (horizontal scaling)
- [ ] Como escalar para 100K (Redis pub/sub para Socket.io, connection pooling)
- [ ] Estratégia de cache: Redis (sessions, online status, hot messages, rate limiting)
- [ ] Estratégia de filas: BullMQ (email notifications, image processing, analytics)
- [ ] Estratégia de CDN: S3/R2 para uploads, CDN para assets estáticos
- [ ] Database scaling: read replicas, partitioning de messages por data
- [ ] Estratégia de microservices (se crescer): Auth Service, Chat Service, Notification Service, Upload Service
- [ ] Estimativas de custo por tier (10K, 50K, 100K users)

**28d — `/docs/why-i-built-this.md`:**
- [ ] Problema real: comunicação em tempo real é complexa e poucos devs dominam
- [ ] Objetivo: demonstrar competência full-stack com WebSocket, não apenas CRUD
- [ ] Arquitetura escolhida e porquê (3 camadas, event-driven, typed sockets)
- [ ] Trade-offs aceitos (sem E2E encryption, sem microservices — over-engineering para escala atual)
- [ ] O que faria diferente com mais tempo (Redis caching, message queues, E2E tests com Playwright)
- [ ] Métricas do projeto: 29 fases, 77 componentes de design system, 20 endpoints, 14 socket events, 37+ testes
- [ ] Lições aprendidas: Prisma 7 CJS compatibility, Express 5 read-only params, React 19 patterns

---

### Fase 29 — README Profissional + Landing Page ⬚

> Primeira coisa que o recrutador vê. TEM que impressionar em 5 segundos.

**29a — README.md Profissional:**
- [ ] Badges: CI status, license MIT, TypeScript, deploy status
- [ ] Descrição impactante (2 linhas) — "Full-stack realtime chat with rooms, typing indicators, read receipts, and more."
- [ ] Hero screenshot (dark mode, com mensagens, typing, unread badges)
- [ ] GIF demonstrando o fluxo: register → create room → send message → real-time update
- [ ] Feature list visual com categorias: Core, Real-time, UX, Infrastructure
- [ ] Tech stack com logos/badges
- [ ] Architecture overview (diagrama simplificado)
- [ ] Quick start: `docker compose up -d` → acesse localhost:3000
- [ ] Performance: Lighthouse scores com screenshot
- [ ] Links: Live Demo, Swagger Docs, Architecture Docs
- [ ] Contributing guide básico
- [ ] License MIT

**29b — Landing Page (nível senior):**
- [ ] Rota `/` — Landing page antes do login (redirect se autenticado)
- [ ] Hero section: título grande + subtítulo + CTA "Comece agora" + screenshot do app
- [ ] Features section: grid de features com ícones e descrições curtas
- [ ] Tech stack section: logos das tecnologias usadas
- [ ] Architecture section: diagrama simplificado
- [ ] CTA final: "Teste agora — sem precisar de conta" (link para demo)
- [ ] Footer com links para GitHub, Swagger, docs
- [ ] Animações: scroll reveal, glassmorphism, gradient text (reutilizar do globals.css)
- [ ] 100% responsiva, dark mode, Lighthouse 95+

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
