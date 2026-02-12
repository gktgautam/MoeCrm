export const APP_ROLES = ["owner", "admin", "manager", "viewer"] as const;

export type AppRole = (typeof APP_ROLES)[number];
