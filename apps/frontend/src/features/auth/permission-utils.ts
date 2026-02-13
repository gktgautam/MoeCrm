/**
 * Returns true when a user has the requested permission.
 *
 * Permission inheritance rule:
 * - `<resource>:write` implies `<resource>:read`
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
) {
  if (userPermissions.includes(requiredPermission)) return true;

  const [resource, action] = requiredPermission.split(":");
  if (action === "read" && userPermissions.includes(`${resource}:write`)) {
    return true;
  }

  return false;
}
