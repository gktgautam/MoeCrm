# EqueEngage Monorepo

Domain-first monorepo for independent frontend and backend delivery.

## Workspace layout

- `apps/backend`: Fastify + TypeScript API service
  - `src/bootstrap`: process/app bootstrapping
  - `src/api`: API composition and route registration
  - `src/domains`: business domains (auth, users, customers, ...)
  - `src/infrastructure`: DB adapters and framework plugins
  - `src/shared`: cross-cutting runtime config and logging
- `apps/frontend`: React + TypeScript SPA
  - `src/app`: app shell, providers, routing, app-level pages
  - `src/domains`: feature domains owned by product teams
  - `src/shared`: reusable config, HTTP client, and UI primitives
- `packages/shared`: shared workspace package boundary for future reusable contracts/types.

## Team conventions

- Add feature work under the appropriate domain folder, not under root-level catch-all directories.
- Keep framework wiring in `app/bootstrap/infrastructure`; keep business logic in `domains`.
- Prefer `@/` imports to reduce churn from file moves and avoid deep relative paths.
