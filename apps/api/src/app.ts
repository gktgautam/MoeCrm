// src/app.ts
import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";

import swaggerPlugin from "./plugins/swagger.js";
import jwtAuthPlugin from "./plugins/jwt.auth.js";

import dbCrm from "./plugins/db.crm.pg.js";
import dbEngagePg from "./plugins/db.engage.pg.js";
import dbEngageKnex from "./plugins/db.engage.knex.js";

import routes from "./routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const isProd = process.env.NODE_ENV === "production";

// in src/app.ts (dev logger branch)
  const app = Fastify({
    logger: isProd
      ? true
      : {
          level: "debug",
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
              messageKey: "msg",
              errorLikeObjectKeys: ["err", "error"],
            },
          },
          serializers: {
            err: (err: unknown) => {
              const e: any = err;

              const causes =
                Array.isArray(e?.aggregateErrors)
                  ? e.aggregateErrors.map((c: any) => ({
                      code: c?.code,
                      message: c?.message,
                      address: c?.address,
                      port: c?.port,
                    }))
                  : undefined;

              return {
                type: e?.name ?? "Error",
                code: e?.code,
                message: e?.message ?? "",
                causes,
                stack: e?.stack ?? "", // ✅ must be string
              };
            },
          },
        },
  });

  // Swagger (OpenAPI)
  await app.register(swaggerPlugin);

  // Cookies (needed for JWT cookie auth)
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) throw new Error("Missing COOKIE_SECRET");
  await app.register(cookie, { secret: cookieSecret });

  // JWT auth helpers (cookie-based)
  await app.register(jwtAuthPlugin);

  // DB plugins first
  await app.register(dbCrm);
  await app.register(dbEngagePg);
  await app.register(dbEngageKnex); // optional but you said you want it

  // Routes
  await app.register(routes);

  // Central error handler (nice for API)
  app.setErrorHandler((err, req, reply) => {
    req.log.error({ err }, "Unhandled error");
    reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
  });

  return app;
}
