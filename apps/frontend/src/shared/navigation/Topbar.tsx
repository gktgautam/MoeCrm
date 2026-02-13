// src/shared/navigation/Topbar.tsx
import { useAuth } from "@/features/auth/useAuth";

export default function Topbar() {
  const { state, logout } = useAuth();

  const name =
    state.status === "authed"
      ? [state.user.firstName, state.user.lastName].filter(Boolean).join(" ") || state.user.email
      : "";

  return (
    <header className="p-4 border-b bg-white flex justify-between items-center">
      <h1 className="font-semibold">EqueEngage</h1>

      {state.status === "authed" ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{name}</span>
          <button onClick={logout} className="text-red-600 text-sm">
            Logout
          </button>
        </div>
      ) : null}
    </header>
  );
}
