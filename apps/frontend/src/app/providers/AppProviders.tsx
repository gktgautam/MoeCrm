// src/app/providers/AppProviders.tsx
import { type ReactNode } from "react";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClientProvider } from "@tanstack/react-query";

import { theme } from "./theme";
import { queryClient } from "@/shared/api/queryClient";
import { AuthProvider } from "@/features/auth/AuthProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
