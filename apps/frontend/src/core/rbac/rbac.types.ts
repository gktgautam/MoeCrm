export type Role = "admin" | "marketer" | "analyst" | "developer" | "viewer" | "support";

export type AccessRule = {
  roles?: Role[];
  anyOf?: string[];
  allOf?: string[];
};

export type AuthSnapshot =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; role: Role; permissions: string[] };
