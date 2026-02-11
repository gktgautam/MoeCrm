import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4 space-y-3">
      <Link to="/">Dashboard</Link>
      <Link to="/segments">Segments</Link>
      <Link to="/campaigns">Campaigns</Link>
      <Link to="/analytics">Analytics</Link>
      <Link to="/templates">Templates</Link>
      <Link to="/products">Products</Link>
      <Link to="/users">Users</Link>
      <Link to="/settings">Settings</Link>
    </aside>
  );
}
