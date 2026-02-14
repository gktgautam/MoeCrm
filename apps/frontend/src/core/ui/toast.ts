export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastPayload = {
  message: string;
  variant?: ToastVariant;
  autoHideMs?: number;
};

type Listener = (toast: ToastPayload) => void;

const listeners = new Set<Listener>();

export function subscribeToast(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const toast = {
  show(payload: ToastPayload) {
    for (const l of listeners) l(payload);
  },
  success(message: string, autoHideMs = 3500) {
    toast.show({ message, variant: "success", autoHideMs });
  },
  error(message: string, autoHideMs = 5000) {
    toast.show({ message, variant: "error", autoHideMs });
  },
  warning(message: string, autoHideMs = 4500) {
    toast.show({ message, variant: "warning", autoHideMs });
  },
  info(message: string, autoHideMs = 3500) {
    toast.show({ message, variant: "info", autoHideMs });
  },
};
