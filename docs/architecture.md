# Architecture Overview

> Visão técnica da arquitetura do Realtime Chat — como os componentes se conectam e por quê.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐            │
│  │   Browser 1  │   │   Browser 2  │   │   Mobile     │            │
│  │  (React SPA) │   │  (React SPA) │   │  (Future)    │            │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘            │
│         │                  │                   │                     │
│         └──────────────────┼───────────────────┘                     │
│                            │                                         │
│              ┌─────────────┴─────────────┐                          │
│              │  HTTPS + WSS (encrypted)  │                          │
│              └─────────────┬─────────────┘                          │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│  VERCEL (CDN)              │                                         │
│  ┌─────────────────────────┴─────────────────────────────┐          │
│  │  Static Files (HTML, CSS, JS)                         │          │
│  │  SPA Rewrite: /* → /index.html                        │          │
│  │  Assets: immutable cache (1 year)                     │          │
│  └───────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────┘
                             │
                   API calls │ /api/v1/*
                   WebSocket │ /socket.io/*
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│  RAILWAY                   │                                         │
│  ┌─────────────────────────┴─────────────────────────────┐          │
│  │  Express 5 Server (Node.js 22)                        │          │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │          │
│  │  │  REST API   │  │  Socket.io   │  │  Static     │  │          │
│  │  │  22 routes  │  │  18 events   │  │  /uploads   │  │          │
│  │  └──────┬──────┘  └──────┬───────┘  └─────────────┘  │          │
│  │         │                │                            │          │
│  │  ┌──────┴────────────────┴──────────────────┐         │          │
│  │  │          Business Logic Layer            │         │          │
│  │  │  Controllers → Services → Repositories   │         │          │
│  │  └──────────────────┬───────────────────────┘         │          │
│  │                     │                                  │          │
│  │  ┌──────────────────┴───────────────────────┐         │          │
│  │  │  Prisma 7 ORM (Type-safe queries)        │         │          │
│  │  └──────────────────┬───────────────────────┘         │          │
│  └─────────────────────┼─────────────────────────────────┘          │
│                        │                                             │
│  ┌─────────────────────┴─────────────────────────────────┐          │
│  │  PostgreSQL 16 (Managed)                              │          │
│  │  Private network: postgres.railway.internal:5432      │          │
│  │  4 tables, 3 enums, 5 indexes                         │          │
│  └───────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture (3-Layer)

```
HTTP Request / Socket Event
         │
         ▼
┌─────────────────────────────────────────────────┐
│  MIDDLEWARE LAYER                                │
│  auth.ts → validate.ts → rateLimiter.ts         │
│  socketAuth.ts (JWT verification on handshake)  │
│  errorHandler.ts (centralized error formatting) │
│  requestLogger.ts (Morgan HTTP logging)         │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  CONTROLLER LAYER (Routes + Controllers)        │
│  - Extrair dados do request (body, params)      │
│  - Chamar o service adequado                    │
│  - Formatar response (status code + JSON)       │
│  - ZERO lógica de negócio                       │
│                                                 │
│  auth.controller.ts  → 7 handlers              │
│  room.controller.ts  → 13 handlers             │
│  upload.controller.ts → 1 handler               │
│  message.controller.ts → 1 handler              │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  SERVICE LAYER                                  │
│  - TODA lógica de negócio vive aqui             │
│  - Validações de permissão                      │
│  - Orquestração de operações                    │
│  - Testável sem HTTP (unit tests puros)         │
│                                                 │
│  auth.service.ts    → register, login, profile  │
│  room.service.ts    → CRUD, join, leave, roles  │
│  message.service.ts → send, history, search     │
│  upload.service.ts  → multer config, file types │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  REPOSITORY LAYER                               │
│  - ÚNICO ponto de acesso ao banco               │
│  - Queries Prisma tipadas                       │
│  - Retorna dados puros (sem formatação HTTP)    │
│                                                 │
│  user.repository.ts    → findByEmail, create..  │
│  room.repository.ts    → CRUD + memberships     │
│  message.repository.ts → create, findByRoom..   │
│  roomMember.repository → join, leave, roles     │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
               ┌───────────────┐
               │  PostgreSQL   │
               │  (via Prisma) │
               └───────────────┘
```

---

## Real-time Message Flow

```
User A types "Hello" and hits Enter
         │
         ▼
┌─ Client A (Browser) ──────────────────────────┐
│  1. ChatArea calls sendMessage("Hello")       │
│  2. useMessages hook emits socket event:      │
│     socket.emit("message:send", {             │
│       roomId: "abc-123",                      │
│       content: "Hello",                       │
│       type: "TEXT"                             │
│     }, callback)                              │
│  3. Message appears instantly (optimistic)    │
└───────────────────────┬───────────────────────┘
                        │ WebSocket
                        ▼
┌─ Server (Express + Socket.io) ────────────────┐
│  4. message.handler receives "message:send"   │
│  5. messageService.send() validates:          │
│     - User is member of room ✓               │
│     - Content is not empty ✓                 │
│  6. messageRepository.create() persists to DB │
│  7. ACK callback sent to User A (confirmed)  │
│  8. io.to("room:abc-123").emit("message:new", │
│     { id, content, user, createdAt })         │
└───────────────┬───────────────────────────────┘
                │ Broadcast to all room members
                ▼
┌─ Client B (Browser) ──────────────────────────┐
│  9. useMessages hook receives "message:new"   │
│  10. Message added to local state             │
│  11. Auto-scroll if near bottom               │
│  12. If room not active:                      │
│      - useNotifications increments unread     │
│      - Toast notification shown               │
│      - Sound played (if enabled)              │
└───────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─ Register/Login ──────────────────────────────┐
│                                                │
│  Client                    Server              │
│    │                         │                 │
│    │  POST /auth/login       │                 │
│    │  { email, password }    │                 │
│    │────────────────────────►│                 │
│    │                         │                 │
│    │                    bcrypt.compare()        │
│    │                    generateAccessToken()   │
│    │                    generateRefreshToken()  │
│    │                         │                 │
│    │  200 OK                 │                 │
│    │  { user, accessToken }  │                 │
│    │  Set-Cookie: refresh_token (httpOnly)      │
│    │◄────────────────────────│                 │
│    │                         │                 │
│    │  Store in Zustand:      │                 │
│    │  auth.setAuth(user, token)                │
│    │                         │                 │
└────┼─────────────────────────┼─────────────────┘
     │                         │
┌─ Authenticated Request ──────┼─────────────────┐
│    │                         │                 │
│    │  GET /auth/me           │                 │
│    │  Authorization: Bearer {accessToken}      │
│    │────────────────────────►│                 │
│    │                    jwt.verify()            │
│    │                    req.user = payload      │
│    │  200 OK { user }        │                 │
│    │◄────────────────────────│                 │
│    │                         │                 │
└────┼─────────────────────────┼─────────────────┘
     │                         │
┌─ Token Refresh (auto) ───────┼─────────────────┐
│    │                         │                 │
│    │  GET /auth/me → 401     │                 │
│    │◄────────────────────────│                 │
│    │                         │                 │
│    │  POST /auth/refresh-token                 │
│    │  Cookie: refresh_token  │                 │
│    │────────────────────────►│                 │
│    │                    verifyRefreshToken()    │
│    │                    generateTokenPair()     │
│    │                         │                 │
│    │  200 OK { accessToken } │                 │
│    │  Set-Cookie: new refresh_token            │
│    │◄────────────────────────│                 │
│    │                         │                 │
│    │  Retry original request │                 │
│    │  with new accessToken   │                 │
│    │────────────────────────►│                 │
│    │                         │                 │
└────┴─────────────────────────┴─────────────────┘
```

---

## Frontend Architecture

```
┌─ React 19 + Vite 7 ──────────────────────────────────────┐
│                                                           │
│  ┌─ State Management ──────────────────────────────────┐ │
│  │                                                      │ │
│  │  Server State          Client State                  │ │
│  │  ┌──────────────┐     ┌──────────────────┐          │ │
│  │  │ React Query  │     │ Zustand Stores   │          │ │
│  │  │              │     │                  │          │ │
│  │  │ • useMyRooms │     │ • auth.store     │          │ │
│  │  │ • useRoom    │     │   (user, token)  │          │ │
│  │  │ • mutations  │     │ • room.store     │          │ │
│  │  │ • cache      │     │   (selectedRoom) │          │ │
│  │  │ • staleTime  │     │ • notification   │          │ │
│  │  └──────────────┘     │   (unreads,sound)│          │ │
│  │                        └──────────────────┘          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ Real-time Layer ────────────────────────────────────┐ │
│  │  useSocket()        → connection + auth              │ │
│  │  useMessages()      → send, receive, history         │ │
│  │  useTyping()        → typing indicators              │ │
│  │  useOnlineStatus()  → user presence                  │ │
│  │  useReadReceipts()  → read indicators (✓✓)           │ │
│  │  useNotifications() → unread counts, sounds, toasts  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ UI Layer (Pulse Design System) ─────────────────────┐ │
│  │  40+ reusable components across 4 categories:        │ │
│  │  Primitives │ Organisms │ Patterns │ Layouts          │ │
│  │  (Avatar,   │ (Modal,   │ (Toast,  │ (Sidebar,       │ │
│  │   Button,   │  Form,    │  Tabs,   │  Header,        │ │
│  │   Input...) │  Card...) │  Chat..) │  Main)          │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## Database Schema

```
┌──────────────────┐     ┌──────────────────┐
│      users       │     │      rooms       │
├──────────────────┤     ├──────────────────┤
│ id        (PK)   │◄────│ owner_id  (FK)   │
│ email     (UQ)   │     │ id        (PK)   │
│ password         │     │ name             │
│ name             │     │ description      │
│ avatar           │     │ is_private       │
│ status (enum)    │     │ invite_code (UQ) │
│ created_at       │     │ created_at       │
│ updated_at       │     │ updated_at       │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │    ┌───────────────────┘
         │    │
         ▼    ▼
┌──────────────────┐
│  room_members    │
├──────────────────┤
│ id        (PK)   │
│ user_id   (FK)   │──► users.id
│ room_id   (FK)   │──► rooms.id
│ role (enum)      │    ADMIN | MEMBER
│ joined_at        │
│ last_read_at     │    (for read receipts)
│                  │
│ @@unique(user_id,│
│          room_id)│
└──────────────────┘
         │
         │
         ▼
┌──────────────────┐
│    messages      │
├──────────────────┤
│ id        (PK)   │
│ content          │
│ type (enum)      │    TEXT | IMAGE | FILE
│ file_url         │
│ is_read          │
│ user_id   (FK)   │──► users.id
│ room_id   (FK)   │──► rooms.id
│ created_at       │
│                  │
│ @@index(room_id, │    (cursor pagination)
│     created_at)  │
│ @@index(user_id) │
└──────────────────┘

Enums:
  Status      → ONLINE | OFFLINE | AWAY
  Role        → ADMIN | MEMBER
  MessageType → TEXT | IMAGE | FILE
```

---

## File Structure

```
realtime-chat/
├── client/                          # Frontend (React 19 + Vite 7)
│   ├── src/
│   │   ├── core/                    # Pulse Design System (40+ components)
│   │   │   ├── primitives/          # Avatar, Button, Input, Badge...
│   │   │   ├── organisms/           # Modal, Form, Card, Drawer...
│   │   │   ├── patterns/            # Toast, Tabs, SearchBar, ChatUI...
│   │   │   └── layouts/             # Sidebar, Header, MainContent
│   │   ├── pages/
│   │   │   ├── auth/                # LoginPage, RegisterPage
│   │   │   └── chat/                # ChatLayout, RoomSidebar, RoomView,
│   │   │                            # ProfileModal, CreateRoomModal...
│   │   ├── hooks/                   # useSocket, useMessages, useTyping...
│   │   ├── services/                # api.ts, auth.service, room.service...
│   │   ├── store/                   # auth.store, room.store, notification.store
│   │   └── types/                   # room.ts, shared types
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                          # Backend (Express 5 + TypeScript)
│   ├── src/
│   │   ├── config/                  # env.ts, database.ts, socket.ts, swagger.ts
│   │   ├── controllers/             # auth, room, message, upload controllers
│   │   ├── services/                # auth, room, message, upload services
│   │   ├── repositories/            # user, room, roomMember, message repos
│   │   ├── routes/                  # auth, room, message, upload, health routes
│   │   ├── events/                  # Socket.io event handlers
│   │   ├── middleware/              # auth, validate, rateLimiter, errorHandler...
│   │   ├── errors/                  # AppError, AuthError, NotFoundError...
│   │   ├── types/                   # api.ts, auth.ts, room.ts, socket.ts
│   │   ├── utils/                   # jwt.ts
│   │   └── app.ts                   # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── migrations/              # Versioned migrations
│   │   └── seed.ts                  # Demo data
│   └── tsconfig.json
│
├── docs/                            # Architecture documentation
│   ├── architecture.md              # This file
│   ├── decisions.md                 # ADRs (Architecture Decision Records)
│   ├── scaling.md                   # Scaling strategy
│   └── why-i-built-this.md          # Project motivation
│
├── .github/workflows/ci.yml         # CI/CD pipeline
├── docker-compose.yml               # Local development (5 services)
├── eslint.config.mjs                # Shared ESLint config
└── progresso.md                     # Development progress tracker
```
