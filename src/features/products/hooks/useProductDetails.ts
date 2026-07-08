"use client"

import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { Product } from "../types/product.types"

export function useProductDetails(id: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const swrKey = id != null && authReady ? `product:${id}` : null
  const endpoint = id != null ? `products/${id}` : ""
  const { data, isLoading, error, mutate } = useApiQuery<Product>(swrKey, endpoint)

  return {
    product: data,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
