# System Architecture

> Pulse Chat · Real-time messaging platform built with React 19, Express 5, Socket.io, and PostgreSQL.

---

## High-Level Architecture

<div align="center">
  <img src="../assets/architecture.svg" alt="System Architecture" width="100%" />
</div>

---

## Backend Architecture (3-Layer)

The server follows a strict **Controller → Service → Repository** pattern with zero business logic in controllers.

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
│  CONTROLLER LAYER                               │
│  Extract data · Call service · Format response   │
│  ZERO business logic                            │
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
│  ALL business logic · Permission checks          │
│  Testable without HTTP (pure unit tests)         │
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
│  Single access point to the database             │
│  Typed Prisma queries · Returns raw data         │
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

How a message travels from sender to receiver in real-time:

```
User A types "Hello" and hits Enter
         │
         ▼
┌─ Client A ──────────────────────────────────────┐
│  1. ChatArea calls sendMessage("Hello")         │
│  2. useMessages hook emits socket event:        │
│     socket.emit("message:send", {               │
│       roomId: "abc-123",                        │
│       content: "Hello",                         │
│       type: "TEXT"                               │
│     }, callback)                                │
│  3. Message appears instantly (optimistic UI)   │
└───────────────────────┬─────────────────────────┘
                        │ WebSocket
                        ▼
┌─ Server ────────────────────────────────────────┐
│  4. message.handler receives "message:send"     │
│  5. messageService.send() validates:            │
│     · User is member of room ✓                  │
│     · Content is not empty ✓                    │
│  6. messageRepository.create() persists to DB   │
│  7. ACK callback sent to User A (confirmed)     │
│  8. io.to("room:abc-123").emit("message:new",   │
│     { id, content, user, createdAt })           │
└───────────────┬─────────────────────────────────┘
                │ Broadcast to all room members
                ▼
┌─ Client B ──────────────────────────────────────┐
│  9.  useMessages hook receives "message:new"    │
│  10. Message added to local state               │
│  11. Auto-scroll if near bottom                 │
│  12. If room not active:                        │
│      · useNotifications increments unread       │
│      · Toast notification shown                 │
│      · Sound played (if enabled)                │
└─────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─ Register / Login ──────────────────────────────┐
│                                                  │
│  Client                    Server                │
│    │                         │                   │
│    │  POST /auth/login       │                   │
│    │  { email, password }    │                   │
│    │────────────────────────►│                   │
│    │                         │                   │
│    │                    bcrypt.compare()          │
│    │                    generateAccessToken()     │
│    │                    generateRefreshToken()    │
│    │                         │                   │
│    │  200 OK                 │                   │
│    │  { user, accessToken }  │                   │
│    │  Set-Cookie: refresh_token (httpOnly)        │
│    │◄────────────────────────│                   │
│    │                         │                   │
│    │  Store in Zustand:      │                   │
│    │  auth.setAuth(user, token)                  │
│    │                         │                   │
└────┼─────────────────────────┼───────────────────┘
     │                         │
┌─ Token Refresh (automatic) ──┼───────────────────┐
│    │                         │                   │
│    │  GET /auth/me → 401     │                   │
│    │◄────────────────────────│                   │
│    │                         │                   │
│    │  POST /auth/refresh-token                   │
│    │  Cookie: refresh_token  │                   │
│    │────────────────────────►│                   │
│    │                    verifyRefreshToken()      │
│    │                    generateTokenPair()       │
│    │                         │                   │
│    │  200 OK { accessToken } │                   │
│    │  Set-Cookie: new refresh_token              │
│    │◄────────────────────────│                   │
│    │                         │                   │
│    │  Retry original request │                   │
│    │  with new accessToken   │                   │
│    │────────────────────────►│                   │
│    │                         │                   │
└────┴─────────────────────────┴───────────────────┘
```

---

## Frontend Architecture

