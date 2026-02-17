// src/app/providers/AppProviders.tsx
import { type ReactNode } from "react";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClientProvider } from "@tanstack/react-query";

import ToastProvider from "@/app/providers/ToastProvider";
import { queryClient } from "@/core/http/queryClient";
import { AuthProvider } from "@/auth";

import { muiTheme } from "@/theme/muiTheme";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
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
