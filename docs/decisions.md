# Architecture Decision Records (ADRs)

> Decisões técnicas documentadas com contexto, alternativas consideradas e trade-offs aceitos.
> Seguem o formato: **Contexto → Decisão → Consequências → Alternativas**.

---

## ADR-001: Vite + React em vez de Next.js

**Contexto:**
O projeto é um chat em tempo real. A renderização é 100% client-side — não há SEO, não há conteúdo estático, e todo o estado depende de WebSocket connections que só existem no browser.

**Decisão:**
Usar Vite 7 + React 19 como SPA (Single Page Application).

**Consequências:**
- (+) Build 10x mais rápido que Next.js (Vite HMR < 50ms)
- (+) Bundle menor — sem runtime de SSR, sem hydration overhead
- (+) Configuração mais simples — sem app router, sem server components, sem API routes
- (+) Deploy simplificado — static files no Vercel (sem Edge Functions)
- (-) Sem SSR/SSG (irrelevante para chat)
- (-) Sem Image Optimization nativo (usamos lazy loading manual)

**Alternativas consideradas:**
- **Next.js 15 (App Router):** Over-engineering para SPA. Server components adicionam complexidade sem benefício para chat em tempo real.
- **Remix:** Bom para apps data-driven, mas chat depende de WebSocket, não de loaders/actions.
- **SvelteKit:** Menos ecossistema de componentes UI (Radix, etc).

---

## ADR-002: Express 5 em vez de Fastify

**Contexto:**
O backend precisa servir REST API + Socket.io + file uploads. Precisa de um framework maduro com bom ecossistema de middleware.

**Decisão:**
Usar Express 5 (versão mais recente, com suporte nativo a async/await).

**Consequências:**
- (+) Ecossistema gigante — helmet, cors, multer, swagger-ui-express, etc
- (+) Socket.io tem integração nativa com http.Server do Express
- (+) Qualquer dev Node.js conhece Express — baixa curva de aprendizado
- (+) Express 5 resolve problemas históricos (async error handling, read-only req.params)
- (-) Mais lento que Fastify em benchmarks sintéticos (~15% em req/s)
- (-) Sem schema-based serialization (Fastify serializa JSON 2x mais rápido)

**Alternativas consideradas:**
- **Fastify:** Melhor performance, mas Socket.io integration requer adaptador extra. Schema-based validation duplicaria o Zod que já usamos.
- **Hono:** Ultra-leve, mas ecossistema imaturo para features que precisamos (multer, swagger).
- **tRPC:** Type-safe API excelente, mas requer client tRPC — não é REST puro para demonstração.

---

## ADR-003: Prisma 7 com Adapter Pattern

**Contexto:**
Precisamos de um ORM que ofereça type-safety completa, migrations automáticas e uma API intuitiva para queries complexas (joins, aggregates, transactions).

**Decisão:**
Usar Prisma 7 com `@prisma/adapter-pg` (driver adapter pattern).

**Consequências:**
- (+) Types gerados automaticamente do schema — zero drift entre DB e código
- (+) Migrations versionadas e reversíveis
- (+) Auto-complete em queries (select, include, where) — DX excepcional
- (+) Adapter pattern permite trocar driver sem mudar queries
- (-) Prisma 7 com CJS requer fix manual (`import.meta.url` → CJS equivalent) no Docker
- (-) Overhead vs raw SQL para queries muito complexas (~5-10ms)

**Alternativas consideradas:**
- **Drizzle ORM:** Mais próximo do SQL, melhor performance, mas API menos intuitiva para relacionamentos.
- **Kysely:** Type-safe query builder, mas sem migrations e sem schema-first approach.
- **Raw SQL (pg):** Máxima performance, mas zero type-safety e migrations manuais.

---

## ADR-004: Cursor-based Pagination para Mensagens

**Contexto:**
Mensagens são append-only — sempre crescem. Offset-based pagination tem problemas de performance com milhões de registros (`OFFSET 100000` escaneia 100K rows).

**Decisão:**
Usar cursor-based pagination para histórico de mensagens (e offset-based para listagem de salas).

**Consequências:**
- (+) Performance constante O(1) independente da posição — usa índice `(roomId, createdAt)`
- (+) Sem duplicatas ao paginar enquanto novas mensagens chegam
- (+) Funciona naturalmente com scroll infinito (load more ao chegar no topo)
- (-) Não permite "pular para página 5" (desnecessário em chat)
- (-) Mais complexo de implementar que offset

