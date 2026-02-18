import { useEffect, useMemo, useState } from "react";
import { subscribeToast, type ToastPayload } from "@/lib/toast";

type Variant = "success" | "error" | "warning" | "info";
type QueueItem = Required<ToastPayload> & { key: number };

function asVariant(v?: ToastPayload["variant"]): Variant {
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
        variant: asVariant(t.variant),
        autoHideMs: t.autoHideMs ?? 3500,
      };

      setQueue((prev) => [...prev, item]);
      setOpen(true);
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleExited = () => {
    setQueue((prev) => prev.slice(1));
  };

  // Auto close when active changes
  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(handleClose, active.autoHideMs);
    return () => clearTimeout(timer);
  }, [active]);

  // Remove toast from queue after exit animation
  useEffect(() => {
    if (!open && active) {
      const timer = setTimeout(handleExited, 150); // match CSS animation
      return () => clearTimeout(timer);
    }
  }, [open, active]);

  const variantClasses = useMemo(() => {
    if (!active) return "";

    switch (active.variant) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      case "info":
      default:
        return "bg-blue-600 text-white";
    }
  }, [active]);

  return (
    <>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {active && (
          <div
            key={active.key}
            className={`
              transform transition-all duration-150
              ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
            `}
          >
            <div
              className={`
                px-4 py-3 rounded shadow-lg min-w-[240px] max-w-sm
                flex items-start justify-between gap-3
                ${variantClasses}
              `}
            >
              <span className="text-sm font-medium">{active.message}</span>

              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white text-sm font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
