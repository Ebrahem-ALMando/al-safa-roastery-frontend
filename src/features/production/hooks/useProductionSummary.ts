"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildProductionQueryParams } from "../lib/production.api"
import type { ProductionListFilters, ProductionSummaryResponse } from "../types/production.types"

export function useProductionSummary(filters: ProductionListFilters) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const ready = !authLoading && isAuthenticated
  const queryParams = useMemo(() => buildProductionQueryParams(null, filters), [filters])
  const key = useMemo(() => ready ? `production-summary:${JSON.stringify(queryParams)}` : null, [queryParams, ready])
  const result = useApiQuery<ProductionSummaryResponse>(key, "production-batches/summary", { queryParams })
  return { summary: result.data ?? null, isLoading: authLoading || !ready || result.isLoading, error: result.error, mutate: result.mutate }
}
