import type { FastifyInstance } from "fastify";

export type AppUserListItem = {
  id: number;
  org_id: number;
  email: string;
  role: string;
  status: "invited" | "active" | "disabled";
  created_at: string;
};

export async function listUsersByOrg(app: FastifyInstance, orgId: number): Promise<AppUserListItem[]> {
  const { rows } = await app.dbEngage.query<AppUserListItem>(
    `
      select u.id, u.org_id, u.email, r.role_key as role, u.status, u.created_at::text
      from app_users u
      join rbac_roles r on r.id = u.role_id
      where u.org_id = $1 and u.deleted_at is null
      order by u.created_at desc
      limit 200
    `,
    [orgId],
  );

  return rows;
}
