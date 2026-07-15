"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildCashboxQuery } from "../lib/cashbox.api"
import type { CashboxFilters, CashboxPaginationMeta, CashboxTransaction } from "../types/cashbox.types"

export function useCashboxTransactions(filters: CashboxFilters, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildCashboxQuery(filters), [filters])
  const ready = enabled && !authLoading && isAuthenticated
  const query = useApiQuery<CashboxTransaction[]>(
    ready ? `cashbox-transactions:${JSON.stringify(queryParams)}` : null,
    "cashbox/transactions",
    { queryParams, paginated: true },
  )
  return {
    transactions: query.data ?? [],
    meta: query.meta as CashboxPaginationMeta | undefined,
    isLoading: authLoading || !ready || query.isLoading,
    error: query.error,
    mutate: query.mutate,
  }
}
