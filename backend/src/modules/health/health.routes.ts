import type { FastifyPluginAsync } from "fastify";
import { Errors } from "@/core/http/app-error";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ ok: true, data: { status: "ok" } }));

  app.get("/health/db", async () => {
    try {
      const crm = await app.dbCrm.query("select 1 as ok");
      const engage = await app.dbEngage.query("select 1 as ok");
      return {
        ok: true,
        data: { crm: crm.rows[0]?.ok === 1, engage: engage.rows[0]?.ok === 1 },
      };
    } catch {
      throw Errors.serviceUnavailable("Database health check failed");
    }
  });
};

export default healthRoutes;
