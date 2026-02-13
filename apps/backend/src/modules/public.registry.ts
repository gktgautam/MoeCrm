import healthRoutes from "@/modules/health/health.routes";
import type { ApiModule } from "@/modules/module-contract";

export const PUBLIC_MODULES: ApiModule[] = [
  { name: "health", prefix: "/api", routes: healthRoutes },
];
