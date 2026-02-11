import fp from "fastify-plugin";
import { Pool } from "pg";
import { connectWithRetry } from "./_db.retry.js";
import { env } from "../config.env.js";

declare module "fastify" {
  interface FastifyInstance {
    dbCrm: Pool;
  }
}

function makePool(url: string) {
  return new Pool({
    connectionString: url,
    max: env.pgPoolMax,
    connectionTimeoutMillis: env.pgConnTimeoutMs,
    idleTimeoutMillis: env.pgIdleTimeoutMs,
  });
}

async function healthCheck(pool: Pool) {
  const client = await pool.connect();
  try {
    await client.query("select 1");
  } finally {
    client.release();
  }
}

export default fp(async (app) => {
  const dbCrm = makePool(env.crmDbUrl);
  app.decorate("dbCrm", dbCrm);

  app.addHook("onReady", async () => {
    await connectWithRetry("CRM_DB", () => healthCheck(dbCrm), app.log);
  });

  app.addHook("onClose", async () => {
    await dbCrm.end();
  });
});
