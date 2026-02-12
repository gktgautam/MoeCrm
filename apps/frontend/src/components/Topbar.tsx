import { useAuth } from "@/auth/AuthProvider";

export default function Topbar() {
  const { user, logout } = useAuth();
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email
    : "";

  return (
    <header className="p-4 border-b bg-white flex justify-between">
      <h1>Dashboard</h1>

      <div className="flex items-center gap-3">
        <span>{displayName}</span>
        <button onClick={logout} className="text-red-600">Logout</button>
      </div>
    </header>
  );
}
