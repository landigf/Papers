# syntax=docker/dockerfile:1

# --- Base ---
FROM node:23-alpine AS base
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY package.json package-lock.json turbo.json tsconfig.base.json biome.json ./
COPY apps/web/package.json apps/web/
COPY packages/ai/package.json packages/ai/
COPY packages/auth/package.json packages/auth/
COPY packages/config/package.json packages/config/
COPY packages/contracts/package.json packages/contracts/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
RUN npm ci

# --- Build ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx turbo run build --filter=@papers/web

# --- Runner ---
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/web/server.js"]
