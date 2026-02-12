// src/modules/auth/auth.schemas.ts
import { Type, type Static } from "@sinclair/typebox";

/**
 * Auth schemas (TypeBox)
 *
 * Purpose:
 * - Validate request bodies (signup/login)
 * - Document API responses (Ok/Error/Me)
 * - Keep role + payload types consistent across backend + frontend
 *
 * Notes:
 * - Use Type.Literal(true) for success responses to avoid ambiguity.
 * - Use Role union everywhere instead of generic string to keep RBAC strict.
 * - IDs: orgId in requests is number, but JWT payload stores as string for compactness.
 */

// -----------------------------
// Reusable primitives
// -----------------------------

/** orgId must be a positive integer */
export const OrgId = Type.Integer({ minimum: 1 });

/** Email format + basic max length */
export const Email = Type.String({ format: "email", maxLength: 255 });

/** Password policy (adjust as needed) */
export const Password = Type.String({ minLength: 8, maxLength: 200 });

// -----------------------------
// Role (RBAC)
// -----------------------------

/**
 * Roles supported in the app.
 * Keep this single source-of-truth for:
 * - JWT payload
 * - /me response
 * - requireRole guard
 */
export const Role = Type.Union([
  Type.Literal("owner"),
  Type.Literal("admin"),
  Type.Literal("manager"),
  Type.Literal("viewer"),
]);
export type TRole = Static<typeof Role>;

// -----------------------------
// Common API responses
// -----------------------------

/** Generic "success" response (no extra data) */
export const OkResponse = Type.Object({
  ok: Type.Literal(true),
});
export type TOkResponse = Static<typeof OkResponse>;

/** Generic error response */
export const ErrorResponse = Type.Object({
  ok: Type.Literal(false),
  error: Type.String(),
});
export type TErrorResponse = Static<typeof ErrorResponse>;

// -----------------------------
// JWT auth payload
// -----------------------------

/**
 * Payload stored inside auth token.
 * (IDs are stored as strings in JWT; convert to Number() when needed.)
 */
export const AuthPayloadSchema = Type.Object({
  sub: Type.String({ minLength: 1 }), // user id as string
  orgId: Type.String({ minLength: 1 }), // org id as string
  role: Role,
});
export type TAuthPayload = Static<typeof AuthPayloadSchema>;

// -----------------------------
// Request bodies
// -----------------------------

/**
 * Signup body:
 * - orgId: org context
 * - email/password: credentials
 * - role: optional (if not provided, backend may default to "owner" on first user)
 */
export const signupBodySchema = Type.Object({
  orgId: OrgId,
  email: Email,
  password: Password,
  role: Type.Optional(Role),
});
export type SignupBody = Static<typeof signupBodySchema>;

/**
 * Login body:
 * - orgId: org context
 * - email/password: credentials
 */
export const loginBodySchema = Type.Object({
  orgId: OrgId,
  email: Email,
  password: Type.String({ minLength: 1 }),
});
export type LoginBody = Static<typeof loginBodySchema>;

// -----------------------------
// /me response
// -----------------------------

/**
 * /me response (used by role-based UI):
 * - user: safe profile fields only (never include password_hash)
 * - permissions: derived permissions list (optional but useful for UI gating)
 */
export const meResponseSchema = Type.Object({
  ok: Type.Literal(true),
  user: Type.Object({
    id: Type.Number(),
    orgId: Type.Number(),
    email: Type.String({ format: "email" }),
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    role: Role, // ✅ strict role instead of Type.String()
    status: Type.Optional(Type.String()),
  }),
  permissions: Type.Array(Type.String()),
});
export type MeResponse = Static<typeof meResponseSchema>;
