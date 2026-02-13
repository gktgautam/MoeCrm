import type { FastifyInstance } from "fastify";
import type { AppRole } from "../auth/auth.types.js";

export type AppUserListItem = {
  id: number;
  org_id: number;
  email: string;
  role: AppRole;
  status: "invited" | "active" | "disabled";
  created_at: string;
};

export async function listUsersByOrg(app: FastifyInstance, orgId: number): Promise<AppUserListItem[]> {
  const { rows } = await app.dbEngage.query<AppUserListItem>(
    `
      select id, org_id, email, role, status, created_at::text
      from app_users
      where org_id = $1 and deleted_at is null
      order by created_at desc
      limit 200
    `,
    [orgId],
  );

  return rows;
}
