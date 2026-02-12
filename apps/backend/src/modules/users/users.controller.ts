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

export async function upsertUserPermissionOverride(args: {
  app: FastifyInstance;
  orgId: number;
  userId: number;
  permissionCode: string;
  isAllowed: boolean;
}) {
  await args.app.dbEngage.query(
    `
      insert into app_user_permission_overrides (user_id, permission_code, is_allowed)
      select u.id, $3, $4
      from app_users u
      where u.id = $1 and u.org_id = $2 and u.deleted_at is null
      on conflict (user_id, permission_code)
      do update set is_allowed = excluded.is_allowed, updated_at = now()
    `,
    [args.userId, args.orgId, args.permissionCode, args.isAllowed],
  );
}

export async function clearUserPermissionOverride(args: {
  app: FastifyInstance;
  orgId: number;
  userId: number;
  permissionCode: string;
}) {
  await args.app.dbEngage.query(
    `
      delete from app_user_permission_overrides p
      using app_users u
      where p.user_id = u.id
        and u.id = $1
        and u.org_id = $2
        and p.permission_code = $3
    `,
    [args.userId, args.orgId, args.permissionCode],
  );
}
