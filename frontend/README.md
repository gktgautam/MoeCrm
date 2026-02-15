# Frontend Architecture Standards

## Structure

`frontend/src` is organized as:

- `app/`: top-level composition (providers, layouts, router, app-level guards/pages/config).
- `core/`: cross-cutting app infrastructure (API client, RBAC primitives, layout/navigation shell).
- `features/`: domain-first product features.
- `shared/`: reusable primitives only (UI atoms, generic hooks/utils/types).

## Routing and ownership rules

- `app/router` defines route composition.
- Features expose route entries via `*.routes.tsx` and are consumed by app router wiring.
- Route guards live in `app/guards` (e.g. `ProtectedRoute`).
- Global pages live in `app/pages` (e.g. `NotFound`, `Unauthorized`).

## RBAC rules

- RBAC primitives (`PermissionGate`, `RoleGate`, access rules) live in `core/rbac`.
- Feature auth state/hooks stay in `features/auth`.

## Layout/navigation rules

- App shell navigation belongs to `core/layout`.
- Do not place navigation under `shared`.

## API rules

- Shared HTTP client and query client belong in `core/api`.
- Domain API wrappers should follow `*.api.ts` under corresponding feature folders when added.

## Dependency boundaries

- Features should not import other features directly.
- Prefer sharing through `core/*` or `shared/*`.
- `shared/*` should remain framework-agnostic/reusable and avoid feature/business coupling.

## Naming conventions

- Feature routes: `*.routes.tsx`
- Feature/local types: `*.types.ts`
- Domain API files: `*.api.ts`
- Reusable visual units in feature folders: `components/*`
- Feature entry pages in feature folders: `pages/*`

## Where to place new code

- New business UI flow: `features/<domain>/...`
- Global route/layout wiring: `app/router` and `app/layouts`
- Cross-feature infra/API/RBAC/navigation: `core/*`
- Truly generic reusable pieces: `shared/*`
