import type { FastifyInstance } from "fastify";

type RetryOptions = {
  retries: number;
  delayMs: number;
  name: string; // "crm-db" | "engage-db"
};

export async function connectWithRetry(
  app: FastifyInstance,
  fn: () => Promise<void>,
  opts: RetryOptions
) {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= opts.retries; attempt++) {
    try {
      app.log.info(
        { name: opts.name, attempt, retries: opts.retries },
        "DB connect attempt"
      );
      await fn();
      app.log.info({ name: opts.name }, "DB connected");
      return;
    } catch (err) {
      lastErr = err;

      app.log.error(
        {
          name: opts.name,
          attempt,
          err,
          causes: Array.isArray((err as any)?.errors)
            ? (err as any).errors
            : undefined,
        },
        "DB connection failed"
      );

      if (attempt < opts.retries) {
        await new Promise((r) => setTimeout(r, opts.delayMs));
      }
    }
  }

  throw lastErr;
}
