import type { FastifyInstance } from "fastify";

export type PermissionRequirement = {
  anyOf?: string[];
  allOf?: string[];
};

export async function fetchPermissionsForUser(
  app: FastifyInstance,
  args: { userId: number; orgId: number },
): Promise<string[]> {
  const { rows } = await app.dbEngage.query(
    `
      select distinct p.key
      from app_user_roles ur
      join app_roles r on r.id = ur.role_id
      join app_role_permissions rp on rp.role_id = r.id
      join app_permissions p on p.id = rp.permission_id
      where ur.user_id = $1
        and (r.org_id is null or r.org_id = $2)
      order by p.key asc
    `,
    [args.userId, args.orgId],
  );

  return (rows as Array<{ key: string }>).map((row) => row.key);
}

export async function fetchRoleKeysForUser(
  app: FastifyInstance,
  args: { userId: number; orgId: number },
): Promise<string[]> {
  const { rows } = await app.dbEngage.query(
    `
      select distinct r.key
      from app_user_roles ur
      join app_roles r on r.id = ur.role_id
      where ur.user_id = $1
        and (r.org_id is null or r.org_id = $2)
      order by r.key asc
    `,
    [args.userId, args.orgId],
  );

  return (rows as Array<{ key: string }>).map((row) => row.key);
}

export async function assertRoleAssignableToOrg(
  app: FastifyInstance,
  args: { roleId: number; userOrgId: number },
): Promise<void> {
  const { rows } = await app.dbEngage.query(
    `
      select id
      from app_roles
      where id = $1
        and (org_id is null or org_id = $2)
      limit 1
    `,
    [args.roleId, args.userOrgId],
  );

  if (!rows[0]) {
    throw new Error("Role is not assignable to the target user's org");
  }
}

export function permissionMatches(grantedPermissions: string[], requiredPermission: string): boolean {
  if (grantedPermissions.includes(requiredPermission)) return true;

  const [resource, action] = requiredPermission.split(":");
  if (action === "read" && grantedPermissions.includes(`${resource}:write`)) return true;

  return false;
}
