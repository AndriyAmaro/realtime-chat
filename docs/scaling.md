# Scaling Strategy

> Como escalar o Realtime Chat de centenas para centenas de milhares de usuários simultâneos.
> Cada tier inclui o que mudar, por que, e custo estimado.

---

## Current Architecture (MVP — até 500 usuários simultâneos)

```
┌─────────┐     ┌──────────────┐     ┌────────────┐
│  Vercel │────►│  1x Express  │────►│ PostgreSQL │
│  (CDN)  │     │  Server      │     │(1 instance)│
└─────────┘     └──────────────┘     └────────────┘
```

**Capacidade atual:**
- 1 server Node.js = ~10K WebSocket connections (limitado por RAM)
- PostgreSQL sem connection pooling = ~100 concurrent connections
- Uploads no disco local = limitado pelo storage do container
- Rate limiting in-memory = não compartilhado entre instâncias

**Custo:** ~$10/mês (Railway Hobby + Vercel Free)

---

## Tier 1: 1K–5K usuários simultâneos

### O que adicionar:

**1. Redis (Session + Cache + Pub/Sub)**
```
┌─────────┐     ┌──────────────┐     ┌────────────┐
│  Vercel │────►│  1x Express  │────►│ PostgreSQL │
│  (CDN)  │     │  + Socket.io │     └────────────┘
└─────────┘     └──────┬───────┘
                       │
                ┌──────┴───────┐
                │    Redis     │
                │  • Sessions  │
                │  • Cache     │
                │  • Pub/Sub   │
                └──────────────┘
```

**Por que:**
- Cache de queries frequentes (lista de salas, perfis) → reduz DB load em 60-80%
- Online status em Redis (SADD/SREM) em vez de memória → preparado para múltiplos servers
- Rate limiting compartilhado (Redis INCR + EXPIRE) → funciona com horizontal scaling

**Implementação:**
```typescript
// Cache hierarchy
const rooms = await redis.get(`user:${userId}:rooms`)
  ?? await db.room.findMany({ where: { members: { some: { userId } } } })

// Online status
await redis.sadd(`room:${roomId}:online`, userId)
await redis.srem(`room:${roomId}:online`, userId)

// Rate limiting
const count = await redis.incr(`ratelimit:${userId}:messages`)
if (count === 1) await redis.expire(`ratelimit:${userId}:messages`, 5)
if (count > 10) throw new RateLimitError()
```

**Custo:** ~$25/mês (+$5 Redis)

---

## Tier 2: 5K–50K usuários simultâneos

### O que adicionar:

**1. Horizontal Scaling (múltiplos servers)**
```
                    ┌──────────────┐
              ┌────►│  Server 1    │────┐
┌─────────┐   │     └──────────────┘    │    ┌────────────┐
│  Load   │───┤                         ├───►│ PostgreSQL │
│ Balancer│   │     ┌──────────────┐    │    │  + Replica │
└─────────┘   ├────►│  Server 2    │────┤    └────────────┘
              │     └──────────────┘    │
              │                         │    ┌────────────┐
              └────►┌──────────────┐    ├───►│   Redis    │
                    │  Server 3    │────┘    │  (Cluster) │
                    └──────────────┘         └────────────┘
```

**2. Socket.io com Redis Adapter**

O problema: User A está no Server 1, User B no Server 2. Quando A envia mensagem, o `io.to(room)` só emite para connections do Server 1.

A solução: `@socket.io/redis-adapter` faz pub/sub entre servers via Redis.

```typescript
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ url: REDIS_URL })
const subClient = pubClient.duplicate()

io.adapter(createAdapter(pubClient, subClient))
// Agora io.to("room:123").emit() funciona cross-server
```

**3. Connection Pooling (PgBouncer)**
- App connections → PgBouncer (pool de 20) → PostgreSQL
- Sem PgBouncer: 3 servers × 10 connections = 30 DB connections
- Com PgBouncer: 3 servers → PgBouncer (20 pooled) → PostgreSQL

**4. Read Replica**
- Queries de leitura (listar salas, histórico, busca) → Read Replica
- Queries de escrita (criar mensagem, join room) → Primary
- Prisma suporta nativamente via `$extends` com read replicas

**5. CDN para Uploads (S3/R2)**
```typescript
// Em vez de disco local:
const s3 = new S3Client({ region: 'us-east-1' })
const url = await getSignedUrl(s3, new PutObjectCommand({
  Bucket: 'chat-uploads',
  Key: `avatars/${userId}/${filename}`,
}))
// Client faz upload direto para S3 (não passa pelo server)
```

