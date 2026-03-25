# Architecture

Papers is a web-first research sharing platform with a single primary runtime in
`apps/web`.

## Boundaries

- `apps/web`
  - Owns routes, server actions, page composition, uploads, and Trigger.dev task entrypoints.
- `packages/db`
  - Owns schema, persistence adapters, and public serialization rules.
- `packages/auth`
  - Owns Better Auth, session helpers, and ORCID linking configuration.
- `packages/contracts`
  - Owns product types, enums, validation, and blind-mode-safe public shapes.
- `packages/config`
  - Owns all environment parsing.
- `packages/ai`
  - Owns Grok provider integration and safe-to-send checks.
- `packages/ui`
  - Owns shared primitives and reusable presentation components.

## Safety Invariants

- Blind posts store internal ownership but must never expose author identity publicly.
- No private or blind-mode content is sent to Grok.
- Public feed ranking must be deterministic and explainable.
- Groups (research groups and lab circles) are now in the execution path: create/join groups, group feed, shared reading lists, group announcements.
- DMs, collaborator requests stay outside the v1 execution path until promoted from backlog.
