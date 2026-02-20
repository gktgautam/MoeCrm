import { useNavigate } from "react-router-dom";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useCreateProductMutation } from "@/features/products/products.queries";
import type { ProductCreateInput } from "@/features/products/products.types";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProductMutation();

  const handleCreate = async (payload: ProductCreateInput) => {
    await createMutation.mutateAsync(payload);
    navigate("/products");
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Create Product</div>
      <ProductForm onSubmit={handleCreate} onCancel={() => navigate("/products")} />
    </div>
  );
}
