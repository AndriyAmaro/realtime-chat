# Architecture Decision Records (ADRs)

> Documented technical decisions with context, alternatives considered, and accepted trade-offs.
> Following the format: **Context → Decision → Consequences → Alternatives**.

---

## ADR-001: Vite + React Instead of Next.js

**Context:**
The project is a real-time chat application. Rendering is 100% client-side — there's no SEO, no static content, and all state depends on WebSocket connections that only exist in the browser.

**Decision:**
Use Vite 7 + React 19 as a SPA (Single Page Application).

**Consequences:**
- (+) Build 10x faster than Next.js (Vite HMR < 50ms)
- (+) Smaller bundle — no SSR runtime, no hydration overhead
- (+) Simpler configuration — no app router, no server components, no API routes
- (+) Simplified deployment — static files on Vercel (no Edge Functions)
- (-) No SSR/SSG (irrelevant for chat)
- (-) No native Image Optimization (we use manual lazy loading)

**Alternatives considered:**
- **Next.js 15 (App Router):** Over-engineering for a SPA. Server components add complexity with no benefit for real-time chat.
- **Remix:** Good for data-driven apps, but chat depends on WebSocket, not loaders/actions.
- **SvelteKit:** Smaller ecosystem of UI components (Radix, etc).

---

## ADR-002: Express 5 Instead of Fastify

**Context:**
The backend needs to serve REST API + Socket.io + file uploads. It requires a mature framework with a robust middleware ecosystem.

**Decision:**
Use Express 5 (latest version, with native async/await support).

**Consequences:**
- (+) Huge ecosystem — helmet, cors, multer, swagger-ui-express, etc
- (+) Socket.io has native integration with Express's http.Server
- (+) Any Node.js developer knows Express — low learning curve
- (+) Express 5 solves historical issues (async error handling, read-only req.params)
- (-) Slower than Fastify in synthetic benchmarks (~15% in req/s)
- (-) No schema-based serialization (Fastify serializes JSON 2x faster)

**Alternatives considered:**
- **Fastify:** Better performance, but Socket.io integration requires an extra adapter. Schema-based validation would duplicate the Zod we already use.
- **Hono:** Ultra-lightweight, but immature ecosystem for features we need (multer, swagger).
- **tRPC:** Excellent type-safe API, but requires tRPC client — not pure REST for demonstration purposes.

---

## ADR-003: Prisma 7 with Adapter Pattern

**Context:**
We need an ORM that offers complete type-safety, automatic migrations, and an intuitive API for complex queries (joins, aggregates, transactions).

**Decision:**
Use Prisma 7 with `@prisma/adapter-pg` (driver adapter pattern).

**Consequences:**
- (+) Types automatically generated from schema — zero drift between DB and code
- (+) Versioned and reversible migrations
- (+) Auto-complete in queries (select, include, where) — exceptional DX
- (+) Adapter pattern allows swapping drivers without changing queries
- (-) Prisma 7 with CJS requires manual fix (`import.meta.url` → CJS equivalent) in Docker
- (-) Overhead vs raw SQL for very complex queries (~5-10ms)

**Alternatives considered:**
- **Drizzle ORM:** Closer to SQL, better performance, but less intuitive API for relationships.
- **Kysely:** Type-safe query builder, but no migrations and no schema-first approach.
- **Raw SQL (pg):** Maximum performance, but zero type-safety and manual migrations.

---

## ADR-004: Cursor-based Pagination for Messages

**Context:**
Messages are append-only — they always grow. Offset-based pagination has performance issues with millions of records (`OFFSET 100000` scans 100K rows).

**Decision:**
Use cursor-based pagination for message history (and offset-based for room listings).

**Consequences:**
- (+) Constant O(1) performance regardless of position — uses `(roomId, createdAt)` index
- (+) No duplicates when paginating while new messages arrive
- (+) Works naturally with infinite scroll (load more when reaching the top)
- (-) Cannot "jump to page 5" (unnecessary in chat)
- (-) More complex to implement than offset

