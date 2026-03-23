# Papers

Papers is a web-first platform for sharing research, discussing work in progress,
publishing papers without turning LinkedIn into an accidental preprint server,
and building research discovery around interests, follows, and public discussion.

This repository is structured for agentic execution from day one:

- `apps/web`: the Next.js App Router product
- `packages/auth`: Better Auth config and identity integration
- `packages/db`: Drizzle schema, repositories, and demo-mode fallback
- `packages/contracts`: domain types and validation
- `packages/config`: runtime configuration
- `packages/ai`: Grok provider and safe-to-send classification boundaries
- `packages/ui`: shared UI primitives

## What Works In This First Slice

- public landing page and feed shell
- sign-in and sign-up pages
- profile pages by handle
- paper creation flow with `public` and `blind` visibility modes
- comments, follows, stars, and saved-interest actions
- deterministic feed ranking from recency, follows, stars, and topic overlap
- blind-mode serialization rules that suppress author identity publicly
- server-side Grok adapter with explicit safety boundaries
- Trigger.dev tasks for metadata enrichment, PDF processing, and feed refresh

## Local Development

This repo is designed to run in two modes:

- `managed mode`: real Postgres, Better Auth, R2, and Trigger.dev
- `demo mode`: no external infra required, powered by a local data fallback

Copy `.env.example` into `.env.local` and set what you have. With no
`DATABASE_URL`, the app falls back to local demo data so the product remains
explorable while the production stack is being configured.

```bash
npm install
npm run lint
npm run test
npm run check
npm run build
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Direction

- database: Neon Postgres
- auth: Better Auth with email login and optional ORCID linking
- storage: Cloudflare R2
- jobs: Trigger.dev
- external text model: Grok, server-side only, for public non-blind content

Blind posts never send raw private content, hidden author identity, or blind-mode
assets to external model providers.
