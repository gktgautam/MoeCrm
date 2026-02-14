// src/app/layouts/AuthLayout.tsx
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-1 overflow-auto p-6 bg-gray-100">
      <div className="flex items-center justify-center h-full flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