**Alternatives considered:**
- **Offset-based:** Simple, but large `OFFSET` is slow and new messages cause duplicates.
- **Keyset pagination with ID:** Works, but UUID v4 is not chronologically ordered.

---

## ADR-005: Zustand Instead of Redux

**Context:**
The app needs global state for: authentication (user, token), selected room, unread counts, and preferences (sound).

**Decision:**
Use Zustand with small, focused stores (auth, room, notification).

**Consequences:**
- (+) Zero boilerplate — no actions, reducers, selectors, providers
- (+) Each store is independent and testable with `getState()`
- (+) Granular selectors prevent re-renders (`useAuthStore(s => s.user)`)
- (+) ~1KB gzipped (Redux Toolkit = ~12KB)
- (-) No Redux DevTools out-of-box (plugin available, but not native)
- (-) For very large apps, the lack of structure could become an issue

**Alternatives considered:**
- **Redux Toolkit:** Industry standard, but excessive boilerplate for 3 simple stores.
- **Jotai:** Atomic state, but excessive granularity for our use case.
- **React Context:** No re-render optimization — every consumer re-renders on any change.

---

## ADR-006: Socket.io Instead of Raw WebSocket

**Context:**
Real-time chat requires persistent bidirectional communication. We need: auto-reconnect, rooms (broadcasting), acknowledgements, and fallback to polling.

**Decision:**
Use Socket.io (server + client) with typed events.

