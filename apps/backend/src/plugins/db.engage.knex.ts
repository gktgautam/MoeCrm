import fp from "fastify-plugin";
import knex from "knex";
import { env } from "../config.env.js";
import { connectWithRetry } from "./_db.retry.js";

export default fp(async function dbEngageKnexPlugin(app) {
  const connection = env.engageDbUrl;

  const db = knex({
    client: "pg",
    connection,
    pool: { min: 2, max: 10 },
  });

  await connectWithRetry(app, async () => {
    await db.raw("select 1");
  }, {
    name: "engage-knex",
    retries: 5,
    delayMs: 2000,
  });

  app.decorate("engageKnex", db);

  app.addHook("onClose", async () => {
    app.log.info("Destroying Engage Knex...");
    await db.destroy();
  });
});
