import type { FastifyInstance } from "fastify";

export type PermissionRequirement = {
  anyOf?: string[];
  allOf?: string[];
};

export async function fetchPermissionsForRole(app: FastifyInstance, roleKey: string): Promise<string[]> {
  const { rows } = await app.dbEngage.query(
    `
      select p.key
      from app_role_permissions rp
      join app_roles r on r.id = rp.role_id
      join app_permissions p on p.id = rp.permission_id
      where r.key = $1
      order by p.key asc
    `,
    [roleKey],
  );

  return (rows as Array<{ key: string }>).map((row) => row.key);
}

export function permissionMatches(grantedPermissions: string[], requiredPermission: string): boolean {
  if (grantedPermissions.includes(requiredPermission)) return true;

  const [resource, action] = requiredPermission.split(":");
  if (action === "read" && grantedPermissions.includes(`${resource}:write`)) return true;

  return false;
}
