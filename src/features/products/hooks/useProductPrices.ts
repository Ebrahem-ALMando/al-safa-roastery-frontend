"use client";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import type { ProductPrice } from "../types/product.types";

export function useProductPrices(productId: number | null, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const authReady = !authLoading && isAuthenticated;
  const canLoad = productId != null && enabled && authReady;
  const swrKey = canLoad ? `product-prices:${productId}` : null;
  const endpoint = productId != null ? `products/${productId}/prices` : "";
  const { data, isLoading, error, mutate } = useApiQuery<ProductPrice[]>(swrKey, endpoint);

  return {
    prices: data ?? [],
    isLoading: enabled && (authLoading || !authReady || Boolean(isLoading)),
    error: error as Error | undefined,
    mutate,
  };
}
