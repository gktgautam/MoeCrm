import type { FastifyInstance } from "fastify";

export type DashboardStats = {
  users: number;
  segments: number;
  campaigns: number;
  contacts: number;
};

export async function fetchDashboardStats(app: FastifyInstance): Promise<DashboardStats> {
  const query = `
    select
      (select count(*)::int from app_users where deleted_at is null) as users,
      (select count(*)::int from segments) as segments,
      (select count(*)::int from campaigns) as campaigns,
      (select count(*)::int from contacts) as contacts
  `;

  const { rows } = await app.dbEngage.query<DashboardStats>(query);
  return rows[0] ?? { users: 0, segments: 0, campaigns: 0, contacts: 0 };
}
