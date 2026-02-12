import type { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ ok: true }));

  app.get("/health/db", async (req, reply) => {
    try {
      const crm = await app.dbCrm.query("select 1 as ok");
      const engage = await app.dbEngage.query("select 1 as ok");
      return { ok: true, crm: crm.rows[0]?.ok === 1, engage: engage.rows[0]?.ok === 1 };
    } catch (err) {
      app.log.error({ err }, "DB health failed");
      return reply.code(500).send({ ok: false });
    }
  });
};

export default healthRoutes;
