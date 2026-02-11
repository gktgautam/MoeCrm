// src/plugins/db.crm.pg.ts
import fp from "fastify-plugin";
import { Pool } from "pg";
import { connectWithRetry } from "./_db.retry.js";

declare module "fastify" {
  interface FastifyInstance {
    dbCrm: Pool;
  }
}

function makePool(url: string) {
  return new Pool({
    connectionString: url,
    max: Number(process.env.PG_POOL_MAX ?? 5),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS ?? 5000),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 30000),
    // ssl: { rejectUnauthorized: false },
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
  const crmUrl = process.env.CRM_DB_URL;
  if (!crmUrl) throw new Error("Missing CRM_DB_URL");

  const dbCrm = makePool(crmUrl);
  app.decorate("dbCrm", dbCrm);

  app.addHook("onReady", async () => {
    await connectWithRetry("CRM_DB", () => healthCheck(dbCrm), app.log);
  });

  app.addHook("onClose", async () => {
    await Promise.allSettled([dbCrm.end()]);
  });
});
