import PermissionGate from "@/features/auth/PermissionGate";
import { useAuth } from "@/features/auth/useAuth";

type RoleDefinition = {
  key: string;
  title: string;
  description: string;
  capabilities: string[];
};

const DEFAULT_ROLES: RoleDefinition[] = [
  {
    key: "admin",
    title: "🚀 Admin",
    description: "Full access to all modules and account controls.",
    capabilities: [
      "Manage campaigns, account settings, billing, team roles and teams",
      "Only role allowed to create/edit/delete Teams",
      "Can create and update custom roles",
    ],
  },
  {
    key: "manager",
    title: "👩‍💼 Manager",
    description: "Operational owner with broad control except team entity management.",
    capabilities: [
      "Almost all Admin permissions except create/edit/delete Teams",
      "Can invite team members to Manager or below",
      "Can approve campaigns when approval workflow is enabled",
    ],
  },
  {
    key: "marketer",
    title: "📣 Marketer",
    description: "Campaign builder role for day-to-day campaign execution.",
    capabilities: [
      "Create and manage campaigns",
      "Cannot access billing",
      "Campaigns require Manager/Admin approval when approval flow is enabled",
    ],
  },
  {
    key: "developer",
    title: "👨‍💻 Developer",
    description: "Integration-focused role with restricted live account controls.",
    capabilities: [
      "Works on app/web integration paths",
      "Limited LIVE environment access",
      "Cannot view billing, other members' campaigns, or change push settings",
    ],
  },
  {
    key: "analyst",
    title: "📊 Analyst",
    description: "Read/report focused role for data and performance insights.",
    capabilities: [
      "View and export reports and segmentation data",
      "Cannot create campaigns",
      "Cannot modify non-report settings",
    ],
  },
];

export default function SettingsHome() {
  const { state } = useAuth();
  const roleName = state.status === "authed" ? state.user.role : "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Team Management · Roles</h1>
        <p className="mt-1 text-sm text-gray-600">
          Roles and permissions are now DB-backed. Default roles are predefined and locked; Admins can manage custom
          roles.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">📌 Default Roles (Predefined)</h2>
        <p className="mt-1 text-sm text-gray-600">These roles are system-defined and cannot be edited.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {DEFAULT_ROLES.map((role) => (
            <article key={role.key} className="rounded-md border border-gray-200 p-3">
              <h3 className="text-sm font-semibold text-gray-900">{role.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{role.description}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {role.capabilities.map((cap) => (
                  <li key={cap}>{cap}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">⚙️ Custom Roles</h2>
        <p className="mt-1 text-sm text-gray-600">
          Path: <span className="font-medium">Settings &gt; Account &gt; Team Management &gt; Roles</span>
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Click Create role, give it a name and description.</li>
          <li>Copy permissions from an existing role or start from scratch.</li>
          <li>Only Admins can create or update custom roles.</li>
        </ul>

        <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
          Signed in role: <span className="font-semibold">{roleName || "Unknown"}</span>
        </div>

        <PermissionGate
          anyOf={["team:roles:write"]}
          fallback={
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              You need Admin-level role management permission (<code>team:roles:write</code>) to create or edit custom
              roles.
            </div>
          }
        >
          <button
            type="button"
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Create role
          </button>
        </PermissionGate>
      </section>
    </div>
  );
}
