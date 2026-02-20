# Why I Built This

> A reflexão técnica por trás do projeto — o que eu queria demonstrar, quais trade-offs aceitei, e o que aprendi.

---

## O Problema

A maioria dos projetos "portfolio" de desenvolvedores são CRUDs com autenticação. Você vê o repositório e encontra: todo app, blog com markdown, e-commerce com carrinho. Todos demonstram as mesmas habilidades: formulários, REST API, banco de dados.

**Chat em tempo real é diferente.** Ele exige domínio de conceitos que CRUDs não tocam:

- **WebSocket** — comunicação bidirecional persistente, não request-response
- **Event-driven architecture** — handlers de eventos, broadcasts, rooms
- **Concurrent state** — múltiplos usuários modificando dados simultaneamente
- **Optimistic UI** — mostrar resultado antes da confirmação do server
- **Resilience** — reconexão, estado inconsistente, race conditions

Eu queria um projeto que, quando um recrutador técnico abrisse o código, pensasse: *"Esse dev entende sistemas distribuídos, não só CRUD."*

---

## O que eu queria demonstrar

### 1. Arquitetura Backend de 3 Camadas
```
Controller → Service → Repository
```
Não é só separação de pastas — é separação de **responsabilidades**:
- Controller: ZERO lógica de negócio. Só extrai dados do request e formata response.
- Service: TODA lógica de negócio. Testável sem HTTP.
- Repository: Único ponto de acesso ao banco. Prisma queries tipadas.

**Por que importa:** Em produção, quando algo quebra, você sabe EXATAMENTE onde o bug está. Se é um erro de validação → controller. Se é uma regra de negócio errada → service. Se a query está lenta → repository.

### 2. Tipagem End-to-End
```
Prisma Schema → Generated Types → Service Types → API Response → Frontend Types
```
Do banco ao componente React, **tudo é tipado**. Mudou o schema do Prisma? O TypeScript compiler te diz TODOS os lugares que precisam ser atualizados. Zero `any`. Zero `as unknown`.

### 3. Real-time Event Architecture
```
Socket.io Events: 18 eventos tipados
├── Autenticação no handshake (JWT)
├── Rooms (join, leave, members)
├── Messages (send, receive, history)
├── Typing indicators (start, stop)
├── Read receipts (✓✓)
├── Online status (presence)
└── Notifications (unread, sound, toast)
```
Cada evento tem tipos de payload definidos em `types/socket.ts`. O server e o client compartilham a mesma interface de eventos.

### 4. Design System Reutilizável
40+ componentes adaptados do meu design system Pulse (originalmente para Next.js). Demonstra que sei criar e consumir componentes que seguem padrões: compound components, CVA para variantes, composição sobre herança.

### 5. DevOps Completo
- Docker Compose com 5 serviços orquestrados
- CI/CD com GitHub Actions (lint → typecheck → test → build)
- Deploy automatizado (Vercel + Railway)
- Health check endpoint com status de dependências

---

## Trade-offs que aceitei conscientemente

| Decisão | Trade-off | Justificativa |
|---|---|---|
| **Sem E2E encryption** | Admin pode ler mensagens | Foco é arquitetura, não criptografia. Documentado em `/docs/decisions.md` |
| **Sem Redis** | Cache e pub/sub in-memory | Para < 500 users, Redis é overhead. Documentado plano de scaling em `/docs/scaling.md` |
| **Sem microservices** | Monolito | Para 1 dev, monolito modular (3 layers) é 10x mais produtivo |
| **Uploads no disco** | Não persiste entre deploys no Railway | Para demo. Em produção: S3/R2 |
| **Sem E2E tests** | Cobertura limitada a unit + integration | Playwright seria o próximo passo. 37 testes cobrem a lógica crítica |
| **Sem rate limiting por user no WebSocket** | Possível spam | Implementação planejada na Fase 25 |

---

## O que faria diferente com mais tempo

1. **Redis para cache + pub/sub** — horizontal scaling de WebSocket com `@socket.io/redis-adapter`
2. **E2E tests com Playwright** — fluxos completos: register → create room → send message → receive
3. **Message queue (BullMQ)** — processar notificações push e emails de forma assíncrona
4. **Storybook** — documentação visual interativa dos 40+ componentes
5. **E2E encryption** — Web Crypto API para chats 1:1 (ECDH + AES-GCM)
6. **Image optimization** — thumbnails gerados no upload, lazy loading com blur placeholder
7. **Internacionalização (i18n)** — suporte a múltiplos idiomas com react-intl

---

## Métricas do Projeto

| Métrica | Valor |
|---|---|
| Fases de desenvolvimento | 29 (22 concluídas) |
| Componentes de UI (Pulse Design System) | 40+ |
| REST API endpoints | 22 |
| Socket.io events | 18 |
| Prisma models | 4 |
| Middleware | 6 |
| Testes automatizados | 37 |
| Stores Zustand | 3 |
| Custom hooks | 10 |
| Lines of code (estimated) | ~8.000 |

---

## Lições Aprendidas

### Prisma 7 + CJS Compatibility
Prisma 7 gera código com `import.meta.url` que não funciona em CommonJS. No Docker, precisei de `sed` post-build para substituir por equivalente CJS. **Lição:** sempre testar o build em container antes de deployar.

### Express 5 Read-Only Params
Express 5 mudou `req.params` e `req.query` para read-only. Dados validados pelo Zod não podem ser re-atribuídos ao request. **Solução:** usar `res.locals.validated` para passar dados validados do middleware para o controller.

### React 19 + Zustand
React 19 Strict Mode renderiza componentes duas vezes em dev. Com Zustand, é seguro porque as stores são externas ao React tree. Mas `setState` dentro de `useEffect` causa warnings — usei o "adjust state during render" pattern.

### Socket.io + Múltiplas Abas
Um mesmo usuário pode ter múltiplas abas abertas (= múltiplos sockets). O status "ONLINE" precisa considerar `userSockets.size > 0`, não apenas um socket individual. Só marcar OFFLINE quando a **última** aba fecha.

### Design System Cross-Framework
Adaptar componentes de Next.js para React/Vite exigiu: remover `next/image`, `next/link`, `next-themes`, e substituir por equivalentes nativos. **Lição:** design systems devem ser framework-agnostic — depender de features do framework acopla os componentes.

---

## Stack Técnica Completa

**Frontend:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4 · Radix UI · React Query · Zustand · Socket.io Client · React Hook Form + Zod

**Backend:** Node.js 22 · Express 5 · TypeScript 5.9 · Prisma 7 · PostgreSQL 16 · Socket.io · JWT · Multer · Swagger

**DevOps:** Docker · Docker Compose · GitHub Actions · Vercel · Railway · Nginx

**Testing:** Vitest · React Testing Library · Supertest patterns
