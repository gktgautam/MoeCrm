import type { FastifyPluginAsync } from "fastify";
import { AppError } from "@/core/http/error-handling";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ ok: true }));

  app.get("/health/db", async (req, reply) => {
    try {
      const crm = await app.dbCrm.query("select 1 as ok");
      const engage = await app.dbEngage.query("select 1 as ok");
      return { ok: true, crm: crm.rows[0]?.ok === 1, engage: engage.rows[0]?.ok === 1 };
    } catch (err) {
      app.log.error({ err }, "DB health failed");
      throw new AppError({ statusCode: 503, code: "SERVICE_UNAVAILABLE", message: "Database health check failed" });
    }
  });
};

export default healthRoutes;
