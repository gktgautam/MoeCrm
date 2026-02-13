# Repository Structure (Production-Grade)

This repository follows a **layered + feature-oriented monorepo layout** with explicit **repository labels** and automated structure checks.

## Monorepo layout

- `apps/backend`: Fastify API and database integrations
- `apps/frontend`: React web app
- `docs`: product and architecture documentation
- `scripts`: repository automation and guardrails

## Repository labels (full-repo)

The full repository is organized with stable labels defined in `scripts/structure.config.json`:

- `application-backend` → `apps/backend`
- `application-frontend` → `apps/frontend`
- `documentation` → `docs`
- `tooling-scripts` → `scripts`

### Label rules

1. Every label path must exist.
2. Label scopes must not overlap across different labels.
3. Top-level folders/files must be explicitly allowed by structure contract.

These rules are validated by `npm run check:structure`.

## Backend (`apps/backend/src`)

- `app/`: application assembly
  - `bootstrap/`: app construction and wiring (`build-app.ts`)
  - `http/`: route composition and versioning strategy (`register-routes.ts`)
- `core/`: cross-cutting platform concerns
  - `config/`: environment and runtime configuration
  - `http/`: centralized error contracts and handlers
  - `logging/`: logger configuration and policy
  - `plugins/`: Fastify plugins (auth, db, swagger, connection utilities)
- `modules/`: domain features (auth, users, dashboard, customers, health)
  - each module owns routes, controllers/services/repositories, and types
  - registry files centralize module wiring to reduce merge conflicts
- `db/`: migrations, seeds, and DB tooling
- `server.ts`: process entrypoint and graceful shutdown orchestration

### Backend conventions

1. New feature code goes into `modules/<feature>` and exports route registration through module registries.
2. Reusable infrastructure goes into `core/*`.
3. Versioned route registration belongs in `app/http/*`.
4. Boot/wiring logic belongs in `app/bootstrap/*`.

## Frontend (`apps/frontend/src`)

- `app/`: app shell and composition layer
  - `config/`, `layouts/`, `providers/`, `router/`
- `features/`: product feature slices (dashboard, auth, analytics, etc.)
- `shared/`: reusable cross-feature building blocks
  - `api/`, `navigation/`, `ui/`
- `pages/`: top-level route pages not owned by a feature (e.g., `NotFound`)

### Frontend conventions

1. Feature-specific code stays inside `features/<feature>`, including route map (`<feature>.routes.tsx`).
2. Cross-feature reusable code moves to `shared/*`.
3. App orchestration and wiring stays in `app/*`.
4. Keep imports alias-based (`@/...`) to avoid brittle deep relative paths.

## Guardrails

- Run `npm run check:structure` before opening PRs.
- Public API boundary rule:
  - Frontend features must be imported via `@/features/<name>`.
  - Backend modules must be imported via `@/modules/<name>`.
- Each feature/module must expose an `index.ts` as a stable integration contract.
- The check enforces:
  - top-level structure contract,
  - repository label integrity,
  - feature/module API boundaries,
  - and folder ownership conventions.