**Alternativas consideradas:**
- **Offset-based:** Simples, mas `OFFSET` grande é lento e mensagens novas causam duplicatas.
- **Keyset pagination com ID:** Funciona, mas UUID v4 não é ordenado cronologicamente.

---

## ADR-005: Zustand em vez de Redux

**Contexto:**
O app precisa de estado global para: autenticação (user, token), sala selecionada, contagens de não lidas, e preferências (som).

**Decisão:**
Usar Zustand com stores pequenas e focadas (auth, room, notification).

**Consequências:**
- (+) Zero boilerplate — sem actions, reducers, selectors, providers
- (+) Cada store é independente e testável com `getState()`
- (+) Seletores granulares previnem re-renders (`useAuthStore(s => s.user)`)
- (+) ~1KB gzipped (Redux Toolkit = ~12KB)
- (-) Sem Redux DevTools out-of-box (tem plugin, mas não é nativo)
- (-) Para apps muito grandes, a falta de structure pode virar problema

**Alternativas consideradas:**
- **Redux Toolkit:** Padrão da indústria, mas boilerplate excessivo para 3 stores simples.
- **Jotai:** Atomic state, mas granularidade excessiva para nosso caso.
- **React Context:** Sem otimização de re-renders — todo consumer re-renderiza em qualquer mudança.

---

## ADR-006: Socket.io em vez de Raw WebSocket

**Contexto:**
Chat em tempo real requer comunicação bidirecional persistente. Precisamos de: auto-reconnect, rooms (broadcasting), acknowledgements, e fallback para polling.

**Decisão:**
Usar Socket.io (server + client) com eventos tipados.

**Consequências:**
- (+) Auto-reconnect com exponential backoff built-in
- (+) Rooms nativas — broadcast para membros de uma sala sem lógica manual
- (+) Acknowledgements — confirmar que mensagem foi recebida pelo server
- (+) Fallback para HTTP long-polling se WebSocket bloqueado (corporate firewalls)
- (+) Namespace e middleware (autenticação JWT no handshake)
- (-) Overhead de protocolo vs raw WS (~2KB header extra por mensagem)
- (-) Não é padrão web — client precisa de socket.io-client (não funciona com WS puro)

**Alternativas consideradas:**
- **Raw WebSocket (ws):** Padrão web, menor overhead, mas sem rooms, sem reconnect, sem ACK.
- **Server-Sent Events (SSE):** Unidirecional — server→client apenas. Não serve para chat.
- **WebRTC:** Peer-to-peer, bom para vídeo/voz, over-engineering para chat de texto.

---

## ADR-007: Monorepo simples em vez de Turborepo

**Contexto:**
O projeto tem 2 packages (client + server) com dependencies compartilhadas (ESLint, Prettier) na raiz.

**Decisão:**
Monorepo simples com npm workspaces implícitos (sem ferramenta de monorepo).

**Consequências:**
- (+) Zero configuração extra — `npm install` na raiz resolve tudo
- (+) Sem dependency hell de workspace protocols
- (+) CI simples — scripts rodam direto sem task runner
- (-) Sem cache de builds entre packages (irrelevante para 2 packages)
- (-) Sem task orchestration paralela (fazemos manualmente no CI)

**Alternativas consideradas:**
- **Turborepo:** Cache de builds, task DAG, mas overhead de configuração para apenas 2 packages.
- **Nx:** Muito poderoso, mas complexidade desproporcional para o tamanho do projeto.
- **pnpm workspaces:** Melhor disk usage, mas npm é mais universal para demonstração.

---

## ADR-008: Por que NÃO implementamos End-to-End Encryption (E2E)

**Contexto:**
Em aplicações de chat em produção (WhatsApp, Signal, Telegram), a criptografia ponta-a-ponta garante que nem o servidor, nem administradores, consigam ler o conteúdo das mensagens. Apenas o remetente e o destinatário possuem as chaves de descriptografia.

