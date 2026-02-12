import Fastify, { type FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import cookie from "@fastify/cookie";

import swaggerPlugin from "./plugins/swagger.js";
import jwtAuthPlugin from "./plugins/jwt.auth.js";
import dbCrmPlugin from "./plugins/db.crm.pg.js";
import dbEngagePgPlugin from "./plugins/db.engage.pg.js";
import dbEngageKnexPlugin from "./plugins/db.engage.knex.js";

import routes from "./routes.js";
import { env } from "@/env";
import { makeLoggerConfig } from "./lib/logger.js";

export async function buildApp(): Promise<FastifyInstance> {
  // IMPORTANT: attach the TypeBox type provider here
  const app = Fastify({ logger: makeLoggerConfig(env.ISPROD) })
    .withTypeProvider<TypeBoxTypeProvider>();

  // --- Core plugins ---
  await app.register(swaggerPlugin);

  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
    hook: "onRequest",
    parseOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.ISPROD,
      path: "/",
    },
  });

  await app.register(jwtAuthPlugin);

  // --- DB plugins ---
  await app.register(dbCrmPlugin);
  await app.register(dbEngagePgPlugin);
  await app.register(dbEngageKnexPlugin);

  // --- Routes ---
  await app.register(routes);

  // --- Error handler ---
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
