import fp from "fastify-plugin";
import { Pool } from "pg";
import { env } from "@/core/config/env";
import { createPostgresPool, registerPostgresPoolLifecycle } from "./postgres-pool.js";

declare module "fastify" {
  interface FastifyInstance {
    dbCrm: Pool;
  }
}

export default fp(async (app) => {
  if (!env.CRM_DB_URL) throw new Error("Missing CRM_DB_URL");

  const pool = createPostgresPool(env.CRM_DB_URL);
  app.decorate("dbCrm", pool);

  registerPostgresPoolLifecycle(app, pool, {
    name: "crm-db",
    maxAttempts: Number(env.DB_CONNECT_ATTEMPTS ?? 5),
    delayMs: Number(env.DB_CONNECT_DELAY_MS ?? 800),
    closeLogMessage: "Closing CRM DB pool...",
  });
});
