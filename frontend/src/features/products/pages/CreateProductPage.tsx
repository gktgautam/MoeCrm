import { useState } from "react";
import PermissionGate from "@/core/rbac/PermissionGate";
import { Button } from "@/components/ui/button";
import {
  useCreateProductMutation,
  useProductsListQuery,
} from "../products.queries";
import { ProductCreateDialog } from "../components/ProductCreateDialog";
import type { ProductCreateInput } from "../products.types";

export default function ProductsListPage() {
  const [open, setOpen] = useState(false);
  const productsQuery = useProductsListQuery();
  const createMutation = useCreateProductMutation();

  const handleCreate = async (payload: ProductCreateInput) => {
    await createMutation.mutateAsync(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Product Management</div>
        <PermissionGate allow={["products:write"]} mode="all">
          <Button onClick={() => setOpen(true)}>Create product</Button>
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

      <ProductCreateDialog open={open} onOpenChange={setOpen} onSubmit={handleCreate} />
    </div>
  );
}
