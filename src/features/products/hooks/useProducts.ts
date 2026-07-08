"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildProductsQueryParams, buildReportDateQueryParams } from "../lib/products.api"
import type { Product, ProductsListFilters, ProductsListMeta } from "../types/product.types"

const ENDPOINT = "products"

type UseProductsArgs = {
  page: number
  search: string
  columnFilters: Omit<ProductsListFilters, "search" | "page" | "date_from" | "date_to">
  dateRange: ResolvedOperationalDateRange | null
  perPage?: number
}

export function useProducts({ page, search, columnFilters, dateRange, perPage }: UseProductsArgs) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(
    () =>
      buildProductsQueryParams(page, {
        ...columnFilters,
        ...buildReportDateQueryParams(dateRange),
        search: search.trim() || undefined,
        per_page: perPage,
      }),
    [page, search, columnFilters, dateRange, perPage]
  )

  const swrKey = useMemo(
    () => (authReady ? `products:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Product[]>(swrKey, ENDPOINT, {
    queryParams,
    paginated: true,
  })

  return {
    products: data ?? [],
    meta: meta as ProductsListMeta | undefined,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
