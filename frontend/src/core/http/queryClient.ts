// src/lib/queryClient.ts
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/core/http/api-error";

export const queryClient = new QueryClient({
queryCache: new QueryCache({
onError: (err, query) => {
     // ✅ allow opting out when you show inline errors
     if (query?.meta?.silentError) return;
     toast.error(getApiErrorMessage(err));
    },
  }),
  mutationCache: new MutationCache({
    onError: (err, _vars, _ctx, mutation) => {
      if (mutation?.meta?.silentError) return;
      toast.error(getApiErrorMessage(err));
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
