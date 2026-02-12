import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";

import swaggerPlugin from "./plugins/swagger.js";
import jwtAuthPlugin from "./plugins/jwt.auth.js";
import dbCrmPlugin from "./plugins/db.crm.pg.js";
import dbEngagePgPlugin from "./plugins/db.engage.pg.js";
import dbEngageKnexPlugin from "./plugins/db.engage.knex.js";

import routes from "./routes.js";
import { env } from "./config.env.js";
import { makeLoggerConfig } from "./lib/logger.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: makeLoggerConfig(env.isProd) });

  await app.register(swaggerPlugin);
  await app.register(cookie, { secret: env.cookieSecret });
  await app.register(jwtAuthPlugin);

  await app.register(dbCrmPlugin);
  await app.register(dbEngagePgPlugin);
  await app.register(dbEngageKnexPlugin);

  await app.register(routes);

  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err }, "Unhandled error");
    reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
  });

  return app;
}
