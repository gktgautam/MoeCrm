import { healthRoutes } from "@/modules/health";
import { defineModules } from "@/modules/module-registry";

export const PUBLIC_MODULES = defineModules([
  { name: "health", prefix: "/api", routes: healthRoutes },
]);
