import type { FastifyInstance } from "fastify";
import { Pool } from "pg";
import { connectWithRetry } from "./db-retry.js";

type RegisterPostgresPoolOptions = {
  name: string;
  closeLogMessage: string;
  maxAttempts: number;
  delayMs: number;
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
