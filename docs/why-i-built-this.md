# Why I Built This

> The technical reflection behind the project ·what I wanted to demonstrate, which trade-offs I accepted, and what I learned.

---

## The Motivation

I wanted to build something that goes deeper than standard CRUD · a project where the interesting engineering happens at runtime, not just at the database layer.

Real-time chat was the right fit because it combines several non-trivial challenges in one system:

- **WebSocket** ·persistent bidirectional communication, not request-response
- **Event-driven architecture** ·event handlers, broadcasts, rooms
- **Concurrent state** ·multiple users modifying data simultaneously
- **Optimistic UI** ·showing results before server confirmation
- **Resilience** ·reconnection, inconsistent state, race conditions

Each of these required deliberate architectural decisions · and putting them all together in a single production-ready app is where the real complexity lives.

---

## What I Wanted to Learn & Demonstrate

### 1. 3-Layer Backend Architecture
```
Controller → Service → Repository
```
Each layer has a clear responsibility:
- **Controller:** Handles HTTP · extracts request data, formats responses. No business logic.
- **Service:** Contains business logic · testable without HTTP context.
- **Repository:** Single access point to the database · typed Prisma queries.

This separation made debugging much easier. When something breaks, the layer tells you where to look: validation issue → controller, wrong rule → service, slow query → repository.

### 2. End-to-End Type Safety
```
Prisma Schema → Generated Types → Service Types → API Response → Frontend Types
```
From database to React component, the entire chain is typed. When the Prisma schema changes, the TypeScript compiler points to every place that needs updating. This saved me from a lot of runtime bugs during development.

### 3. Real-time Event Architecture
```
Socket.io Events: 32 typed events
├── Authentication on handshake (JWT)
├── Rooms (join, leave, members)
├── Messages (send, receive, history, edit, delete)
├── Typing indicators (start, stop)
├── Read receipts (✓✓)
├── Online status (presence)
├── Reactions (toggle emoji)
├── Voice messages (send, receive)
├── Friendships (request, accept, remove)
├── Events (create, invite, RSVP)
├── Pinned messages (pin, unpin)
└── Notifications (unread, sound, toast)
```
Each event has payload types defined in `types/socket.ts`. The server and client share the same event interface.

### 4. Reusable Design System
40+ components adapted from my Pulse design system (originally built for Next.js). Porting them to React/Vite taught me a lot about keeping components framework-agnostic · and reinforced patterns like compound components, CVA for variants, and composition over inheritance.

### 5. Complete DevOps
- Docker Compose with 5 orchestrated services
- CI/CD with GitHub Actions (lint → typecheck → test → build)
- Automated deployment (Cloudflare Workers + Railway)
- Health check endpoint with dependency status

---

## Trade-offs I Consciously Accepted

| Decision | Trade-off | Justification |
|---|---|---|
| **No E2E encryption** | Admin can read messages | Focus is architecture, not cryptography. Documented in `/docs/decisions.md` |
| **No Redis** | In-memory cache and pub/sub | For < 500 users, Redis is overhead. Scaling plan documented in `/docs/scaling.md` |
| **No microservices** | Monolith | For 1 developer, modular monolith (3 layers) is 10x more productive |
| **Uploads on disk** | Doesn't persist between Railway deploys | For demo. In production: S3/R2 |
| **No E2E tests** | Coverage limited to unit tests | Playwright would be the next step. 98 tests cover the critical logic |
| **No per-user WebSocket rate limiting** | Possible spam | In-memory rate limiting implemented per event type |

---

## What I Would Do Differently with More Time

1. **Redis for cache + pub/sub** ·horizontal WebSocket scaling with `@socket.io/redis-adapter`
2. **E2E tests with Playwright** ·complete flows: register → create room → send message → receive
3. **Message queue (BullMQ)** ·process push notifications and emails asynchronously
4. **Storybook** ·interactive visual documentation of the 40+ components
5. **E2E encryption** ·Web Crypto API for 1:1 chats (ECDH + AES-GCM)
6. **Image optimization** ·thumbnails generated on upload, lazy loading with blur placeholder
7. **Internationalization (i18n)** ·multi-language support with react-intl

---

## Project Metrics

| Metric | Value |
|---|---|
| UI Components (Pulse Design System) | 40+ |
| REST API endpoints | 28 |
| Socket.io events | 32 |
| Prisma models | 10 |
| Middleware | 9 |
| Automated tests | 98 |
| Zustand stores | 3 |
| Custom hooks | 17 |
| Docker services | 5 |

---

## Lessons Learned

### Prisma 7 + CJS Compatibility
Prisma 7 generates code with `import.meta.url` that doesn't work in CommonJS. In Docker, I needed `sed` post-build to replace it with a CJS equivalent. **Lesson:** always test the build in a container before deploying.

### Express 5 Read-Only Params
Express 5 changed `req.params` and `req.query` to read-only. Data validated by Zod cannot be reassigned to the request. **Solution:** use `res.locals.validated` to pass validated data from middleware to controller.

### React 19 + Zustand
React 19 Strict Mode renders components twice in dev. With Zustand, it's safe because stores are external to the React tree. But `setState` inside `useEffect` causes warnings ·I used the "adjust state during render" pattern.

### Socket.io + Multiple Tabs
A single user can have multiple tabs open (= multiple sockets). The "ONLINE" status needs to consider `userSockets.size > 0`, not just an individual socket. Only mark as OFFLINE when the **last** tab closes.

### Cross-Framework Design System
Adapting components from Next.js to React/Vite required: removing `next/image`, `next/link`, `next-themes`, and replacing them with native equivalents. **Lesson:** design systems should be framework-agnostic ·depending on framework features couples the components.

---

## Full Tech Stack

**Frontend:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4 · Radix UI · React Query · Zustand · Socket.io Client · React Hook Form + Zod

**Backend:** Node.js 22 · Express 5 · TypeScript 5.9 · Prisma 7 · PostgreSQL 16 · Socket.io · JWT · Multer · Swagger

**DevOps:** Docker · Docker Compose · GitHub Actions · Cloudflare Workers · Railway · Nginx

**Testing:** Vitest · React Testing Library · 98 unit tests across 6 service test suites
