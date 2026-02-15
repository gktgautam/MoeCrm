// src/core/plugins/db-retry.ts
import type { FastifyInstance } from "fastify";

type RetryOptions = {
  maxAttempts: number;
  delayMs: number;
  name: string;
};

export async function connectWithRetry(
  app: FastifyInstance,
  fn: () => Promise<void>,
  opts: RetryOptions
) {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      app.log.info({ name: opts.name, attempt }, "DB connecting...");

      await fn();

      if (attempt === 1) {
        app.log.info({ name: opts.name }, "DB connected ✅");
      } else {
        app.log.info(
          { name: opts.name, retriesUsed: attempt - 1 },
          "DB connected after retry ✅"
        );
      }
      return;
    } catch (err: any) {
      lastErr = err;

      const retriesLeft = opts.maxAttempts - attempt;

      if (retriesLeft > 0) {
        app.log.warn(
          {
            name: opts.name,
            attempt,
            retriesLeft,
            code: err?.code,
            message: err?.message,
          },
          "DB connection failed, retrying..."
        );
        await new Promise((r) => setTimeout(r, opts.delayMs));
      }
    }
  }

  app.log.error(
    { name: opts.name, err: lastErr },
    "DB connect failed after all attempts ❌"
  );

  throw lastErr;
}
