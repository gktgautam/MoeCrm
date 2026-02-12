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

  // --- Core plugins (before routes) ---
  await app.register(swaggerPlugin);

  await app.register(cookie, {
    secret: env.cookieSecret, // ok even if undefined (only needed for signed cookies)
    hook: "onRequest",
    parseOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      path: "/",
    },
  });

  await app.register(jwtAuthPlugin);

  // --- DB plugins (fail-fast if DB down) ---
  await app.register(dbCrmPlugin);
  await app.register(dbEngagePgPlugin);
  await app.register(dbEngageKnexPlugin);

  // --- Routes ---
  await app.register(routes);

  // --- Central error handler ---
  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err }, "Unhandled error");

    const statusCode = (err as any)?.statusCode;
    if (statusCode && statusCode >= 400 && statusCode < 600) {
      return reply.code(statusCode).send({
        ok: false,
        error: statusCode === 400 ? "BAD_REQUEST" : "REQUEST_ERROR",
      });
    }

    return reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
  });

  return app;
}
