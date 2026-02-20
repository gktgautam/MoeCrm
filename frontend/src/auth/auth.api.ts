import { api } from "@/core/http/api";
import type { AuthMeResponse, LoginPayload } from "./auth.types";

export async function loginRequest(payload: LoginPayload): Promise<void> {
  await api.post("/auth/login", payload);
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}

export async function fetchMe(): Promise<AuthMeResponse> {
  const { data } = await api.get<AuthMeResponse>("/auth/me");
  return data;
}
