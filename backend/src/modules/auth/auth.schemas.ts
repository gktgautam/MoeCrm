import { Type, type Static } from "@sinclair/typebox";
import { APP_ROLES } from "./auth.types";

export const OrgId = Type.Integer({ minimum: 1 });
export const Email = Type.String({ format: "email", maxLength: 255 });
export const Password = Type.String({ minLength: 8, maxLength: 200 });

export const Role = Type.Union(APP_ROLES.map((role) => Type.Literal(role)));
export type TRole = Static<typeof Role>;

export const AuthPayloadSchema = Type.Object({
  userId: Type.String({ minLength: 1 }),
  orgId: Type.String({ minLength: 1 }),
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
  email: Email,
  password: Type.String({ minLength: 1 }),
});
export type LoginBody = Static<typeof loginBodySchema>;

export const meResponseSchema = Type.Object({
  ok: Type.Literal(true),
  user: Type.Object({
    id: Type.Number(),
    orgId: Type.Number(),
    email: Type.String({ format: "email" }),
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    role: Role,
    status: Type.Optional(Type.String()),
  }),
  role: Role,
  permissions: Type.Array(Type.String()),
  allowedRoutes: Type.Array(Type.String()),
});
export type MeResponse = Static<typeof meResponseSchema>;
