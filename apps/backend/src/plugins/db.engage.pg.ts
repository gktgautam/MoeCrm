import fp from "fastify-plugin";
import { Pool } from "pg";
import { env } from "@/env";
import { createPostgresPool, registerPostgresPoolLifecycle } from "./postgres-pool.js";

declare module "fastify" {
  interface FastifyInstance {
    dbEngage: Pool;
  }
}

export default fp(async (app) => {
  if (!env.ENGAGE_DB_URL) throw new Error("Missing ENGAGE_DB_URL");

  const pool = createPostgresPool(env.ENGAGE_DB_URL);
  app.decorate("dbEngage", pool);

  registerPostgresPoolLifecycle(app, pool, {
    name: "engage-pg",
    maxAttempts: Number(env.DB_CONNECT_ATTEMPTS ?? 5),
    delayMs: Number(env.DB_CONNECT_DELAY_MS ?? 800),
    closeLogMessage: "Closing Engage PG pool...",
  });
});
