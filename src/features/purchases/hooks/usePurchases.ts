"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildPurchasesQueryParams, buildReportDateQueryParams } from "../lib/purchases.api"
import type { PurchaseInvoice, PurchasesListFilters, PurchasesListMeta } from "../types/purchase.types"

const ENDPOINT = "purchase-invoices"

type UsePurchasesArgs = {
  page: number
  search: string
  columnFilters: Omit<PurchasesListFilters, "search" | "page" | "date_from" | "date_to">
  dateRange: ResolvedOperationalDateRange | null
  perPage?: number
}

export function usePurchases({ page, search, columnFilters, dateRange, perPage }: UsePurchasesArgs) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => {
    return buildPurchasesQueryParams(page, {
      ...columnFilters,
      ...buildReportDateQueryParams(dateRange),
      search: search.trim() || undefined,
      per_page: perPage,
    })
  }, [page, search, columnFilters, dateRange, perPage])

  const swrKey = useMemo(
    () => (authReady ? `purchases:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<PurchaseInvoice[]>(swrKey, ENDPOINT, {
    queryParams,
    paginated: true,
  })

  const isListLoading = authLoading || !authReady || Boolean(isLoading)

  return {
    purchases: data ?? [],
    meta: meta as PurchasesListMeta | undefined,
    isLoading: isListLoading,
    error: error as Error | undefined,
    mutate,
  }
}
