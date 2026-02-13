# Frontend App (`apps/frontend`)

React + TypeScript (Vite) frontend for the EqueEngage monorepo.

## Folder conventions

- `src/app`: app composition (router, providers, layouts, app-level pages)
- `src/domains`: product domains/features (auth, dashboard, campaigns, ...)
- `src/shared`: reusable infra/UI/config (api client, query client, navigation UI)

## Scripts

- `npm run dev` - local development
- `npm run typecheck` - TypeScript project build check
- `npm run build:uat` / `npm run build:prod` - production builds
- `npm run lint` - ESLint
