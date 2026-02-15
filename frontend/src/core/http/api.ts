import axios from "axios";
import { appConfig } from "@/app/config/env";
import { queryClient } from "@/core/http/queryClient";
import { toast } from "@/core/ui/toast";

export const api = axios.create({
  baseURL: appConfig.apiUrl, // e.g. http://localhost:8080/api/v1
  withCredentials: true,     // cookie session
  timeout: appConfig.apiTimeoutMs,
});

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/me")
  );
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url as string | undefined;

    // ✅ If session expired on protected endpoints (NOT login/signup/me)
    if (status === 401 && !isAuthEndpoint(url)) {
      queryClient.clear();
      window.dispatchEvent(new Event("auth:logout"));
      toast.info("Session expired. Please login again.");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (status && status !== 401) {
      const message = error?.response?.data?.error?.message as string | undefined;
      toast.error(message ?? "Request failed. Please try again.");
    }

    // ✅ IMPORTANT: never throw/return response.data here
    // Keep the original AxiosError so helpers can read response.data.error.message
    return Promise.reject(error);
  },
);
