import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import { getApiErrorMessage, getApiRequestId } from "@/core/api/api-error";

export default function RouteError() {
  const err = useRouteError();

  // React Router thrown response (404/500 loaders etc.)
  if (isRouteErrorResponse(err)) {
    return (
      <Stack sx={{ minHeight: "100vh" }} alignItems="center" justifyContent="center" p={2}>
        <Paper sx={{ p: 3, maxWidth: 560, width: "100%" }} elevation={2}>
          <Typography variant="h6" fontWeight={700}>
            Something went wrong
          </Typography>
          <Typography sx={{ mt: 1 }} color="text.secondary">
            {err.status} {err.statusText}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button variant="outlined" onClick={() => (window.location.href = "/")}>
              Go to dashboard
            </Button>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  const message = getApiErrorMessage(err);
  const requestId = getApiRequestId(err);

  return (
    <Stack sx={{ minHeight: "100vh" }} alignItems="center" justifyContent="center" p={2}>
      <Paper sx={{ p: 3, maxWidth: 560, width: "100%" }} elevation={2}>
        <Typography variant="h6" fontWeight={700}>
          Unexpected error
        </Typography>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          {message}
        </Typography>

        {requestId ? (
          <Typography sx={{ mt: 1 }} color="text.secondary" fontSize={12}>
            RequestId: {requestId}
          </Typography>
        ) : null}

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button variant="outlined" onClick={() => (window.location.href = "/")}>
            Go to dashboard
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
