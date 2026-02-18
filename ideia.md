 ******STACK DE TECNOLOGIAS******

**Projeto 1: Chat em Tempo Real com Salas**
 Frontend
React 18+ com TypeScript
Tailwind CSS (estilização moderna e responsiva)
React Router v6 (navegação)
React Query / TanStack Query (gerenciamento de estado servidor)
Zustand (estado global leve)
React Hook Form + Zod (formulários e validação)
Backend
Node.js + Express com TypeScript
PostgreSQL (banco relacional)
Prisma ORM (acesso ao banco)
JWT + bcrypt (autenticação)
Socket.io (tempo real — Projeto 1)
Stripe API (pagamentos — Projeto 2)
DevOps & Qualidade
Docker + Docker Compose (containerização)
Jest + React Testing Library (testes)
GitHub Actions (CI/CD)
Vercel (deploy frontend) + Railway ou Render (deploy backend)
Swagger/OpenAPI (documentação da API)
Padrão de Código
ESLint + Prettier configurados
Husky + lint-staged (pre-commit hooks)
Conventional Commits (mensagens de commit padronizadas

 PROJETO 1: CHAT EM TEMPO REAL COM SALAS
Por que é letal?
WebSocket e comunicação em tempo real são habilidades que separam desenvolvedores
pleno/sênior de júnior. Pouquíssimos candidatos têm isso no portfólio.
Funcionalidades Completas
Autenticação
Registro com email e senha (bcrypt + JWT)
Login com tokens (access + refresh token)
Recuperação de senha por email
Avatar do usuário (upload de imagem)
Status online/offline/ausente
Salas de Chat
Criar salas públicas e privadas
Convite por link para salas privadas
Lista de membros da sala com status online
Sair/entrar em salas
Admin da sala pode remover membros
Mensagens em Tempo Real
Envio e recebimento instantâneo (Socket.io)
Indicador “digitando…” em tempo real
Indicador de leitura (visto ✓✓)
Upload de imagens e arquivos nas mensagens
Emojis
Histórico de mensagens com scroll infinito
Busca dentro das mensagens
Notificações
Badge com contagem de mensagens não lidas
Notificação sonora para novas mensagens
Destaque visual em salas com mensagens novas
Estrutura de Pastas
realtime-chat/
├── public/
├── client/                          # Frontend React
│   
│   
│   
├── src/
│   
├── assets/                  # Imagens, sons, ícones
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   └── MessageList.tsx
│   │   │   ├── rooms/
│   │   │   │   ├── RoomList.tsx
│   │   │   │   ├── RoomCard.tsx
│   │   │   │   ├── CreateRoomModal.tsx
│   │   │   │   └── MembersList.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   └── ui/
│   │   │       ├── Avatar.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Spinner.tsx
│   │   │       └── SearchBar.tsx
│   │   ├── hooks/
│   │   │   ├── useSocket.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useRooms.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── chatService.ts
│   │   │   └── socketService.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── message.ts
│   │   │   └── room.ts
│   │   ├── utils/
│   │   │   ├── formatDate.ts
│   │   │   └── validators.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── Profile.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── socket.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── roomController.ts
│   │   │   ├── messageController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validate.ts
│   │   ├── models/                  # Prisma schema
│   │   │   └── schema.prisma
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── roomRoutes.ts
│   │   │   ├── messageRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── roomService.ts
│   │   │   ├── messageService.ts
│   │   │   └── socketService.ts
│   │   ├── socket/
│   │   │   ├── handlers/
│   │   │   │   ├── chatHandler.ts
│   │   │   │   ├── roomHandler.ts
│   │   │   │   └── typingHandler.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
└── helpers.ts
│   
└── app.ts
│   
│   
├── tests/
│   
│   
│   
├── tsconfig.json
└── package.json
│   
│   
│   
│   
│   
│   
│   
│   
│
├── docker-compose.yml
├── .github/
│   
│       
├── .env.example
└── README.md
├── auth.test.ts
├── room.test.ts
└── message.test.ts
└── workflows/
└── ci.yml
Banco de Dados (Prisma Schema)
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  password     String
  name         String
  avatar       String?
  status       Status    @default(OFFLINE)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  messages     Message[]
  rooms        RoomMember[]
  ownedRooms   Room[]    @relation("RoomOwner")
}
model Room {
  id          String       @id @default(uuid())
  name        String
  description String?
  isPrivate   Boolean      @default(false)
  inviteCode  String?      @unique
  ownerId     String
  owner       User         @relation("RoomOwner", fields: [ownerId], references: [id])
  createdAt   DateTime     @default(now())
  members     RoomMember[]
  messages    Message[]
}
model RoomMember {
  id       String   @id @default(uuid())
  userId   String
  roomId   String
  role     Role     @default(MEMBER)
  joinedAt DateTime @default(now())
  user     User     @relation(fields: [userId], references: [id])
  room     Room     @relation(fields: [roomId], references: [id])
  @@unique([userId, roomId])
}
model Message {
  id        String      @id @default(uuid())
  content   String
  type      MessageType @default(TEXT)
  fileUrl   String?
  isRead    Boolean     @default(false)
  userId    String
  roomId    String
  user      User        @relation(fields: [userId], references: [id])
  room      Room        @relation(fields: [roomId], references: [id])
  createdAt DateTime    @default(now())
}
enum Status {
  ONLINE
  OFFLINE
  AWAY
}
enum Role {
  ADMIN
  MEMBER
}
enum MessageType {
  TEXT
  IMAGE
  FILE
}
Plano de Execução — Projeto 1
Semana 1: Fundação
Dia Tarefa
1 Setup do projeto (monorepo, Docker, ESLint, Prettier, Husky)
2 Configurar PostgreSQL + Prisma + schema do banco
3 Backend: rotas de autenticação (register, login, refresh token)
4 Frontend: páginas de Login e Registro + integração com API
5 Backend: CRUD de salas + rotas de membros
6 Frontend: lista de salas + criar sala + entrar em sala
7 Revisão, ajustes e testes unitários da autenticação
Semana 2: Tempo Real
Dia Tarefa
1 Configurar Socket.io no backend + eventos de conexão
2 Implementar envio/recebimento de mensagens em tempo real
3 Frontend: ChatWindow + MessageBubble + MessageInput
4 Indicador “digitando…” + status online/offline
5 Histórico de mensagens + scroll infinito
6 Upload de imagens/arquivos nas mensagens
7 Notificações (badge, som, destaque visual)
Semana 3: Polimento
Dia Tarefa
1 Busca dentro das mensagens
2 Indicador de leitura (✓✓)
3 Responsividade completa (mobile)
4
5
Testes (Jest + RTL)
Documentação Swagger da API
6
Deploy (Vercel + Railway)
7
README profissional no GitHub + GIFs/screenshots