```
┌─ React 19 + Vite 7 ────────────────────────────────────────┐
│                                                             │
│  ┌─ State Management ────────────────────────────────────┐  │
│  │                                                        │  │
│  │  Server State              Client State                │  │
│  │  ┌──────────────┐         ┌──────────────────┐        │  │
│  │  │ React Query  │         │ Zustand Stores   │        │  │
│  │  │ · useMyRooms │         │ · auth.store     │        │  │
│  │  │ · useRoom    │         │ · room.store     │        │  │
│  │  │ · mutations  │         │ · notification   │        │  │
│  │  │ · cache      │         │   (unreads,sound)│        │  │
│  │  └──────────────┘         └──────────────────┘        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Real-time Layer ──────────────────────────────────────┐  │
│  │  useSocket()          → connection + auth               │  │
│  │  useMessages()        → send, receive, history          │  │
│  │  useTyping()          → typing indicators               │  │
│  │  useOnlineStatus()    → user presence                   │  │
│  │  useReadReceipts()    → read indicators (✓✓)            │  │
│  │  useNotifications()   → unread counts, sounds, toasts   │  │
│  │  useReactions()       → emoji reactions (toggle)        │  │
│  │  useVoiceRecorder()   → voice message recording         │  │
│  │  useFriendship()      → friend requests, status         │  │
│  │  useEvents()          → room events, RSVP               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ UI Layer (Pulse Design System) ───────────────────────┐  │
│  │  40+ reusable components across 4 categories:          │  │
│  │  Primitives │ Organisms │ Patterns │ Layouts            │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

| Model | Key Fields | Notes |
|-------|-----------|-------|
| **users** | id, email (UQ), password, name, avatar, bio, status | `UserStatus` enum |
| **rooms** | id, name, owner_id (FK), is_private, invite_code (UQ) | Supports public/private |
| **room_members** | user_id + room_id (UQ), role | `Role` enum (ADMIN, MEMBER) |
| **messages** | id, content, type, client_id (UQ), reply_to_id (self-ref) | Soft delete, cursor pagination |
| **message_reactions** | user_id + message_id + emoji (UQ) | Toggle-based |
| **friendships** | sender_id + receiver_id (UQ), status | `FriendStatus` enum |
| **pinned_messages** | message_id + room_id (UQ), pinned_by | Per-room pinning |
| **events** | id, title, room_id, start/end_time, status | `EventStatus` enum |
| **event_invites** | event_id + user_id (UQ), status, responded_at | `InviteStatus` enum |

**10 models · 6 enums · 8+ indexes**

---

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite 7 | SPA with HMR |
| UI Components | Pulse Design System | 40+ shared components |
| State (Server) | React Query | Cache, mutations, staleTime |
| State (Client) | Zustand | Auth, room selection, notifications |
| Real-time | Socket.io | 32 bidirectional events |
| Backend | Express 5 + TypeScript | REST API (28 routes) |
| ORM | Prisma 7 | Type-safe queries, migrations |
| Database | PostgreSQL 16 | 10 models, managed on Railway |
| Auth | JWT (access + refresh) | httpOnly cookies for refresh |
| Testing | Vitest | 98 unit tests (service layer) |
| DevOps | Docker + GitHub Actions | CI/CD pipeline |
| Hosting | Vercel (client) + Railway (server) | Edge CDN + managed infra |

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
│   │   │   └── chat/                # ChatLayout, RoomSidebar, RoomView
│   │   ├── hooks/                   # useSocket, useMessages, useTyping...
│   │   ├── services/                # api.ts, auth.service, room.service...
│   │   ├── store/                   # auth.store, room.store, notification.store
│   │   └── types/                   # room.ts, shared types
│   └── vite.config.ts
│
├── server/                          # Backend (Express 5 + TypeScript)
│   ├── src/
│   │   ├── config/                  # env.ts, database.ts, socket.ts
│   │   ├── controllers/             # 7 controllers (28 routes)
│   │   ├── services/                # 7 services (all business logic)
│   │   │   └── __tests__/           # 98 unit tests (Vitest)
│   │   ├── repositories/            # 7 repositories (Prisma queries)
│   │   ├── routes/                  # Route definitions
│   │   ├── events/                  # Socket.io event handlers
│   │   ├── middleware/              # 9 middleware layers
│   │   ├── errors/                  # AppError, AuthError, NotFoundError
│   │   └── app.ts                   # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma            # 10 models, 6 enums
│   │   └── migrations/              # Versioned migrations
│   └── tsconfig.json
│
├── docs/                            # Architecture documentation
│   ├── architecture.md              # This file
│   ├── decisions.md                 # Architecture Decision Records
│   ├── scaling.md                   # Scaling strategy
│   └── why-i-built-this.md          # Project motivation
│
├── .github/workflows/ci.yml         # CI/CD pipeline
├── docker-compose.yml               # Local dev (5 services)
└── eslint.config.mjs                # Shared ESLint config
```
