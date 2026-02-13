import type { FastifyRequest } from "fastify";
import type { AppRole } from "./auth.types.js";

const CROSS_ORG_DEFAULT: readonly AppRole[] = ["admin"];

type Source = "query" | "body" | "params";

export type OrgAccessOptions = {
  source: Source;
  key?: string;
  allowCrossOrgRoles?: readonly AppRole[];
};

/**
 * Returns the effective orgId for a request.
 * - if no org field is provided in the target source, falls back to auth org
 * - blocks cross-org access unless role is allowlisted
 */
export function resolveOrgIdFromRequest(req: FastifyRequest, options: OrgAccessOptions): number {
  if (!req.auth) {
    throw new Error("UNAUTHORIZED");
  }

  const key = options.key ?? "orgId";
  const roleAllowlist = options.allowCrossOrgRoles ?? CROSS_ORG_DEFAULT;
  const authOrgId = Number(req.auth.orgId);

  if (!Number.isInteger(authOrgId) || authOrgId <= 0) {
    throw new Error("UNAUTHORIZED");
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
    throw new Error("INVALID_ORG_ID");
  }

  const sameOrg = requestedOrgId === authOrgId;
  const crossOrgAllowed = roleAllowlist.includes(req.auth.role as AppRole);

  if (!sameOrg && !crossOrgAllowed) {
    throw new Error("FORBIDDEN");
  }

  return requestedOrgId;
}
