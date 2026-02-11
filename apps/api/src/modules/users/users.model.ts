export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const userProfiles: UserProfile[] = [
  { id: "1", name: "Admin", email: "admin@example.com" },
  { id: "2", name: "User", email: "user@example.com" },
];
