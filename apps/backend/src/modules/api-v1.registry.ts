import authRoutes from "@/modules/auth/auth.routes";
import customersRoutes from "@/modules/customers/customers.routes";
import dashboardRoutes from "@/modules/dashboard/dashboard.routes";
import usersRoutes from "@/modules/users/users.routes";
import type { ApiModule } from "@/modules/module-contract";

export const API_V1_MODULES: ApiModule[] = [
  { name: "auth", prefix: "/auth", routes: authRoutes },
  { name: "users", prefix: "/users", routes: usersRoutes },
  { name: "dashboard", prefix: "/dashboard", routes: dashboardRoutes },
  { name: "customers", prefix: "/customers", routes: customersRoutes },
];
