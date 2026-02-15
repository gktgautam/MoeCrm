import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { createUser, fetchRoles, fetchUsers, updateUser, type RoleItem, type UserItem } from "@/core/api/admin";
import PermissionGate from "@/core/rbac/PermissionGate";

const USER_STATUSES = ["invited", "active", "disabled"] as const;

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRoleId, setNewRoleId] = useState<number>(0);

  const roleIdByKey = useMemo(() => Object.fromEntries(roles.map((role) => [role.key, role.id])), [roles]);

  const load = async () => {
    const [usersRes, rolesRes] = await Promise.all([fetchUsers(), fetchRoles()]);
    setUsers(usersRes);
    setRoles(rolesRes);
    if (!newRoleId && rolesRes[0]) setNewRoleId(rolesRes[0].id);
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

  const onUpdate = async (userId: number, payload: { role_id?: number; status?: "invited" | "active" | "disabled" }) => {
    await updateUser(userId, payload);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Users</Typography>
        <PermissionGate allow={["users:manage"]} mode="any">
          <Button variant="contained" onClick={() => setOpenCreate(true)}>Add user</Button>
        </PermissionGate>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <PermissionGate allow={["users:manage"]} mode="any" fallback={<>{user.role}</>}>
                  <Select
                    size="small"
                    value={roleIdByKey[user.role] ?? ""}
                    onChange={(event) => onUpdate(user.id, { role_id: Number(event.target.value) })}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                    ))}
                  </Select>
                </PermissionGate>
              </TableCell>
              <TableCell>
                <PermissionGate allow={["users:manage"]} mode="any" fallback={<>{user.status}</>}>
                  <Select
                    size="small"
                    value={user.status}
                    onChange={(event) =>
                      onUpdate(user.id, { status: event.target.value as "invited" | "active" | "disabled" })
                    }
                  >
                    {USER_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </PermissionGate>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Invite user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
            <Select value={newRoleId} onChange={(event) => setNewRoleId(Number(event.target.value))}>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
              ))}
            </Select>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={onCreate} variant="contained" disabled={!newEmail || !newRoleId}>Invite</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
