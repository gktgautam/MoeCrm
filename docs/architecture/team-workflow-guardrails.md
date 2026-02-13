# Team Workflow Guardrails

To keep the repo scalable and avoid "random file dumping", we now enforce a structure check.

## Command

```bash
npm run check:structure
```

## What it enforces

- Backend `apps/backend/src` may only have:
  - directories: `app`, `core`, `db`, `modules`
  - file: `server.ts`
- Frontend `apps/frontend/src` may only have:
  - directories: `app`, `features`, `shared`, `pages`
  - files: `App.tsx`, `main.tsx`, `index.css`
- Legacy frontend folders (`core`, `lib`, `utils`, `config`) are rejected.
- Every backend module under `modules/*` must include a `*.routes.ts` file.

## Team recommendation

- Run `npm run check:structure` before pushing.
- Add this command to CI to prevent accidental regressions.
