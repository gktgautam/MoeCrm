// src/lib/api.ts
import axios from "axios";
import { config } from "@/config";
import { queryClient } from "@/lib/queryClient";

export const api = axios.create({
  baseURL: config.apiUrl,      // ✅ http://localhost:8080/api
  withCredentials: true,       // ✅ send cookies (ee_auth)
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 15000),
});

// ✅ global 401 handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      queryClient.clear();
      window.dispatchEvent(new Event("auth:logout"));
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
