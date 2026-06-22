"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildReportDateQueryParams, buildSuppliersQueryParams } from "../lib/suppliers.api"
import type { Supplier, SuppliersListFilters, SuppliersListMeta } from "../types/supplier.types"

const ENDPOINT = "suppliers"

type UseSuppliersArgs = {
  page: number
  search: string
  columnFilters: Omit<SuppliersListFilters, "search" | "page" | "date_from" | "date_to">
  dateRange: ResolvedOperationalDateRange | null
  perPage?: number
}

export function useSuppliers({ page, search, columnFilters, dateRange, perPage }: UseSuppliersArgs) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => {
    const q = buildSuppliersQueryParams(page, {
      ...columnFilters,
      ...buildReportDateQueryParams(dateRange),
      search: search.trim() || undefined,
      per_page: perPage,
    })
    return q
  }, [page, search, columnFilters, dateRange, perPage])

  const swrKey = useMemo(
    () => (authReady ? `suppliers:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Supplier[]>(swrKey, ENDPOINT, {
    queryParams,
    paginated: true,
  })

  return {
    suppliers: data ?? [],
    meta: meta as SuppliersListMeta | undefined,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}

export function useSupplier(id: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const swrKey = id != null && authReady ? `supplier:${id}` : null
  const endpoint = id != null ? `suppliers/${id}` : ""

  const { data, isLoading, error, mutate } = useApiQuery<Supplier>(swrKey, endpoint)

  return {
    supplier: data,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
