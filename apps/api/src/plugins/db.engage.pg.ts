import fp from "fastify-plugin";
import { Pool } from "pg";
import { connectWithRetry } from "./_db.retry.js";
import { env } from "../config.env.js";

declare module "fastify" {
  interface FastifyInstance {
    dbEngage: Pool;
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
  const dbEngage = makePool(env.engageDbUrl);
  app.decorate("dbEngage", dbEngage);

  app.addHook("onReady", async () => {
    await connectWithRetry("ENGAGE_DB_PG", () => healthCheck(dbEngage), app.log);
  });

  app.addHook("onClose", async () => {
    await dbEngage.end();
  });
});
