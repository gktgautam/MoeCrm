import "fastify";
import type { Pool } from "pg";

declare module "fastify" {
  interface FastifyRequest {
    auth?: {
      userId: string;
      role?: string;
    };
  }

  interface FastifyInstance {
    dbEngage: Pool;
    dbCRM: Pool;
  }
}

export {};
