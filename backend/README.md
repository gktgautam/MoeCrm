# Backend API Standards

## Architecture and placement rules

`backend/src` is organized by responsibility:

- `app/`: app bootstrap and HTTP composition (wiring only).
- `core/`: platform/cross-cutting code (config, plugins, logging, global HTTP error handling).
- `modules/`: domain/business modules.
- `shared/`: pure helpers only.
- `types/`: ambient/global type declarations.

DB migration assets are outside `src` in `backend/db`.

### Dependency boundaries (enforced)

- `src/core` **MUST NOT** import from `src/modules`.
- `src/shared` **MUST NOT** import from `src/core` or `src/modules`.
- `src/modules` **MAY** import from `src/core` and `src/shared`.

### File naming conventions

- Routes: `*.routes.ts`
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Repositories (SQL/data access only): `*.repo.ts`
- Schemas: `*.schemas.ts`
- Module/shared types: `*.types.ts`

### Layer ownership

- `*.routes.ts` / `*.controller.ts`: HTTP concerns.
- `*.service.ts`: business logic and orchestration.
- `*.repo.ts`: SQL/data access only.

## Response contract

All endpoints must return one of these shapes:

### Success

```json
{
  "ok": true,
  "data": {},
  "meta": {}
}
```

### Error

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "requestId": "string",
    "details": {}
  }
}
```

## Error codes

- `BAD_REQUEST`
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INVALID_CREDENTIALS`
- `EMAIL_EXISTS`
- `INVALID_UPDATED_AFTER`
- `SERVICE_UNAVAILABLE`
- `INTERNAL_SERVER_ERROR`

## Throwing errors

Use `Errors.*` helpers from `src/core/http/app-error.ts`.

```ts
import { Errors } from "@/core/http/app-error";

if (!req.auth) throw Errors.unauthorized();

if (!canAccessOrg) {
  throw Errors.forbidden("Missing permission: customers:sync");
}
```

Rules:

- Never send manual error payloads in routes/services.
- Services and guards throw `AppError` / `Errors.*`.
- Global handler maps all exceptions to the standard error response.

## Logging conventions

- Logging is centralized in the global hooks.
- Every completed request logs: `requestId`, `method`, `path`, `statusCode`, `responseTimeMs`.
- Level mapping:
  - `info` for `2xx/3xx`
  - `warn` for `4xx`
  - `error` for `5xx`
- Error handler logs once per failure path.

## Adding a new endpoint

1. Define request/response TypeBox schemas.
2. Use `{ ok: true, data: ... }` success payloads.
3. Add `ErrorResponseSchema` for any `4xx/5xx` response schemas.
4. In handlers/services/guards throw `Errors.*` for failures.
5. Do not call `reply.send({ ok: false, ... })`.
6. Keep business logic in services and return typed success data from handlers.
