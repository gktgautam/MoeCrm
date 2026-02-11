import type { FastifyPluginAsync } from "fastify";

import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import customersRoutes from "./modules/customers/customers.routes.js";

const routeModules: Array<{ plugin: FastifyPluginAsync; prefix: string }> = [
  { plugin: healthRoutes, prefix: "/api" },
  { plugin: authRoutes, prefix: "/api/auth" },
  { plugin: usersRoutes, prefix: "/api/users" },
  { plugin: dashboardRoutes, prefix: "/api/dashboard" },
  { plugin: customersRoutes, prefix: "/api" },
];

const routes: FastifyPluginAsync = async (app) => {
  for (const { plugin, prefix } of routeModules) {
    app.register(plugin, { prefix });
  }
};

export default routes;
