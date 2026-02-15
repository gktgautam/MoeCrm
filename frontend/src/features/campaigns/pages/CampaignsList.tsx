import PermissionGate from "@/core/rbac/PermissionGate";

export default function CampaignsList() {
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Campaigns</div>
      <PermissionGate allow={["campaigns:write"]} mode="all">
        <button className="rounded bg-gray-900 px-3 py-2 text-sm text-white">Create campaign</button>
      </PermissionGate>
    </div>
  );
}
