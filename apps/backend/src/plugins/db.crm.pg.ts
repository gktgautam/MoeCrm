// src/plugins/db.crm.pg.ts
import fp from "fastify-plugin";
import { Pool } from "pg";
import { connectWithRetry } from "./_db.retry.js";

declare module "fastify" {
  interface FastifyInstance {
    dbCrm: Pool;
  }
}

export default fp(async (app) => {
  const url = process.env.CRM_DB_URL;
  if (!url) throw new Error("Missing CRM_DB_URL");

  const pool = new Pool({ connectionString: url });

  async function healthCheck() {
    const c = await pool.connect();
    try {
      await c.query("select 1");
    } finally {
      c.release();
    }
  }

  app.decorate("dbCrm", pool);

  app.addHook("onReady", async () => {
    await connectWithRetry(app, healthCheck, {
      name: "crm-db",
      maxAttempts: Number(process.env.DB_CONNECT_ATTEMPTS ?? 5),
      delayMs: Number(process.env.DB_CONNECT_DELAY_MS ?? 800),
    });
  });

  app.addHook("onClose", async () => {
    app.log.info("Closing CRM DB pool...");
    await pool.end();
  });
});
