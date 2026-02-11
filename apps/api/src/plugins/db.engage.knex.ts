import fp from "fastify-plugin";
import knex, { type Knex } from "knex";
import { connectWithRetry } from "./_db.retry.js";
import { env } from "../config.env.js";

declare module "fastify" {
  interface FastifyInstance {
    kEngage: Knex;
  }
}

function makeKnex(url: string) {
  return knex({
    client: "pg",
    connection: url,
    pool: {
      min: 0,
      max: env.pgPoolMax,
    },
  });
}

async function healthCheck(k: Knex) {
  await k.raw("select 1");
}

export default fp(async (app) => {
  const kEngage = makeKnex(env.engageDbUrl);
  app.decorate("kEngage", kEngage);

  app.addHook("onReady", async () => {
    await connectWithRetry("ENGAGE_DB_KNEX", () => healthCheck(kEngage), app.log);
  });

  app.addHook("onClose", async () => {
    await kEngage.destroy();
  });
});
