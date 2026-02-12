// api.ts
import axios from "axios";
import { queryClient } from "./queryClient";
import { config } from "@/config";

export const api = axios.create({
  baseURL: config.apiUrl || "http://127.0.0.1:8080/api",
  withCredentials: true, // important for cookies!
});
 
// ✅ GLOBAL 401 HANDLER (cookie expired, invalid, logged out, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear React Query cache
      queryClient.clear();

      // Tell AuthProvider to clear user state
      window.dispatchEvent(new Event("auth:logout"));

      // Redirect to login page (avoid loops)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
