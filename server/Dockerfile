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

# Fix Prisma CJS compatibility:
# 1. import.meta.url → CJS equivalent (Prisma 7 ESM in CJS context)
# 2. .ts extensions → .js in require/import (tsc preserves .ts extensions)
RUN find dist/generated -name '*.js' -exec sed -i \
  's/import\.meta\.url/require("url").pathToFileURL(__filename).href/g' {} + && \
  find dist/generated -name '*.js' -exec sed -i \
  "s/\(require(['\"]\..*\)\.ts\(['\"])\)/\1.js\2/g" {} + && \
  find dist/generated -name '*.js' -exec sed -i \
  "s/\(from ['\"]\..*\)\.ts\(['\"];\)/\1.js\2/g" {} +

# ============ STAGE 2: Runner ============

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies (includes tsx for prisma.config.ts)
COPY package.json package-lock.json ./
RUN npm ci

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

CMD sh -c "npx prisma migrate deploy && node dist/app.js"
