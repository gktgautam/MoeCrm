// src/plugins/db.engage.pg.ts
import fp from "fastify-plugin";
import { Pool } from "pg";
import { connectWithRetry } from "./_db.retry.js";

declare module "fastify" {
  interface FastifyInstance {
    dbEngage: Pool;
  }
}

function makePool(url: string) {
  return new Pool({
    connectionString: url,
    max: Number(process.env.PG_POOL_MAX ?? 5),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS ?? 5000),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 30000),
  });
}

async function healthCheck(pool: Pool) {
  const c = await pool.connect();
  try {
    await c.query("select 1");
  } finally {
    c.release();
  }
}

export default fp(async (app) => {
  const engageUrl = process.env.ENGAGE_DB_URL;
  if (!engageUrl) throw new Error("Missing ENGAGE_DB_URL");

  const dbEngage = makePool(engageUrl);
  app.decorate("dbEngage", dbEngage);

  app.addHook("onReady", async () => {
    await connectWithRetry("ENGAGE_DB_PG", () => healthCheck(dbEngage), app.log);
  });

  app.addHook("onClose", async () => {
    await Promise.allSettled([dbEngage.end()]);
  });
});
