import type { FastifyPluginAsync } from "fastify";
import { fetchCustomersUpdatedAfter, upsertCustomerSnapshots } from "./customers.repo.js";

const routes: FastifyPluginAsync = async (app) => {
  // Call this from a cron/worker/jenkins: sync CRM -> Engage
  app.post("/customers/sync", async (req, reply) => {
    const body = req.body as any;
    const orgId = Number(body.orgId);
    const updatedAfter = body.updatedAfter as string | undefined;

    if (!orgId) return reply.code(400).send({ message: "orgId required" });

    const rows = await fetchCustomersUpdatedAfter(app.dbCrm, orgId, updatedAfter);
    const upserted = await upsertCustomerSnapshots(app.dbEngage, rows);

    return { ok: true, fetched: rows.length, upserted };
  });
};

export default routes;
