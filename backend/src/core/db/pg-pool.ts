 
import type { FastifyInstance } from "fastify";
import { Pool } from "pg"; 

type RegisterPostgresPoolOptions = {
  name: string;
  closeLogMessage: string;
  maxAttempts: number;
  delayMs: number;
};

type RetryOptions = {
  maxAttempts: number;
  delayMs: number;
  name: string;
};

export function createPostgresPool(connectionString: string) {
  return new Pool({
    connectionString,
    statement_timeout: 5000,
    query_timeout: 5000,
  });
}

export function registerPostgresPoolLifecycle(
  app: FastifyInstance,
  pool: Pool,
  options: RegisterPostgresPoolOptions,
) {
  async function healthCheck() {
    const connection = await pool.connect();
    try {
      await connection.query("select 1");
    } finally {
      connection.release();
    }
  }

  app.addHook("onReady", async () => {
    await connectWithRetry(app, healthCheck, {
      name: options.name,
      maxAttempts: options.maxAttempts,
      delayMs: options.delayMs,
    });
  });

  app.addHook("onClose", async () => {
    app.log.info(options.closeLogMessage);
    await pool.end();
  });
}



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
