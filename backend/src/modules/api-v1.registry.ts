import { authRoutes } from "@/modules/auth";
import { customersRoutes } from "@/modules/customers";
import { dashboardRoutes } from "@/modules/dashboard";
import { usersRoutes } from "@/modules/users";
import { defineModules } from "@/modules/module-registry";

export const API_V1_MODULES = defineModules([
  { name: "auth", prefix: "/auth", routes: authRoutes },
  { name: "users", prefix: "/users", routes: usersRoutes },
  { name: "dashboard", prefix: "/dashboard", routes: dashboardRoutes },
  { name: "customers", prefix: "/customers", routes: customersRoutes },
]);
