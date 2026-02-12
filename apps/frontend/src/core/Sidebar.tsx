import { NavLink } from "react-router-dom";
import PermissionGate from "@/features/auth/PermissionGate";

export default function Sidebar() {
  return (
    <aside>
      <PermissionGate anyOf={["segments:read"]}>
        <NavLink to="/segments">Segments</NavLink>
      </PermissionGate>

      <PermissionGate anyOf={["campaigns:read"]}>
        <NavLink to="/campaigns">Campaigns</NavLink>
      </PermissionGate>

      <PermissionGate anyOf={["settings:write"]}>
        <NavLink to="/settings">Settings</NavLink>
      </PermissionGate>
    </aside>
  );
}