**CHECKLIST FINAL**

GitHub (Para Impressionar Recrutadores)
README.md profissional com: badges, descrição, screenshots/GIFs, tecnologias, como
rodar, arquitetura
Commits seguindo Conventional Commits (feat:, fix:, refactor:, docs:, test:)
Branches organizadas (main, develop, feature/*)
Issues e Pull Requests usados (mesmo sozinho)
CI/CD rodando (GitHub Actions com badge verde)
.env.example com todas as variáveis documentadas
Docker Compose funcional (recrutador roda com 1 comando)
Testes passando com cobertura visível
Deploy live com link no README
Swagger/OpenAPI documentando a API
Código limpo: sem console.log, sem arquivos desnecessários
TypeScript strict mode
Modelo de README Profissional
#  Nome do Projeto
![CI](https://github.com/seu-user/projeto/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
Descrição curta e impactante do projeto.
##  Screenshots
[GIF ou imagens aqui]
##  Features
- Feature 1- Feature 2- Feature 3
##  Tecnologias
**Frontend:** React, TypeScript, Tailwind CSS, React Query
**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
**Infra:** Docker, GitHub Actions, Vercel, Railway
##  Como Rodar
git clone https://github.com/seu-user/projeto.git
cd projeto
docker-compose up -d
Acesse: http://localhost:3000
##  Documentação da API
Swagger disponível em: http://localhost:4000/api-docs
##  Testes
npm run test
##  Licença
MIT
 DICAS FINAIS PARA SURPREENDER
1. Dados Seed: Cada projeto deve ter um script que popula o banco com dados realistas
para demonstração
2. Dark Mode: Implementar em todos os projetos (mostra atenção a UX)
3. Loading States: Skeletons bonitos em vez de spinners básicos
4. Error Handling: Mensagens de erro amigáveis + páginas 404/500 customizadas
5. Acessibilidade: Labels, alt texts, navegação por teclado
6. Performance: Lazy loading de imagens, code splitting, memoização
7. Demo Account: Botão “Entrar como Demo” na página de login pra o recrutador não
precisar criar conta