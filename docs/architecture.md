# Architecture Overview

> Technical overview of Realtime Chat's architecture — how the components connect and why.

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
│  │  │  28 routes  │  │  32 events   │  │  /uploads   │  │          │
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
│  │  10 models, 6 enums, 8+ indexes                       │          │
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
│  - Extract data from request (body, params)     │
│  - Call the appropriate service                 │
│  - Format response (status code + JSON)         │
│  - ZERO business logic                          │
│                                                 │
│  auth.controller.ts     → 7 handlers            │
│  room.controller.ts     → 13 handlers           │
│  message.controller.ts  → 3 handlers            │
│  upload.controller.ts   → 1 handler             │
│  friendship.controller  → 7 handlers            │
│  event.controller.ts    → 5 handlers            │
│  pinned.controller.ts   → 3 handlers            │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  SERVICE LAYER                                  │
│  - ALL business logic lives here                │
│  - Permission validations                       │
│  - Operation orchestration                      │
│  - Testable without HTTP (pure unit tests)      │
│                                                 │
│  auth.service.ts        → register, login, JWT  │
│  room.service.ts        → CRUD, join, leave     │
│  message.service.ts     → send, history, search │
│  friendship.service.ts  → requests, accept      │
│  pinned.service.ts      → pin, unpin, list      │
│  event.service.ts       → CRUD, invites, RSVP   │
│  upload.service.ts      → multer config, types  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  REPOSITORY LAYER                               │
│  - SINGLE access point to the database          │
│  - Typed Prisma queries                         │
│  - Returns raw data (no HTTP formatting)        │
│                                                 │
│  user.repository.ts       → findByEmail, create │
│  room.repository.ts       → CRUD + memberships  │
│  message.repository.ts    → create, findByRoom  │
│  friendship.repository.ts → requests, status    │
│  pinnedMessage.repository → pin, unpin, find    │
│  event.repository.ts      → CRUD + invites      │
│  reaction.repository.ts   → toggle, aggregate   │
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
│  │  useSocket()          → connection + auth             │ │
│  │  useMessages()        → send, receive, history        │ │
│  │  useTyping()          → typing indicators             │ │
│  │  useOnlineStatus()    → user presence                 │ │
│  │  useReadReceipts()    → read indicators (✓✓)          │ │
│  │  useNotifications()   → unread counts, sounds, toasts │ │
│  │  useReactions()       → emoji reactions (toggle)      │ │
│  │  useVoiceRecorder()   → voice message recording       │ │
│  │  useFriendship()      → friend requests, status       │ │
│  │  useEvents()          → room events, RSVP             │ │
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
│ bio              │     │ invite_code (UQ) │
│ status (enum)    │     │ created_at       │
│ created_at       │     │ updated_at       │
│ updated_at       │     └────────┬─────────┘
└────────┬─────────┘              │
         │    ┌───────────────────┘
         │    │
         ▼    ▼
┌──────────────────┐     ┌──────────────────┐
│  room_members    │     │    messages      │
├──────────────────┤     ├──────────────────┤
│ id        (PK)   │     │ id        (PK)   │
│ user_id   (FK)   │     │ content          │
│ room_id   (FK)   │     │ type (enum)      │  TEXT | IMAGE | FILE | VOICE
│ role (enum)      │     │ file_url         │
│ joined_at        │     │ duration         │  (for voice messages)
│ last_read_at     │     │ edited_at        │
│                  │     │ deleted_at       │  (soft delete)
│ @@unique(user_id,│     │ client_id  (UQ)  │  (idempotency key)
│          room_id)│     │ user_id   (FK)   │
└──────────────────┘     │ room_id   (FK)   │
                         │ reply_to_id (FK) │  (self-referencing)
                         │ created_at       │
                         │                  │
                         │ @@index(room_id, │  (cursor pagination)
                         │     created_at)  │
                         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│message_reactions │     │  friendships     │
├──────────────────┤     ├──────────────────┤
│ id        (PK)   │     │ id        (PK)   │
│ emoji            │     │ sender_id (FK)   │
│ user_id   (FK)   │     │ receiver_id (FK) │
│ message_id (FK)  │     │ status (enum)    │  PENDING | ACCEPTED | DECLINED
│                  │     │ created_at       │
│ @@unique(user_id,│     │ updated_at       │
│  message_id,     │     │                  │
│  emoji)          │     │ @@unique(sender, │
└──────────────────┘     │      receiver)   │
                         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│pinned_messages   │     │     events       │
├──────────────────┤     ├──────────────────┤
│ id        (PK)   │     │ id        (PK)   │
│ message_id (FK)  │     │ title            │
│ room_id   (FK)   │     │ description      │
│ pinned_by (FK)   │     │ start_time       │
│ pinned_at        │     │ end_time         │
│                  │     │ room_id   (FK)   │
│ @@unique(message,│     │ created_by (FK)  │
│      room_id)    │     │ status (enum)    │  SCHEDULED | CANCELLED
└──────────────────┘     │ created_at       │
                         └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         │  event_invites   │
                         ├──────────────────┤
                         │ id        (PK)   │
                         │ event_id  (FK)   │
                         │ user_id   (FK)   │
                         │ status (enum)    │  PENDING | ACCEPTED | DECLINED
                         │ responded_at     │
                         │ created_at       │
                         │                  │
                         │ @@unique(event,  │
                         │      user_id)    │
                         └──────────────────┘

Enums:
  UserStatus    → ONLINE | OFFLINE | AWAY
  Role          → ADMIN | MEMBER
  MessageType   → TEXT | IMAGE | FILE | VOICE
  FriendStatus  → PENDING | ACCEPTED | DECLINED
  EventStatus   → SCHEDULED | CANCELLED
  InviteStatus  → PENDING | ACCEPTED | DECLINED
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
│   │   ├── hooks/                   # useSocket, useMessages, useTyping,
│   │   │                            # useReactions, useFriendship, useEvents...
│   │   ├── services/                # api.ts, auth.service, room.service...
│   │   ├── store/                   # auth.store, room.store, notification.store
│   │   └── types/                   # room.ts, shared types
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                          # Backend (Express 5 + TypeScript)
│   ├── src/
│   │   ├── config/                  # env.ts, database.ts, socket.ts, swagger.ts
│   │   ├── controllers/             # auth, room, message, friendship, event,
│   │   │                            # pinned, upload controllers
│   │   ├── services/                # auth, room, message, friendship, event,
│   │   │                            # pinned, upload services
│   │   │   └── __tests__/           # 98 unit tests (Vitest)
│   │   ├── repositories/            # user, room, message, friendship, event,
│   │   │                            # pinnedMessage, reaction repositories
│   │   ├── routes/                  # auth, room, message, friendship, event,
│   │   │                            # pinned, upload, health routes
│   │   ├── events/                  # Socket.io event handlers
│   │   ├── middleware/              # auth, validate, rateLimiter, errorHandler...
│   │   ├── errors/                  # AppError, AuthError, NotFoundError...
│   │   ├── types/                   # api.ts, auth.ts, room.ts, socket.ts
│   │   ├── utils/                   # jwt.ts
│   │   └── app.ts                   # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (10 models)
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