**Consequences:**
- (+) Auto-reconnect with built-in exponential backoff
- (+) Native rooms — broadcast to room members without manual logic
- (+) Acknowledgements — confirm that message was received by the server
- (+) Fallback to HTTP long-polling if WebSocket is blocked (corporate firewalls)
- (+) Namespace and middleware (JWT authentication on handshake)
- (-) Protocol overhead vs raw WS (~2KB extra header per message)
- (-) Not a web standard — client requires socket.io-client (doesn't work with pure WS)

**Alternatives considered:**
- **Raw WebSocket (ws):** Web standard, less overhead, but no rooms, no reconnect, no ACK.
- **Server-Sent Events (SSE):** Unidirectional — server→client only. Not suitable for chat.
- **WebRTC:** Peer-to-peer, good for video/voice, over-engineering for text chat.

---

## ADR-007: Simple Monorepo Instead of Turborepo

**Context:**
The project has 2 packages (client + server) with shared dependencies (ESLint, Prettier) at the root.

**Decision:**
Simple monorepo with implicit npm workspaces (no monorepo tooling).

**Consequences:**
- (+) Zero extra configuration — `npm install` at root resolves everything
- (+) No dependency hell from workspace protocols
- (+) Simple CI — scripts run directly without a task runner
- (-) No build caching between packages (irrelevant for 2 packages)
- (-) No parallel task orchestration (done manually in CI)

**Alternatives considered:**
- **Turborepo:** Build caching, task DAG, but configuration overhead for just 2 packages.
- **Nx:** Very powerful, but disproportionate complexity for the project size.
- **pnpm workspaces:** Better disk usage, but npm is more universal for demonstration purposes.

---

## ADR-008: Why We Did NOT Implement End-to-End Encryption (E2E)

**Context:**
In production chat applications (WhatsApp, Signal, Telegram), end-to-end encryption ensures that neither the server nor administrators can read message content. Only the sender and recipient hold the decryption keys.

**How E2E would work in this project:**

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ User A  │                    │  Server  │                    │ User B  │
│ Browser │                    │ (Express)│                    │ Browser │
└────┬────┘                    └────┬─────┘                    └────┬────┘
     │                              │                               │
     │  1. Generate key pair        │   1. Generate key pair        │
     │     (ECDH P-256)             │      (ECDH P-256)             │
     │     Private: stays local     │      Private: stays local     │
     │     Public: sent to server   │      Public: sent to server   │
     │                              │                               │
     │  2. Get B's public key ──────┤──── 2. Get A's public key     │
     │                              │                               │
     │  3. Derive shared secret     │   3. Derive shared secret     │
     │     (ECDH: A.priv + B.pub)   │      (ECDH: B.priv + A.pub)  │
     │                              │                               │
     │  4. Encrypt with AES-GCM ───►│                               │
     │     "Hello" → "U2FsdGVk..."  │   4. Decrypt with AES-GCM    │
     │                              │──────► "U2FsdGVk..." → "Hello"│
     │                              │                               │
     │  Server sees ONLY:           │                               │
     │  "U2FsdGVkX1+7x9z3Kp..."    │                               │
```

**Technologies required:**
- **Web Crypto API** (`crypto.subtle`) — browser-native, no dependencies
- **ECDH (Elliptic Curve Diffie-Hellman)** — secure key exchange
- **AES-256-GCM** — symmetric encryption with authentication tag
- **Signal Protocol** — for Perfect Forward Secrecy in groups (Double Ratchet algorithm)

**Real implementation complexities:**
1. **Group key exchange:** Each member needs a shared session key. When adding/removing members, all keys need to be rotated.
2. **Multi-device:** The private key needs to be synced across user devices (or each device has its own key pair, as Signal does).
3. **Key persistence:** localStorage can be cleared — needs encrypted key backup.
4. **Search impossible:** The server cannot search message content (the `content` field is ciphertext).
5. **Notification preview:** Cannot show message preview in push notifications without decrypting on device.
6. **History on device switch:** Old messages cannot be read without the old keys.

**Decision:**
Do NOT implement E2E encryption in this project.

**Justification:**
The primary goal of this project is to **demonstrate competence in backend architecture** (3 layers, REST API, WebSocket, JWT authentication, Prisma ORM) and **API consumption** (React Query, Zustand, Socket.io client). E2E encryption is a **product security feature** that requires weeks of correct implementation and cryptographic auditing — and if implemented incorrectly, it gives a false sense of security.

**Consequences:**
- (+) Focus maintained on architecture and patterns that demonstrate seniority
- (+) Message search works normally (server can index and filter)
- (+) Notifications with preview work
- (+) Message history accessible on any device after login
- (-) Admin with database access can read messages
- (-) Not suitable for sensitive communication (doctor-patient, financial)

**What we would do with more time:**
1. Implement E2E for 1:1 chats using Web Crypto API (ECDH + AES-GCM)
2. For groups, use Sender Keys (as the Signal Protocol does)
3. Visual "lock" indicator for encrypted conversations
4. Identity verification via QR code (key fingerprint comparison)
5. Encrypted key backup on server (encrypted with user's password)

---

## ADR-009: JWT Access + Refresh Token Strategy

**Context:**
We need stateless authentication that works for both REST API and WebSocket handshake, with renewal capability without forcing re-login.

**Decision:**
JWT access token (15min, Authorization header) + refresh token (7 days, httpOnly cookie).

**Consequences:**
- (+) Stateless — server doesn't need to query DB on every request
- (+) Short access token (15min) limits attack window if leaked
- (+) Refresh token in httpOnly cookie — inaccessible to JavaScript (prevents XSS)
- (+) SameSite=Strict prevents CSRF
- (+) Works in WebSocket handshake (access token via `auth.token`)
- (-) Cannot invalidate an access token before expiration (without blacklist)
- (-) Refresh token rotation not implemented (simplification)

**Alternatives considered:**
- **Session-based (express-session + Redis):** Stateful, requires Redis, but allows immediate invalidation.
- **OAuth 2.0 / OpenID Connect:** Over-engineering for custom auth. Useful if integrating Google/GitHub login.
- **Paseto:** More secure than JWT (no algorithm confusion), but smaller ecosystem.
