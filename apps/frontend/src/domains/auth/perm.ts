// src/features/auth/perm.ts
export function hasPermission(perms: string[], required: string) {
  if (perms.includes(required)) return true;

  // write => read
  const [res, act] = required.split(":");
  if (act === "read" && perms.includes(`${res}:write`)) return true;

  return false;
}
