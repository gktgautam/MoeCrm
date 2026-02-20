import ProductsListPage from "@/features/products/pages/ProductsListPage";
import type { AppRoute } from "@/app/router";
import { Package } from "lucide-react";

export const PRODUCTS_ROUTES: AppRoute[] = [
  {
    path: "/products",
    navLabel: "Products",
    anyOf: ["products:read"],
    element: <ProductsListPage />,
    icon: Package,
  },
];
