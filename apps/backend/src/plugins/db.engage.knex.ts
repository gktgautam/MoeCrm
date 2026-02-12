// src/plugins/db.engage.knex.ts
import fp from "fastify-plugin";
import knex from "knex";
import { env } from "../config.env.js";
import { connectWithRetry } from "./_db.retry.js";

declare module "fastify" {
  interface FastifyInstance {
    kEngage: ReturnType<typeof knex>;
  }
}

export default fp(async function dbEngageKnexPlugin(app) {
  const connection = env.engageDbUrl;
  if (!connection) throw new Error("Missing ENGAGE_DB_URL (env.engageDbUrl)");

  const kEngage = knex({
    client: "pg",
    connection,
    pool: { min: 0, max: Number(process.env.KNEX_POOL_MAX ?? 10) },
  });

  app.decorate("kEngage", kEngage);

  app.addHook("onReady", async () => {
    await connectWithRetry(app, async () => {
      await kEngage.raw("select 1");
    }, {
      name: "engage-knex",
      maxAttempts: Number(process.env.DB_CONNECT_ATTEMPTS ?? 5),
      delayMs: Number(process.env.DB_CONNECT_DELAY_MS ?? 800),
    });
  });

  app.addHook("onClose", async () => {
    app.log.info("Destroying Engage Knex...");
    await kEngage.destroy();
  });
});
