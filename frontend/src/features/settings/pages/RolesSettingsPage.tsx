import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import PermissionGate from "@/core/rbac/PermissionGate";

import {
  createRole,
  fetchPermissions,
  fetchRoles,
  replaceRolePermissions,
  updateRole,
  type PermissionItem,
  type RoleItem,
} from "@/core/api/admin";

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [openCreate, setOpenCreate] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [roleKey, setRoleKey] = useState("");

  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const load = async () => {
    const [rolesRes, permissionsRes] = await Promise.all([
      fetchRoles(),
      fetchPermissions(),
    ]);
    setRoles(rolesRes);
    setPermissions(permissionsRes);
  };

  useEffect(() => {
    void load();
  }, []);

  const permissionIdByKey = useMemo(
    () => Object.fromEntries(permissions.map((p) => [p.key, p.id])),
    [permissions]
  );

  const onCreate = async () => {
    await createRole({ key: roleKey, name: roleName });
    setRoleKey("");
    setRoleName("");
    setOpenCreate(false);
    await load();
  };

  const openEditor = (role: RoleItem) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions);
  };

  const onSavePermissions = async () => {
    if (!selectedRole) return;

    const permissionIds = selectedPermissions
      .map((k) => permissionIdByKey[k])
      .filter(Boolean);

    await replaceRolePermissions(selectedRole.id, permissionIds);
    setSelectedRole(null);
    await load();
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Roles</h2>

        <PermissionGate allow={["roles:manage"]} mode="any">
          <button
            className="px-4 py-2 bg-primary text-primary-contrast rounded-md shadow"
            onClick={() => setOpenCreate(true)}
          >
            Create role
          </button>
        </PermissionGate>
      </div>

      {/* Table */}
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="p-2">Key</th>
            <th className="p-2">Name</th>
            <th className="p-2">System</th>
            <th className="p-2">Permissions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="border-b border-border">
              <td className="p-2">{role.key}</td>

              {/* Editable Role Name */}
              <td className="p-2">
                <PermissionGate
                  allow={["roles:manage"]}
                  mode="any"
                  fallback={<span>{role.name}</span>}
                >
                  <input
                    className="w-60 border border-border rounded px-2 py-1"
                    value={role.name}
                    onChange={async (event) => {
                      await updateRole(role.id, { name: event.target.value });
                      await load();
                    }}
                  />
                </PermissionGate>
              </td>

              <td className="p-2">{role.is_system ? "Yes" : "No"}</td>

              <td className="p-2">
                <button
                  className="px-3 py-1 text-sm bg-surface border rounded"
                  onClick={() => openEditor(role)}
                >
                  Edit permissions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Role Dialog */}
      <Dialog.Root open={openCreate} onOpenChange={setOpenCreate}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 bg-surface p-5 rounded-lg shadow-lg border border-border">
            <Dialog.Title className="text-lg font-medium">Create role</Dialog.Title>

            <div className="mt-4 flex flex-col gap-3">
              <input
                placeholder="Role key"
                className="border border-border rounded px-3 py-2"
                value={roleKey}
                onChange={(e) => setRoleKey(e.target.value)}
              />
              <input
                placeholder="Role name"
                className="border border-border rounded px-3 py-2"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setOpenCreate(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-primary text-primary-contrast rounded disabled:opacity-50"
                disabled={!roleKey || !roleName}
                onClick={onCreate}
              >
                Create
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Permission Editor Dialog */}
      <Dialog.Root
        open={!!selectedRole}
        onOpenChange={() => setSelectedRole(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[600px] -translate-x-1/2 -translate-y-1/2 bg-surface p-6 rounded-lg shadow-lg border border-border">
            <Dialog.Title className="text-lg font-medium">
              Edit permissions: {selectedRole?.name}
            </Dialog.Title>

            <div className="mt-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2">
              {permissions.map((permission) => (
                <label key={permission.id} className="flex items-center gap-3">
                  <Checkbox.Root
                    checked={selectedPermissions.includes(permission.key)}
                    onCheckedChange={(checked) => {
                      setSelectedPermissions((current) =>
                        checked
                          ? [...current, permission.key]
                          : current.filter((k) => k !== permission.key)
                      );
                    }}
                    className="w-4 h-4 border border-border rounded grid place-items-center"
                  >
                    <Checkbox.Indicator>✔</Checkbox.Indicator>
                  </Checkbox.Root>

                  <span>
                    {permission.key} — {permission.description ?? ""}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setSelectedRole(null)}
              >
                Cancel
              </button>

              <PermissionGate allow={["roles:manage"]} mode="any">
                <button
                  className="px-4 py-2 bg-primary text-primary-contrast rounded"
                  onClick={onSavePermissions}
                >
                  Save
                </button>
              </PermissionGate>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
