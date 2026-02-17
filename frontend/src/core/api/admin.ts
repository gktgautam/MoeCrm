import { api } from "@/core/http/api";

export type PermissionItem = {
  id: number;
  key: string;
  module: string;
  action: string;
  description: string | null;
};

export type RoleItem = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  permissions: string[];
};

export type UserItem = {
  id: number;
  email: string;
  role: string;
  status: "invited" | "active" | "disabled";
  created_at: string;
};

export async function fetchPermissions() {
  const { data } = await api.get("/permissions");
  return data.data.permissions as PermissionItem[];
}

export async function fetchRoles() {
  const { data } = await api.get("/roles");
  return data.data.roles as RoleItem[];
}

export async function createRole(payload: { key: string; name: string; description?: string }) {
  const { data } = await api.post("/roles", payload);
  return data.data.role as RoleItem;
}

export async function updateRole(roleId: number, payload: { key?: string; name?: string; description?: string | null }) {
  const { data } = await api.patch(`/roles/${roleId}`, payload);
  return data.data.role as RoleItem;
}

export async function replaceRolePermissions(roleId: number, permissionIds: number[]) {
  const { data } = await api.put(`/roles/${roleId}/permissions`, { permissionIds });
  return data.data.role as RoleItem;
}

export async function fetchUsers() {
  const { data } = await api.get("/users");
  return data.data.users as UserItem[];
}

export async function createUser(payload: {
  email: string;
  role_id: number;
  status?: "invited" | "active" | "disabled";
}) {
  const { data } = await api.post("/users", payload);
  return data.data.user as UserItem;
}

export async function updateUser(
  userId: number,
  payload: { role_id?: number; status?: "invited" | "active" | "disabled" },
) {
  const { data } = await api.patch(`/users/${userId}`, payload);
  return data.data.user as UserItem;
}
