"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildCustomersQueryParams } from "../lib/customers.api"
import type { Customer, CustomersListFilters, CustomersListMeta } from "../types/customer.types"

const ENDPOINT = "customers"

type UseCustomersArgs = {
  page: number
  search: string
  columnFilters: Omit<CustomersListFilters, "search" | "page">
  perPage?: number
}

export function useCustomers({ page, search, columnFilters, perPage }: UseCustomersArgs) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => {
    return buildCustomersQueryParams(page, {
      ...columnFilters,
      search: search.trim() || undefined,
      per_page: perPage,
    })
  }, [page, search, columnFilters, perPage])

  const swrKey = useMemo(
    () => (authReady ? `customers:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Customer[]>(swrKey, ENDPOINT, {
    queryParams,
    paginated: true,
  })

  return {
    customers: data ?? [],
    meta: meta as CustomersListMeta | undefined,
    isLoading: Boolean(isLoading),
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
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
