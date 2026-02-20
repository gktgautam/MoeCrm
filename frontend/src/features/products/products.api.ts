import { api } from "@/core/http/api";
import type {
  ProductCreateInput,
  ProductCreateResponse,
  ProductListResponse,
} from "./products.types";

export async function fetchProducts(): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>("/products");
  return data;
}

export async function createProduct(payload: ProductCreateInput): Promise<ProductCreateResponse> {
  const { data } = await api.post<ProductCreateResponse>("/products", payload);
  return data;
}
