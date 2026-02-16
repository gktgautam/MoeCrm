import type { FastifyInstance } from "fastify";
import type { AppRole } from "./auth.types";

export type PermissionRequirement = {
  anyOf?: string[];
  allOf?: string[];
};

export async function getRoleKeyForUser(
  app: FastifyInstance,
  userId: number,
  orgId: number,
): Promise<AppRole | null> {
  const { rows } = await app.dbEngage.query(
    `
      select r.key
      from app_users u
      join app_roles r on r.id = u.role_id
      where u.id = $1 and u.org_id = $2
      limit 1
    `,
    [userId, orgId],
  );

  return ((rows[0] as { key: AppRole } | undefined)?.key ?? null);
}

export async function getPermissionsForUser(
  app: FastifyInstance,
  userId: number,
  orgId: number,
): Promise<string[]> {
  const { rows } = await app.dbEngage.query(
    `
      select p.key
      from app_users u
      join app_roles r on r.id = u.role_id
      join app_role_permissions rp on rp.role_id = r.id
      join app_permissions p on p.id = rp.permission_id
      where u.id = $1 and u.org_id = $2
      order by p.key asc
    `,
    [userId, orgId],
  );

  return (rows as Array<{ key: string }>).map((row) => row.key);
}

export function permissionMatches(grantedPermissions: string[], requiredPermission: string): boolean {
  if (grantedPermissions.includes(requiredPermission)) return true;

  const [resource, action] = requiredPermission.split(":");
  if (action === "read" && grantedPermissions.includes(`${resource}:write`)) return true;

  return false;
}
