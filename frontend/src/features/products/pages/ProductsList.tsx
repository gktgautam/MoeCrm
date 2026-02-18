import PermissionGate from "@/core/rbac/PermissionGate";
import Breadcrumb, { type BreadcrumbItem } from "@/components/ui/breadcrumb";

import { ProductCreateForm } from "./ProductCreateForm";

export default function ProductsList() {
    
  const items: BreadcrumbItem[] = [
    { label: "Home", path: "/" }, 
    { label: "Product" } // last item has no link
  ];


    const handleCreate = async (payload: any) => {
    console.log("Submitting:", payload);

    // Example POST request
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  return (
    <div className="space-y-3">
      <Breadcrumb items={items} />

      <div className="flex justify-between items-center">
         <div className="text-lg font-semibold">Product Management</div>
         <PermissionGate allow={["products:write"]} mode="all">
            <button className="rounded bg-gray-900 px-3 py-2 text-sm text-white">Create segment</button>
         </PermissionGate>
       </div>

       <ProductCreateForm onSubmit={handleCreate} />

       

      
    </div>
  );
}
 