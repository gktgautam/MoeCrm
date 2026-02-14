import type { FastifyRequest } from "fastify";
import { Errors } from "@/core/http/app-error";
import type { AppRole } from "./auth.types.js";

const CROSS_ORG_DEFAULT: readonly AppRole[] = ["admin"];

type Source = "query" | "body" | "params";

export type OrgAccessOptions = {
  source: Source;
  key?: string;
  allowCrossOrgRoles?: readonly AppRole[];
};

export function resolveOrgIdFromRequest(
  req: FastifyRequest,
  options: OrgAccessOptions,
  roleKeys: string[] = [],
): number {
  if (!req.auth) {
    throw Errors.unauthorized();
  }

  const key = options.key ?? "orgId";
  const roleAllowlist = options.allowCrossOrgRoles ?? CROSS_ORG_DEFAULT;
  const authOrgId = Number(req.auth.orgId);

  if (!Number.isInteger(authOrgId) || authOrgId <= 0) {
    throw Errors.unauthorized();
  }

  const container = req[options.source] as Record<string, unknown> | undefined;
  const rawOrgId = container?.[key];

  if (rawOrgId == null) {
    return authOrgId;
  }

  if (typeof rawOrgId === "string" && rawOrgId.trim() === "") {
    return authOrgId;
  }

  const requestedOrgId = Number(rawOrgId);
  if (!Number.isInteger(requestedOrgId) || requestedOrgId <= 0) {
    throw Errors.badRequest("Invalid orgId");
  }

  const sameOrg = requestedOrgId === authOrgId;
  const crossOrgAllowedByRole = roleAllowlist.some((role) => roleKeys.includes(role));

  if (!sameOrg && !crossOrgAllowedByRole) {
    throw Errors.forbidden();
  }

  return requestedOrgId;
}
