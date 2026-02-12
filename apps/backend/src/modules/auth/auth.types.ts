export const APP_ROLES = ["owner", "admin", "manager", "marketer", "developer", "analyst"] as const;

export type AppRole = (typeof APP_ROLES)[number];
