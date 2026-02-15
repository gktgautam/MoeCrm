import { useEffect, useMemo, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import type { AlertColor } from "@mui/material/Alert";

import { subscribeToast, type ToastPayload } from "@/core/ui/toast";

type QueueItem = Required<ToastPayload> & { key: number };

function asAlertColor(v?: ToastPayload["variant"]): AlertColor {
  if (v === "success" || v === "error" || v === "warning" || v === "info") return v;
  return "info";
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [open, setOpen] = useState(false);

  const active = queue[0];

  useEffect(() => {
    return subscribeToast((t) => {
      const item: QueueItem = {
        key: Date.now() + Math.floor(Math.random() * 1000),
        message: t.message,
        variant: t.variant ?? "info",
        autoHideMs: t.autoHideMs ?? 3500,
      };

      setQueue((prev) => [...prev, item]);
      setOpen(true);
    });
  }, []);

  const handleClose = (_?: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleExited = () => {
    setQueue((prev) => prev.slice(1));
  };

  const severity = useMemo(() => asAlertColor(active?.variant), [active]);

  return (
    <>
      {children}
      <Snackbar
        open={open && Boolean(active)}
        autoHideDuration={active?.autoHideMs ?? 3500}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
          {active?.message ?? ""}
        </Alert>
      </Snackbar>
    </>
  );
}
