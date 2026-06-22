"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { ItemSummaryResponse } from "../types/item.types"

export function useItemSummary(dateRange: ResolvedOperationalDateRange | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => {
    if (!dateRange) return {}
    return {
      date_from: dateRange.from,
      date_to: dateRange.to,
    }
  }, [dateRange])

  const swrKey = authReady ? `items-summary:bff:${JSON.stringify(queryParams)}` : null

  const { data, isLoading, error, mutate } = useApiQuery<ItemSummaryResponse>(
    swrKey,
    "items/summary",
    { queryParams }
  )

  return {
    summary: data ?? null,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
