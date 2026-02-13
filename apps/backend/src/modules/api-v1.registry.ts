import authRoutes from "@/modules/auth/auth.routes";
import customersRoutes from "@/modules/customers/customers.routes";
import dashboardRoutes from "@/modules/dashboard/dashboard.routes";
import usersRoutes from "@/modules/users/users.routes";
import { defineModules } from "@/modules/module-registry";

export const API_V1_MODULES = defineModules([
  { name: "auth", prefix: "/auth", routes: authRoutes },
  { name: "users", prefix: "/users", routes: usersRoutes },
  { name: "dashboard", prefix: "/dashboard", routes: dashboardRoutes },
  { name: "customers", prefix: "/customers", routes: customersRoutes },
]);
