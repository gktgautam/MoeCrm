import type { FastifyPluginAsync } from "fastify";

import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import customersRoutes from "./modules/customers/customers.routes.js";

const routes: FastifyPluginAsync = async (app) => {
  app.register(healthRoutes, { prefix: "/api" });
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(usersRoutes, { prefix: "/api/users" });
  app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  app.register(customersRoutes, { prefix: "/api" });
};

export default routes;
