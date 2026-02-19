# ============ STAGE 1: Builder ============

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Fix Prisma CJS compatibility: import.meta.url → CJS equivalent
# Prisma 7 generates ESM code that tsc passes through to CJS output
RUN find dist/generated -name '*.js' -exec sed -i \
  's/import\.meta\.url/require("url").pathToFileURL(__filename).href/g' {} +

# ============ STAGE 2: Runner ============

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + migrations + config (for migrate deploy)
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy compiled JavaScript (includes generated Prisma client)
COPY --from=builder /app/dist ./dist

# Create uploads directory and non-root user ownership
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/app.js"]
