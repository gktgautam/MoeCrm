import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return <div className="grid place-items-center min-h-screen bg-gray-100"><Outlet /></div>;
}
