# syntax=docker/dockerfile:1

# ── Base ─────────────────────────────────────────────────────────────
FROM node:22-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# ── Dependencies ─────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ai/package.json packages/ai/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm ci --ignore-scripts

# ── Build ────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx turbo run build --filter=@papers/web

# ── Runtime ──────────────────────────────────────────────────────────
FROM base AS runtime
RUN addgroup --system papers && adduser --system --ingroup papers papers

COPY --from=build --chown=papers:papers /app/apps/web/.next/standalone ./
COPY --from=build --chown=papers:papers /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=papers:papers /app/apps/web/public ./apps/web/public

USER papers
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "apps/web/server.js"]
