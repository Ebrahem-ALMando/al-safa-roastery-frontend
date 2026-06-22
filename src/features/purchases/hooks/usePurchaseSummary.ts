"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildReportDateQueryParams, buildSummaryQueryParams } from "../lib/purchases.api"
import type { PurchaseSummaryResponse } from "../types/purchase.types"

type PurchaseSummaryFiltersInput = {
  dateRange: ResolvedOperationalDateRange | null
  status?: string
  supplier_id?: number
  payment_status?: string
  payment_method?: string
}

export function usePurchaseSummary({
  dateRange,
  status,
  supplier_id,
  payment_status,
  payment_method,
}: PurchaseSummaryFiltersInput) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(
    () =>
      buildSummaryQueryParams({
        ...buildReportDateQueryParams(dateRange),
        status,
        supplier_id,
        payment_status,
        payment_method,
      }),
    [dateRange, status, supplier_id, payment_status, payment_method]
  )

  const swrKey = useMemo(
    () => (authReady ? `purchases-summary:bff:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, isLoading, error, mutate } = useApiQuery<PurchaseSummaryResponse>(
    swrKey,
    "purchase-invoices/summary",
    { queryParams }
  )

  return {
    summary: data ?? null,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
