export function hasPermission(perms: string[], requirement: string) {
  if (perms.includes(requirement)) return true;

  const [resource, action] = requirement.split(":");
  if (resource && action && perms.includes(`${resource}:*`)) return true;

  if (action === "read" && perms.includes(`${resource}:write`)) return true;

  return false;
}
