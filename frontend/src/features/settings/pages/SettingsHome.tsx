import { Stack, Typography } from "@mui/material";

export default function SettingsHome() {
  return (
    <Stack spacing={1}>
      <Typography variant="h5">Settings</Typography>
      <Typography variant="body2">Use the Users and Roles sections from the sidebar to manage access.</Typography>
    </Stack>
  );
}
