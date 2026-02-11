import type { FastifyInstance } from "fastify";

export type DashboardStats = {
  users: number;
  segments: number;
  campaigns: number;
  contacts: number;
};

export async function fetchDashboardStats(app: FastifyInstance, orgId: number): Promise<DashboardStats> {
  const query = `
    select
      (select count(*)::int from app_users where org_id = $1 and deleted_at is null) as users,
      (select count(*)::int from segments where org_id = $1) as segments,
      (select count(*)::int from campaigns where org_id = $1) as campaigns,
      (select count(*)::int from contacts where org_id = $1) as contacts
  `;

  const { rows } = await app.dbEngage.query<DashboardStats>(query, [orgId]);
  return rows[0] ?? { users: 0, segments: 0, campaigns: 0, contacts: 0 };
}
