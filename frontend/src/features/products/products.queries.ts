import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, fetchProducts } from "./products.api";
import type { ProductCreateInput, ProductListResponse } from "./products.types";

export const productsQueryKeys = {
  all: ["products"] as const,
  list: () => [...productsQueryKeys.all, "list"] as const,
};

export function useProductsListQuery() {
  return useQuery({
    queryKey: productsQueryKeys.list(),
    queryFn: fetchProducts,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCreateInput) => createProduct(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: productsQueryKeys.list() });

      const previous = queryClient.getQueryData<ProductListResponse>(productsQueryKeys.list());
      if (!previous) {
        return { previous };
      }

      queryClient.setQueryData<ProductListResponse>(productsQueryKeys.list(), {
        ...previous,
        items: [
          {
            id: Date.now(),
            name: payload.name,
            description: payload.description,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...previous.items,
        ],
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productsQueryKeys.list(), context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.list() });
    },
  });
}
