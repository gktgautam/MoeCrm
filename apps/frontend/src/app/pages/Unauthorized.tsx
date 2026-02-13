export default function Unauthorized() {
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Access denied</h1>
      <p className="text-gray-600">You do not have enough permissions for this page.</p>
    </div>
  );
}
