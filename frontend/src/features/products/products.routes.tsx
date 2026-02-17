import ProductsList from "@/features/products/pages/ProductsList";
import type { AppRoute } from "@/app/router";
import { Package } from "lucide-react";

export const PRODUCTS_ROUTES: AppRoute[] = [
  {
    path: "/products",
    navLabel: "Products",
    anyOf: ["products:read"],
    element: <ProductsList />,
    icon: Package
  },
];
