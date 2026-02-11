// src/modules/auth/auth.schemas.ts
import { Type } from "@sinclair/typebox";

export const Role = Type.Union([
  Type.Literal("owner"),
  Type.Literal("admin"),
  Type.Literal("manager"),
  Type.Literal("viewer"),
]);

export const SignupBody = Type.Object({
  orgId: Type.Integer({ minimum: 1 }),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
  role: Type.Optional(Role),
});

export const LoginBody = Type.Object({
  orgId: Type.Integer({ minimum: 1 }),
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 1 }),
});

export const OkResponse = Type.Object({
  ok: Type.Boolean(),
});

export const ErrorResponse = Type.Object({
  ok: Type.Boolean(),
  error: Type.String(),
});

export const MeResponse = Type.Object({
  ok: Type.Boolean(),
  auth: Type.Optional(
    Type.Object({
      sub: Type.String(),
      orgId: Type.String(),
      role: Role,
    })
  ),
});
