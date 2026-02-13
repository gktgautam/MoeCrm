// src/core/layout/Topbar.tsx
export default function Topbar({
  name,
  onLogout,
}: {
  name?: string;
  onLogout?: () => void;
}) {
  return (
    <header className="p-4 border-b bg-white flex justify-between items-center">
      <h1 className="font-semibold">EqueEngage</h1>

      {name && onLogout ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{name}</span>
          <button onClick={onLogout} className="text-red-600 text-sm">
            Logout
          </button>
        </div>
      ) : null}
    </header>
  );
}
