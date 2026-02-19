import "dotenv/config";
import { PrismaClient, Role, Status, MessageType } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleaned existing data");

  // ============ USERS ============

  const passwordHash = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "andriy@example.com",
        password: passwordHash,
        name: "Andriy Amaro",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=andriy",
        status: Status.ONLINE,
      },
    }),
    prisma.user.create({
      data: {
        email: "lucas@example.com",
        password: passwordHash,
        name: "Lucas Silva",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=lucas",
        status: Status.ONLINE,
      },
    }),
    prisma.user.create({
      data: {
        email: "maria@example.com",
        password: passwordHash,
        name: "Maria Santos",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=maria",
        status: Status.AWAY,
      },
    }),
    prisma.user.create({
      data: {
        email: "pedro@example.com",
        password: passwordHash,
        name: "Pedro Costa",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=pedro",
        status: Status.OFFLINE,
      },
    }),
    prisma.user.create({
      data: {
        email: "ana@example.com",
        password: passwordHash,
        name: "Ana Oliveira",
        avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ana",
        status: Status.ONLINE,
      },
    }),
  ]);

  const [andriy, lucas, maria, pedro, ana] = users;

  console.log(`👤 Created ${users.length} users`);

  // ============ ROOMS ============

  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: "Geral",
        description: "Canal principal para conversas gerais",
        isPrivate: false,
        inviteCode: "GERAL2026",
        ownerId: andriy.id,
      },
    }),
    prisma.room.create({
      data: {
        name: "Dev Frontend",
        description: "React, TypeScript, Tailwind e tudo sobre frontend",
        isPrivate: false,
        inviteCode: "DEVFRONT",
        ownerId: lucas.id,
      },
    }),
    prisma.room.create({
      data: {
        name: "Dev Backend",
        description: "Node.js, Express, Prisma e arquitetura de APIs",
        isPrivate: false,
        inviteCode: "DEVBACK",
        ownerId: maria.id,
      },
    }),
    prisma.room.create({
      data: {
        name: "Projeto Secreto",
        description: "Sala privada para discussões do projeto X",
        isPrivate: true,
        inviteCode: "SECRET99",
        ownerId: andriy.id,
      },
    }),
  ]);

  const [geral, frontend, backend, secreto] = rooms;

  console.log(`🏠 Created ${rooms.length} rooms`);

  // ============ ROOM MEMBERS ============

  const memberships = await Promise.all([
    // Geral — everyone
    prisma.roomMember.create({ data: { userId: andriy.id, roomId: geral.id, role: Role.ADMIN } }),
    prisma.roomMember.create({ data: { userId: lucas.id, roomId: geral.id } }),
    prisma.roomMember.create({ data: { userId: maria.id, roomId: geral.id } }),
    prisma.roomMember.create({ data: { userId: pedro.id, roomId: geral.id } }),
    prisma.roomMember.create({ data: { userId: ana.id, roomId: geral.id } }),

    // Frontend — andriy, lucas, ana
    prisma.roomMember.create({ data: { userId: lucas.id, roomId: frontend.id, role: Role.ADMIN } }),
    prisma.roomMember.create({ data: { userId: andriy.id, roomId: frontend.id } }),
    prisma.roomMember.create({ data: { userId: ana.id, roomId: frontend.id } }),

    // Backend — andriy, maria, pedro
    prisma.roomMember.create({ data: { userId: maria.id, roomId: backend.id, role: Role.ADMIN } }),
    prisma.roomMember.create({ data: { userId: andriy.id, roomId: backend.id } }),
    prisma.roomMember.create({ data: { userId: pedro.id, roomId: backend.id } }),

    // Secreto — andriy, lucas
    prisma.roomMember.create({ data: { userId: andriy.id, roomId: secreto.id, role: Role.ADMIN } }),
    prisma.roomMember.create({ data: { userId: lucas.id, roomId: secreto.id } }),
  ]);

  console.log(`🔗 Created ${memberships.length} memberships`);

  // ============ MESSAGES ============

  const now = Date.now();
  const min = 60_000;

  const messages = await Promise.all([
    // Geral room messages
    prisma.message.create({
      data: {
        content: "Fala pessoal! Bem-vindos ao chat 🎉",
        type: MessageType.TEXT,
        userId: andriy.id,
        roomId: geral.id,
        createdAt: new Date(now - 60 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Salve! Tudo certo por aqui",
        type: MessageType.TEXT,
        userId: lucas.id,
        roomId: geral.id,
        createdAt: new Date(now - 55 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Oi gente! Que bom ter esse espaço pra gente trocar ideia",
        type: MessageType.TEXT,
        userId: maria.id,
        roomId: geral.id,
        createdAt: new Date(now - 50 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "E aí galera, cheguei agora",
        type: MessageType.TEXT,
        userId: pedro.id,
        roomId: geral.id,
        createdAt: new Date(now - 45 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Boa noite! Alguém sabe quando sai a próxima release?",
        type: MessageType.TEXT,
        userId: ana.id,
        roomId: geral.id,
        createdAt: new Date(now - 30 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Acho que semana que vem, estamos finalizando os testes",
        type: MessageType.TEXT,
        userId: andriy.id,
        roomId: geral.id,
        createdAt: new Date(now - 25 * min),
      },
    }),

    // Frontend room messages
    prisma.message.create({
      data: {
        content: "Alguém já testou o React 19? As melhorias de performance são absurdas",
        type: MessageType.TEXT,
        userId: lucas.id,
        roomId: frontend.id,
        createdAt: new Date(now - 40 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Sim! O use() hook simplificou muito o data fetching",
        type: MessageType.TEXT,
        userId: andriy.id,
        roomId: frontend.id,
        createdAt: new Date(now - 35 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Tailwind v4 também tá incrível, a config por CSS ficou muito mais limpa",
        type: MessageType.TEXT,
        userId: ana.id,
        roomId: frontend.id,
        createdAt: new Date(now - 28 * min),
      },
    }),

    // Backend room messages
    prisma.message.create({
      data: {
        content: "Migrei o projeto pra Express 5, o suporte nativo a async tá excelente",
        type: MessageType.TEXT,
        userId: maria.id,
        roomId: backend.id,
        createdAt: new Date(now - 42 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Prisma 7 resolveu aquele problema de connection pooling que tínhamos",
        type: MessageType.TEXT,
        userId: andriy.id,
        roomId: backend.id,
        createdAt: new Date(now - 38 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Vou testar, o nosso bottleneck era justamente nas queries concorrentes",
        type: MessageType.TEXT,
        userId: pedro.id,
        roomId: backend.id,
        createdAt: new Date(now - 33 * min),
      },
    }),

    // Secreto room messages
    prisma.message.create({
      data: {
        content: "O design system já tá quase pronto, vamos integrar semana que vem",
        type: MessageType.TEXT,
        userId: andriy.id,
        roomId: secreto.id,
        createdAt: new Date(now - 20 * min),
      },
    }),
    prisma.message.create({
      data: {
        content: "Perfeito, já preparei os componentes de chat pro merge",
        type: MessageType.TEXT,
        userId: lucas.id,
        roomId: secreto.id,
        createdAt: new Date(now - 15 * min),
      },
    }),
  ]);

  console.log(`💬 Created ${messages.length} messages`);

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Test credentials:");
  console.log("   Email: andriy@example.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
