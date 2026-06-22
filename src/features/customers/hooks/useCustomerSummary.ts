"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { CustomerSummaryResponse } from "../types/customer.types"

export function useCustomerSummary(dateRange: ResolvedOperationalDateRange | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => {
    if (!dateRange) return {}
    return {
      date_from: dateRange.from,
      date_to: dateRange.to,
    }
  }, [dateRange])

  const swrKey = authReady ? `customers-summary:bff:${JSON.stringify(queryParams)}` : null

  const { data, isLoading, error, mutate } = useApiQuery<CustomerSummaryResponse>(
    swrKey,
    "customers/summary",
    { queryParams }
  )

  return { summary: data ?? null, isLoading, error: error as Error | undefined, mutate }
}
