"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildProductionQueryParams } from "../lib/production.api"
import type { ProductionBatch, ProductionListFilters, ProductionListMeta } from "../types/production.types"

export function useProductionBatches(page: number, filters: ProductionListFilters) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const ready = !authLoading && isAuthenticated
  const queryParams = useMemo(() => buildProductionQueryParams(page, filters), [filters, page])
  const key = useMemo(() => ready ? `production-batches:${JSON.stringify(queryParams)}` : null, [queryParams, ready])
  const result = useApiQuery<ProductionBatch[]>(key, "production-batches", { queryParams, paginated: true })
  return {
    batches: result.data ?? [],
    meta: result.meta as ProductionListMeta | undefined,
    isLoading: authLoading || !ready || result.isLoading,
    error: result.error,
    mutate: result.mutate,
  }
}
