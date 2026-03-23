# AGENTS

Papers is fully AI-written and orchestrated through Jarvis. Work from these rules:

1. Preserve the package boundaries in `ARCHITECTURE.md`.
2. Treat blind-mode safety as a non-negotiable product invariant.
3. Do not invent silent side effects, unsafe external calls, or hidden data flows.
4. If a change spans multiple packages or takes more than a short session, write a plan in `docs/PLANS.md`.
5. Prefer explicit contracts in `packages/contracts` before wiring new behavior in the app.
6. Keep future features such as groups, direct messages, collaborator requests, and opportunities as visible backlog items until explicitly implemented.
