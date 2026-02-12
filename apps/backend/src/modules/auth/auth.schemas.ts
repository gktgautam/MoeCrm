import { Type, Static } from "@sinclair/typebox";

/**
 * Simple schemas (same file, easy)
 */

const OrgId = Type.Integer({ minimum: 1 });
const Email = Type.String({ format: "email", maxLength: 255 });
const Password = Type.String({ minLength: 8, maxLength: 200 });

export const Role = Type.Union([
  Type.Literal("owner"),
  Type.Literal("admin"),
  Type.Literal("manager"),
  Type.Literal("viewer"),
]);
export type TRole = Static<typeof Role>;

export const OkResponse = Type.Object({ ok: Type.Boolean() });
export const ErrorResponse = Type.Object({
  ok: Type.Boolean(),
  error: Type.String(),
});

export const AuthPayloadSchema = Type.Object({
  sub: Type.String({ minLength: 1 }),  // user id as string
  orgId: Type.String({ minLength: 1 }),// org id as string
  role: Role,
});
export type TAuthPayload = Static<typeof AuthPayloadSchema>;

export const signupBodySchema = Type.Object({
  orgId: OrgId,
  email: Email,
  password: Password,
  role: Type.Optional(Role),
});
export type SignupBody = Static<typeof signupBodySchema>;

export const loginBodySchema = Type.Object({
  orgId: OrgId,
  email: Email,
  password: Type.String({ minLength: 1 }),
});
export type LoginBody = Static<typeof loginBodySchema>;

export const meResponseSchema = Type.Object({
  ok: Type.Boolean(),
  auth: Type.Optional(AuthPayloadSchema),
});
export type MeResponse = Static<typeof meResponseSchema>;
