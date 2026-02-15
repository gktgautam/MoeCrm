export const APP_ROLES = ["admin", "marketer", "analyst", "developer", "viewer", "support"] as const;

export type AppRole = (typeof APP_ROLES)[number];
