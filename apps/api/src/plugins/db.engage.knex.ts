// src/plugins/db.engage.knex.ts
import fp from "fastify-plugin";
import knex, { type Knex } from "knex";
import { connectWithRetry } from "./_db.retry.js";

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
      max: Number(process.env.PG_POOL_MAX ?? 5),
    },
  });
}

async function healthCheck(k: Knex) {
  await k.raw("select 1");
}

export default fp(async (app) => {
  const engageUrl = process.env.ENGAGE_DB_URL;
  if (!engageUrl) throw new Error("Missing ENGAGE_DB_URL");

  const kEngage = makeKnex(engageUrl);
  app.decorate("kEngage", kEngage);

  app.addHook("onReady", async () => {
    await connectWithRetry("ENGAGE_DB_KNEX", () => healthCheck(kEngage), app.log);
  });

  app.addHook("onClose", async () => {
    await Promise.allSettled([kEngage.destroy()]);
  });
});
