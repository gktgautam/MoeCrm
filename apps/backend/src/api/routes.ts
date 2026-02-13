import type { FastifyPluginAsync } from "fastify";

import healthRoutes from "../domains/health/health.routes.js";
import authRoutes from "../domains/auth/auth.routes.js";
import usersRoutes from "../domains/users/users.routes.js";
import dashboardRoutes from "../domains/dashboard/dashboard.routes.js";
import customersRoutes from "../domains/customers/customers.routes.js";
 

const v1Routes: FastifyPluginAsync = async (app) => {
  // v1 modules
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(usersRoutes, { prefix: "/users" });
  await app.register(dashboardRoutes, { prefix: "/dashboard" });
  await app.register(customersRoutes, { prefix: "/customers" });
};

// Future:
// const v2Routes: FastifyPluginAsync = async (app) => {
//   await app.register(authRoutesV2, { prefix: "/auth" });
//   // v1 modules...
// };


const routes: FastifyPluginAsync = async (app) => {
  // Non-versioned / public
  await app.register(healthRoutes, { prefix: "/api" });

  // Versioned API
  await app.register(v1Routes, { prefix: "/api/v1" });

  // Future:
  // await app.register(v2Routes, { prefix: "/api/v2" });
};

export default routes;
