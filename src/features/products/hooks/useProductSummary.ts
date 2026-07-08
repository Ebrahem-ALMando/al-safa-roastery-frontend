"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildProductSummaryQueryParams } from "../lib/products.api"
import type { ProductSummaryFilters, ProductSummaryResponse } from "../types/product.types"

export function useProductSummary(filters: ProductSummaryFilters) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => buildProductSummaryQueryParams(filters), [filters])
  const swrKey = useMemo(
    () => (authReady ? `products-summary:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, isLoading, error, mutate } = useApiQuery<ProductSummaryResponse>(
    swrKey,
    "products/summary",
    { queryParams }
  )

  return {
    summary: data ?? null,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
