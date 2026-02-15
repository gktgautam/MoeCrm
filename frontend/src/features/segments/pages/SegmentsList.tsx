import PermissionGate from "@/core/rbac/PermissionGate";

export default function SegmentsList() {
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Segments</div>
      <PermissionGate allow={["segments:write"]} mode="all">
        <button className="rounded bg-gray-900 px-3 py-2 text-sm text-white">Create segment</button>
      </PermissionGate>
    </div>
  );
}
