"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildCashboxQuery } from "../lib/cashbox.api"
import type { CashboxFilters, CashboxSummary } from "../types/cashbox.types"

type SummaryFilters = Omit<CashboxFilters, "page" | "per_page" | "sort_by" | "sort_direction">

export function useCashboxSummary(filters: SummaryFilters, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildCashboxQuery(filters), [filters])
  const ready = enabled && !authLoading && isAuthenticated
  const query = useApiQuery<CashboxSummary>(
    ready ? `cashbox-summary:${JSON.stringify(queryParams)}` : null,
    "cashbox/summary",
    { queryParams },
  )
  return {
    summary: query.data,
    isLoading: authLoading || !ready || query.isLoading,
    error: query.error,
    mutate: query.mutate,
  }
}
