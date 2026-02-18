// src/app/providers/AppProviders.tsx
import { type ReactNode } from "react";  
import { QueryClientProvider } from "@tanstack/react-query";

import ToastProvider from "@/app/providers/ToastProvider";
import { queryClient } from "@/core/http/queryClient";
import { AuthProvider } from "@/auth";
 

export default function AppProviders({ children }: { children: ReactNode }) {
  return (   
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        </ToastProvider> 
  );
}
