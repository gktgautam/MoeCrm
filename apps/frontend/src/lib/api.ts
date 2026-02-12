import axios from "axios";
import { appConfig } from "@/config/app-config";
import { queryClient } from "@/lib/queryClient";

export const api = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
  timeout: appConfig.apiTimeoutMs,
});

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
  },
);
