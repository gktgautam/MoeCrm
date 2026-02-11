export interface User {
  id: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
  name?: string;
}

export const users: User[] = [
  { id: "1", email: "admin@example.com", password: "admin", role: "ADMIN", name: "Admin" },
  { id: "2", email: "user@example.com", password: "user", role: "USER", name: "User" },
];
