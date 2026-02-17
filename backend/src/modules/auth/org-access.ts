import type { FastifyRequest } from "fastify";
import { Errors } from "@/core/http/app-error";

type Source = "query" | "body" | "params";
export type OrgAccessOptions = { source: Source; key?: string };

export function resolveOrgIdFromRequest(req: FastifyRequest, _options: OrgAccessOptions): number {
  if (!req.auth) throw Errors.unauthorized();
  return 1;
}
