// src/plugins/db.engage.pg.ts
import fp from "fastify-plugin";
import { Pool } from "pg";
import { connectWithRetry } from "./_db.retry.js";

declare module "fastify" {
  interface FastifyInstance {
    dbEngage: Pool;
  }
}

export default fp(async (app) => {
  const url = process.env.ENGAGE_DB_URL;
  if (!url) throw new Error("Missing ENGAGE_DB_URL");

  const pool = new Pool({ connectionString: url });

  async function healthCheck() {
    const c = await pool.connect();
    try {
      await c.query("select 1");
    } finally {
      c.release();
    }
  }

  app.decorate("dbEngage", pool);

  app.addHook("onReady", async () => {
    await connectWithRetry(app, healthCheck, {
      name: "engage-pg",
      maxAttempts: Number(process.env.DB_CONNECT_ATTEMPTS ?? 5),
      delayMs: Number(process.env.DB_CONNECT_DELAY_MS ?? 800),
    });
  });

  app.addHook("onClose", async () => {
    app.log.info("Closing Engage PG pool...");
    await pool.end();
  });
});
