import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  createRole,
  fetchPermissions,
  fetchRoles,
  replaceRolePermissions,
  updateRole,
  type PermissionItem,
  type RoleItem,
} from "@/core/api/admin";
import PermissionGate from "@/core/rbac/PermissionGate";

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleKey, setRoleKey] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const permissionIdByKey = useMemo(
    () => Object.fromEntries(permissions.map((permission) => [permission.key, permission.id])),
    [permissions],
  );

  const load = async () => {
    const [rolesRes, permissionsRes] = await Promise.all([fetchRoles(), fetchPermissions()]);
    setRoles(rolesRes);
    setPermissions(permissionsRes);
  };

  useEffect(() => {
    void load();
  }, []);

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
      .map((permissionKey) => permissionIdByKey[permissionKey])
      .filter((permissionId): permissionId is number => Boolean(permissionId));

    await replaceRolePermissions(selectedRole.id, permissionIds);
    setSelectedRole(null);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Roles</Typography>
        <PermissionGate allow={["roles:manage"]} mode="any">
          <Button variant="contained" onClick={() => setOpenCreate(true)}>Create role</Button>
        </PermissionGate>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>System</TableCell>
            <TableCell>Permissions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.key}</TableCell>
              <TableCell>
                <PermissionGate allow={["roles:manage"]} mode="any" fallback={<>{role.name}</>}>
                  <TextField
                    size="small"
                    value={role.name}
                    onChange={async (event) => {
                      await updateRole(role.id, { name: event.target.value });
                      await load();
                    }}
                  />
                </PermissionGate>
              </TableCell>
              <TableCell>{role.is_system ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Button onClick={() => openEditor(role)} size="small">Edit permissions</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Role key" value={roleKey} onChange={(event) => setRoleKey(event.target.value)} />
            <TextField label="Role name" value={roleName} onChange={(event) => setRoleName(event.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={onCreate} variant="contained" disabled={!roleKey || !roleName}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedRole)} onClose={() => setSelectedRole(null)} fullWidth maxWidth="md">
        <DialogTitle>Edit role permissions: {selectedRole?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} mt={1}>
            {permissions.map((permission) => (
              <FormControlLabel
                key={permission.id}
                control={
                  <Checkbox
                    checked={selectedPermissions.includes(permission.key)}
                    onChange={(_event, checked) => {
                      setSelectedPermissions((current) =>
                        checked
                          ? [...current, permission.key]
                          : current.filter((key) => key !== permission.key),
                      );
                    }}
                  />
                }
                label={`${permission.key} — ${permission.description ?? ""}`}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRole(null)}>Cancel</Button>
          <PermissionGate allow={["roles:manage"]} mode="any">
            <Button onClick={onSavePermissions} variant="contained">Save</Button>
          </PermissionGate>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
