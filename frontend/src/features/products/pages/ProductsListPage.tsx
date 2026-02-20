import { useNavigate } from "react-router-dom";
import PermissionGate from "@/core/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import { useProductsListQuery } from "../products.queries";

export default function ProductsListPage() {
  const navigate = useNavigate();
  const productsQuery = useProductsListQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Product Management</div>
        <PermissionGate allow={["products:write"]} mode="all">
          <Button onClick={() => navigate("/products/create")}>Create product</Button>
        </PermissionGate>
      </div>

      {productsQuery.isLoading && <div>Loading products…</div>}
      {productsQuery.isError && (
        <div className="text-red-600">Failed to load products. Please refresh and try again.</div>
      )}

      {productsQuery.data && (
        <div className="rounded-md border">
          {productsQuery.data.items.map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b p-3 last:border-b-0">
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">{product.description}</div>
              </div>
              <div className="text-xs text-muted-foreground">{product.isActive ? "Active" : "Inactive"}</div>
            </div>
          ))}
          {productsQuery.data.items.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">No products found.</div>
          )}
        </div>
      )}

    </div>
  );
}
