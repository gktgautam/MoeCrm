// src/app/providers/AppProviders.tsx
import { type ReactNode } from "react";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClientProvider } from "@tanstack/react-query";
import ToastProvider from "@/app/providers/ToastProvider";


import { theme } from "./theme";
import { queryClient } from "@/core/api/queryClient";
import { AuthProvider } from "@/features/auth";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
        </ToastProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
