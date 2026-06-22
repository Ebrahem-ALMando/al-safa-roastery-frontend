"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildCustomersQueryParams, buildReportDateQueryParams } from "../lib/customers.api"
import type { Customer, CustomersListFilters, CustomersListMeta } from "../types/customer.types"

const ENDPOINT = "customers"

type UseCustomersArgs = {
  page: number
  search: string
  columnFilters: Omit<CustomersListFilters, "search" | "page" | "date_from" | "date_to">
  dateRange: ResolvedOperationalDateRange | null
  perPage?: number
}

export function useCustomers({ page, search, columnFilters, dateRange, perPage }: UseCustomersArgs) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => {
    return buildCustomersQueryParams(page, {
      ...columnFilters,
      ...buildReportDateQueryParams(dateRange),
      search: search.trim() || undefined,
      per_page: perPage,
    })
  }, [page, search, columnFilters, dateRange, perPage])

  const swrKey = useMemo(
    () => (authReady ? `customers:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Customer[]>(swrKey, ENDPOINT, {
    queryParams,
    paginated: true,
  })

  const isListLoading = authLoading || !authReady || Boolean(isLoading)

  return {
    customers: data ?? [],
    meta: meta as CustomersListMeta | undefined,
    isLoading: isListLoading,
    error: error as Error | undefined,
    mutate,
  }
}

export function useCustomer(id: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const swrKey = id != null && authReady ? `customer:${id}` : null
  const endpoint = id != null ? `customers/${id}` : ""

  const { data, isLoading, error, mutate } = useApiQuery<Customer>(swrKey, endpoint)

  return {
    customer: data,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
