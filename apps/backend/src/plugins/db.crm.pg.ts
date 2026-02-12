import fp from "fastify-plugin";
import { Pool } from "pg";
import { connectWithRetry } from "./_db.retry.js";
import { env } from "../config.env.js";

export default fp(async function dbCrmPlugin(app) {
  const connectionString = env.crmDbUrl;

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  const healthCheck = async () => {
    const client = await pool.connect();
    try {
      await client.query("select 1");
    } finally {
      client.release();
    }
  };

  await connectWithRetry(app, healthCheck, {
    name: "crm-db",
    retries: 5,
    delayMs: 2000,
  });

  app.decorate("crmDb", pool);

  app.addHook("onClose", async () => {
    app.log.info("Closing CRM DB pool...");
    await pool.end();
  });
});
