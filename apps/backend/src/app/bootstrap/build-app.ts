import Fastify, { type FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import cors from "@fastify/cors";

import cookie from "@fastify/cookie";

import swaggerPlugin from "@/core/plugins/swagger";
import jwtAuthPlugin from "@/core/plugins/jwt.auth";
import dbCrmPlugin from "@/core/plugins/db.crm.pg";
import dbEngagePgPlugin from "@/core/plugins/db.engage.pg";
import dbEngageKnexPlugin from "@/core/plugins/db.engage.knex";

import routes from "@/app/http/register-routes";
import { env } from "@/core/config/env";
import { makeLoggerConfig } from "@/core/logging/logger";
import { makeApiErrorPayload, mapErrorToHttp } from "@/core/http/error-handling";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: makeLoggerConfig(env.ISPROD) }).withTypeProvider<TypeBoxTypeProvider>();

  // --- Core plugins (before routes) ---
  await app.register(swaggerPlugin);

  // CORS MUST be before routes
  await app.register(cors, {
    origin: (origin, cb) => {
      // allow non-browser clients (curl/postman) where origin is undefined
      if (!origin) return cb(null, true);

      const allowlist = new Set([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ]);

      cb(null, allowlist.has(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

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

  // --- DB plugins (fail-fast if DB down) ---
  // await app.register(dbCrmPlugin);
  await app.register(dbEngagePgPlugin);
  await app.register(dbEngageKnexPlugin);

  // --- Routes ---
  await app.register(routes);

  app.setNotFoundHandler((req, reply) => {
    return reply.code(404).send(
      makeApiErrorPayload(req.id, {
        code: "NOT_FOUND",
        message: `Route not found: ${req.method} ${req.url}`,
      }),
    );
  });

  app.addHook("onResponse", async (req, reply) => {
    req.log.info(
      {
        requestId: req.id,
        method: req.method,
        path: req.routeOptions.url,
        url: req.url,
        statusCode: reply.statusCode,
        responseTimeMs: reply.elapsedTime,
      },
      "request completed",
    );
  });

  // --- Central error handler ---
  app.setErrorHandler((err, req, reply) => {
    const mapped = mapErrorToHttp(err, req);

    const logger = mapped.level === "error" ? req.log.error.bind(req.log) : req.log.warn.bind(req.log);
    logger(
      {
        err,
        requestId: req.id,
        method: req.method,
        url: req.url,
        statusCode: mapped.statusCode,
      },
      "request failed",
    );

    if (reply.sent) {
      return;
    }

    return reply.code(mapped.statusCode).send(mapped.payload);
  });

  return app;
}
