import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { createUser, fetchRoles, fetchUsers, updateUser, type RoleItem, type UserItem } from "@/core/api/admin";
import PermissionGate from "@/core/rbac/PermissionGate";

const USER_STATUSES = ["invited", "active", "disabled"] as const;

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRoleId, setNewRoleId] = useState<number>(0);

  const roleIdByKey = useMemo(
    () => Object.fromEntries(roles.map((r) => [r.key, r.id])),
    [roles]
  );

  const load = async () => {
    const [usersRes, rolesRes] = await Promise.all([fetchUsers(), fetchRoles()]);
    setUsers(usersRes);
    setRoles(rolesRes);
    if (!newRoleId && rolesRes.length) setNewRoleId(rolesRes[0].id);
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async () => {
    await createUser({ email: newEmail, role_id: newRoleId, status: "invited" });
    setOpenCreate(false);
    setNewEmail("");
    await load();
  };

  const onUpdate = async (
    userId: number,
    payload: { role_id?: number; status?: "invited" | "active" | "disabled" }
  ) => {
    await updateUser(userId, payload);
    await load();
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users</h2>

        <PermissionGate allow={["users:manage"]} mode="any">
          <button
            className="px-4 py-2 bg-primary text-primary-contrast rounded shadow"
            onClick={() => setOpenCreate(true)}
          >
            Add user
          </button>
        </PermissionGate>
      </div>

      {/* Users Table */}
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Created</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border">
              <td className="p-2">{user.email}</td>

              {/* Role Select */}
              <td className="p-2">
                <PermissionGate allow={["users:manage"]} mode="any" fallback={<span>{user.role}</span>}>
                  <RadixSelect
                    value={roleIdByKey[user.role] ?? ""}
                    onChange={(val) => onUpdate(user.id, { role_id: Number(val) })}
                    items={roles.map((r) => ({ value: r.id.toString(), label: r.name }))}
                  />
                </PermissionGate>
              </td>

              {/* Status Select */}
              <td className="p-2">
                <PermissionGate allow={["users:manage"]} mode="any" fallback={<span>{user.status}</span>}>
                  <RadixSelect
                    value={user.status}
                    onChange={(val) =>
                      onUpdate(user.id, { status: val as "invited" | "active" | "disabled" })
                    }
                    items={USER_STATUSES.map((s) => ({ value: s, label: s }))}
                  />
                </PermissionGate>
              </td>

              <td className="p-2">{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Invite User Dialog */}
      <Dialog.Root open={openCreate} onOpenChange={setOpenCreate}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />

          <Dialog.Content className="fixed top-1/2 left-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded-lg p-6 shadow-lg">
            <Dialog.Title className="text-lg font-medium">Invite user</Dialog.Title>

            <div className="mt-4 flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                className="border border-border rounded px-3 py-2"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />

              <RadixSelect
                value={newRoleId.toString()}
                onChange={(val) => setNewRoleId(Number(val))}
                items={roles.map((r) => ({ value: r.id.toString(), label: r.name }))}
              />
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button className="px-4 py-2 border rounded" onClick={() => setOpenCreate(false)}>
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-primary text-primary-contrast rounded disabled:opacity-50"
                disabled={!newEmail || !newRoleId}
                onClick={onCreate}
              >
                Invite
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable Radix Select Component                                    */
/* ------------------------------------------------------------------ */

function RadixSelect({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="w-48 border border-border rounded px-3 py-1 bg-surface text-left">
        <Select.Value />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-surface border border-border rounded shadow-lg">
          <Select.Viewport className="p-1">
            {items.map((item) => (
              <Select.Item
                key={item.value}
                value={item.value}
                className="px-3 py-2 rounded cursor-pointer hover:bg-muted"
              >
                <Select.ItemText>{item.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
