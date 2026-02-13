# Repository Structure (Production-Grade)

This repository now follows a **layered + feature-oriented monorepo layout** designed to reduce merge conflicts and make ownership clearer.

## Monorepo

- `apps/backend`: Fastify API and database integrations
- `apps/frontend`: React web app
- `docs`: product and architecture documentation
- `shared`: workspace package metadata (future reusable packages can live under `packages/*`)

## Backend (`apps/backend/src`)

- `app/`: application assembly
  - `bootstrap/`: app construction and wiring (`build-app.ts`)
  - `http/`: route composition and versioning strategy (`register-routes.ts`)
- `core/`: cross-cutting platform concerns
  - `config/`: environment and runtime configuration
  - `logging/`: logger configuration and policy
  - `plugins/`: Fastify plugins (auth, db, swagger, connection utilities)
- `modules/`: domain features (auth, users, dashboard, customers, health)
  - each module owns its routes, controllers/services/repositories, and types
- `db/`: migrations, seeds, and DB tooling
- `server.ts`: process entrypoint and graceful shutdown orchestration

### Backend conventions

1. New feature code goes into `modules/<feature>`.
2. Reusable infrastructure goes into `core/*`.
3. Versioned route registration belongs in `app/http/*` (not in modules).
4. Boot/wiring logic belongs in `app/bootstrap/*`.

## Frontend (`apps/frontend/src`)

- `app/`: app shell and composition layer
  - `config/`: app-level runtime config
  - `layouts/`, `providers/`, `router/`: composition boundaries
- `features/`: product feature slices (dashboard, auth, analytics, etc.)
- `shared/`: reusable cross-feature building blocks
  - `api/`: HTTP client and query client
  - `navigation/`: sidebar/topbar/navigation definitions
  - `ui/`: shared UI helpers and primitives
- `pages/`: top-level route pages not belonging to a feature slice (e.g., `NotFound`)

### Frontend conventions

1. Feature-specific code stays inside `features/<feature>`.
2. Cross-feature reusable code moves to `shared/*`.
3. App orchestration and wiring stays in `app/*`.
4. Keep imports alias-based (`@/...`) to avoid brittle deep relative paths.

## Why this helps teams

- Better ownership boundaries: infra vs feature code is separated.
- Lower merge conflict frequency: teams touch isolated feature slices.
- Easier onboarding: predictable locations for common responsibilities.
- Scales with growth: new modules/features slot into existing structure without ad-hoc folders.