**Custo:** ~$100-200/mês

---

## Tier 3: 50K–100K+ usuários simultâneos

### O que adicionar:

**1. Message Queue (BullMQ + Redis)**
```
┌──────────┐     ┌──────────────┐     ┌────────────┐
│  Server  │────►│   BullMQ     │────►│  Workers   │
│ (API)    │     │   Queue      │     │            │
└──────────┘     └──────────────┘     │• Emails    │
                                      │• Push      │
                                      │• Analytics │
                                      │• Thumbnails│
                                      └────────────┘
```

**Por que:** Operações demoradas não devem bloquear o request. Enviar email de notificação, gerar thumbnail de imagem, processar analytics — tudo vai para fila.

**2. Database Partitioning**

Mensagens são append-only e a tabela cresce infinitamente. Particionar por data:

```sql
-- Partition by month
CREATE TABLE messages (
  id UUID,
  content TEXT,
  room_id UUID,
  created_at TIMESTAMPTZ
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2026_01 PARTITION OF messages
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE messages_2026_02 PARTITION OF messages
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

Queries recentes (últimos 30 dias) = fast. Histórico antigo = slower, mas acessível.

**3. Microservices (se realmente necessário)**

```
┌─ API Gateway ──────────────────────────────────┐
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Auth   │  │   Chat   │  │ Notification │  │
│  │ Service  │  │ Service  │  │   Service    │  │
│  │          │  │          │  │              │  │
│  │ • Login  │  │ • Rooms  │  │ • Push       │  │
│  │ • JWT    │  │ • Msgs   │  │ • Email      │  │
│  │ • Profile│  │ • Socket │  │ • In-App     │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │         │
│  ┌────┴──┐     ┌────┴──┐      ┌────┴──┐        │
│  │ Users │     │ Msgs  │      │ Redis │        │
│  │  DB   │     │  DB   │      │ Queue │        │
│  └───────┘     └───────┘      └───────┘        │
└────────────────────────────────────────────────┘
```

**Quando migrar para microservices:**
- Quando times diferentes trabalham em features diferentes
- Quando uma parte do sistema precisa escalar independentemente (chat vs auth)
- NUNCA prematuramente — complexidade operacional é 10x maior

**Custo:** ~$500-1000/mês

---

## Scaling Decision Matrix

| Métrica | Threshold | Ação |
|---|---|---|
| DB connections > 80% pool | 80 connections | Adicionar PgBouncer |
| Response time p95 > 500ms | Consistente | Adicionar Redis cache |
| WebSocket connections > 8K/server | 8.000 | Horizontal scaling + Redis adapter |
| Messages/min > 10K | 10.000 | Message queue (BullMQ) |
| DB size > 50GB | 50 GB | Table partitioning |
| Upload storage > 100GB | 100 GB | Migrar para S3/R2 |
| Read queries > 80% total | 80% | Adicionar read replica |

---

## Current Feature Set (implemented)

| Feature | Stack | Notes |
|---|---|---|
| **Auth** | JWT + refresh token | Cookie-free (Vercel proxy compat) |
| **Rooms** | CRUD + members | Join/leave + admin role |
| **Messages** | Socket.io realtime | TEXT, IMAGE, FILE types |
| **Read receipts** | Socket.io events | Per-room last-read tracking |
| **Typing indicators** | Socket.io events | Debounced, per-room |
| **Search** | Prisma `contains` | In-room full-text search |
| **Edit messages** | Socket.io + soft update | Author-only, TEXT-only, shows "(editado)" |
| **Delete messages** | Socket.io + soft delete | Author or admin, shows placeholder |
| **Replies** | Self-referencing FK | Quote preview above bubble |
| **Reactions** | Toggle pattern + aggregation | Emoji chips with count, unique per user+message+emoji |
| **File uploads** | Multer + static serve | Image preview + file download |

---

## What We Chose NOT to Do (and Why)

| Feature | Why Not |
|---|---|
| **Microservices** | Complexidade operacional não justificada para 1 dev. Monolito modular (3 layers) é mais produtivo. |
| **Kubernetes** | Over-engineering para < 100K users. Railway auto-scales containers. |
| **GraphQL** | REST é mais simples de demonstrar e documentar (Swagger). Chat não tem query flexibility needs. |
| **E2E Encryption** | Foco é arquitetura backend, não criptografia. Documentado em `/docs/decisions.md#adr-008`. |
| **WebRTC** | Seria necessário para vídeo/voz. Para texto, Socket.io é suficiente e mais simples. |
| **Elasticsearch** | Full-text search com Prisma `contains` é suficiente até ~1M mensagens. |
