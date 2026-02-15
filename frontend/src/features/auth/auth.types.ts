 
export type Role = "admin" | "marketer" | "analyst" | "developer" | "viewer" | "support";

export type AuthUser = {
  id: number;
  orgId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  status?: string;
};

 
