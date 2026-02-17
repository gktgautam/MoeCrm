import { authRoutes } from "@/modules/auth";
import { customersRoutes } from "@/modules/customers";
import { dashboardRoutes } from "@/modules/dashboard";
import { permissionsRoutes } from "@/modules/permissions";
import { rolesRoutes } from "@/modules/roles";
import { usersRoutes } from "@/modules/users";
import { productsRoutes } from "@/modules/products/products.routes";


import { defineModules } from "@/modules/module-registry";

export const API_V1_MODULES = defineModules([
  { name: "auth", prefix: "/auth", routes: authRoutes },
  { name: "permissions", prefix: "/permissions", routes: permissionsRoutes },
  { name: "roles", prefix: "/roles", routes: rolesRoutes },
  { name: "users", prefix: "/users", routes: usersRoutes },
  { name: "dashboard", prefix: "/dashboard", routes: dashboardRoutes },
  { name: "customers", prefix: "/customers", routes: customersRoutes },
  { name: "products", prefix: "/products", routes: productsRoutes },
  
]);