**Como E2E funcionaria neste projeto:**

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ User A  │                    │  Server  │                    │ User B  │
│ Browser │                    │ (Express)│                    │ Browser │
└────┬────┘                    └────┬─────┘                    └────┬────┘
     │                              │                               │
     │  1. Gerar par de chaves      │   1. Gerar par de chaves      │
     │     (ECDH P-256)             │      (ECDH P-256)             │
     │     Private: fica local      │      Private: fica local      │
     │     Public: envia ao server  │      Public: envia ao server  │
     │                              │                               │
     │  2. Pegar public key do B ───┤──── 2. Pegar public key do A  │
     │                              │                               │
     │  3. Derivar shared secret    │   3. Derivar shared secret    │
     │     (ECDH: A.priv + B.pub)   │      (ECDH: B.priv + A.pub)  │
     │                              │                               │
     │  4. Encrypt com AES-GCM ────►│                               │
     │     "Olá" → "U2FsdGVk..."    │   4. Decrypt com AES-GCM     │
     │                              │──────► "U2FsdGVk..." → "Olá"  │
     │                              │                               │
     │  Server vê APENAS:           │                               │
     │  "U2FsdGVkX1+7x9z3Kp..."    │                               │
```

**Tecnologias necessárias:**
- **Web Crypto API** (`crypto.subtle`) — nativa do browser, sem dependências
- **ECDH (Elliptic Curve Diffie-Hellman)** — troca de chaves segura
- **AES-256-GCM** — criptografia simétrica com authentication tag
- **Signal Protocol** — para Perfect Forward Secrecy em grupos (Double Ratchet algorithm)

**Complexidades de implementação real:**
1. **Troca de chaves em grupo:** Cada membro precisa de uma session key compartilhada. Ao adicionar/remover membros, todas as chaves precisam ser rotacionadas.
2. **Multi-device:** A chave privada precisa ser sincronizada entre dispositivos do mesmo usuário (ou cada device tem seu par de chaves, como o Signal faz).
3. **Persistência de chaves:** localStorage pode ser limpo — precisa de backup encriptado das chaves.
4. **Busca impossível:** O servidor não consegue buscar no conteúdo das mensagens (campo `content` é texto cifrado).
5. **Preview de notificações:** Não é possível mostrar preview da mensagem em push notifications sem descriptografar no device.
6. **Histórico ao trocar de device:** Mensagens antigas não podem ser lidas sem as chaves antigas.

**Decisão:**
NÃO implementar E2E encryption neste projeto.

**Justificativa:**
O objetivo principal deste projeto é **demonstrar competência em arquitetura backend** (3 camadas, REST API, WebSocket, autenticação JWT, Prisma ORM) e **consumo de APIs** (React Query, Zustand, Socket.io client). E2E encryption é uma feature de **segurança de produto** que requer semanas de implementação correta e auditoria criptográfica — e se implementada incorretamente, dá uma falsa sensação de segurança.

**Consequências:**
- (+) Foco mantido na arquitetura e patterns que demonstram senioridade
- (+) Busca de mensagens funciona normalmente (server pode indexar e filtrar)
- (+) Notificações com preview funcionam
- (+) Histórico de mensagens acessível em qualquer device após login
- (-) Admin com acesso ao banco pode ler mensagens
- (-) Não adequado para comunicação sensível (médico-paciente, financeiro)

**O que faríamos com mais tempo:**
1. Implementar E2E para chats 1:1 usando Web Crypto API (ECDH + AES-GCM)
2. Para grupos, usar Sender Keys (como o Signal Protocol faz)
3. Indicador visual de "cadeado" em conversas encriptadas
4. Verificação de identidade via QR code (key fingerprint comparison)
5. Backup encriptado de chaves no servidor (encrypted with user's password)

---

## ADR-009: JWT Access + Refresh Token Strategy

**Contexto:**
Precisamos de autenticação stateless que funcione tanto em REST API quanto em WebSocket handshake, com capacidade de renovação sem forçar re-login.

**Decisão:**
JWT access token (15min, header Authorization) + refresh token (7 dias, httpOnly cookie).

**Consequências:**
- (+) Stateless — server não precisa consultar DB a cada request
- (+) Access token curto (15min) limita janela de ataque se vazado
- (+) Refresh token em httpOnly cookie — inacessível a JavaScript (previne XSS)
- (+) SameSite=Strict previne CSRF
- (+) Funciona no WebSocket handshake (access token via `auth.token`)
- (-) Não é possível invalidar um access token antes da expiração (sem blacklist)
- (-) Refresh token rotation não implementada (simplificação)

**Alternativas consideradas:**
- **Session-based (express-session + Redis):** Stateful, requer Redis, mas permite invalidação imediata.
- **OAuth 2.0 / OpenID Connect:** Over-engineering para auth própria. Útil se integrássemos Google/GitHub login.
- **Paseto:** Mais seguro que JWT (sem algorithm confusion), mas ecossistema menor.
