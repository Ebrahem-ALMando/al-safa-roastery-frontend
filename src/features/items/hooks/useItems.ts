"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildItemsQueryParams, buildReportDateQueryParams } from "../lib/items.api"
import type { Item, ItemsListFilters, ItemsListMeta } from "../types/item.types"

const ENDPOINT = "items"

type UseItemsArgs = {
  page: number
  search: string
  columnFilters: Omit<ItemsListFilters, "search" | "page" | "date_from" | "date_to">
  dateRange: ResolvedOperationalDateRange | null
  perPage?: number
}

export function useItems({ page, search, columnFilters, dateRange, perPage }: UseItemsArgs) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const queryParams = useMemo(() => {
    return buildItemsQueryParams(page, {
      ...columnFilters,
      ...buildReportDateQueryParams(dateRange),
      search: search.trim() || undefined,
      per_page: perPage,
    })
  }, [page, search, columnFilters, dateRange, perPage])

  const swrKey = useMemo(
    () => (authReady ? `items:${JSON.stringify(queryParams)}` : null),
    [authReady, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Item[]>(swrKey, ENDPOINT, {
    queryParams,
    paginated: true,
  })

  const isListLoading = authLoading || !authReady || Boolean(isLoading)

  return {
    items: data ?? [],
    meta: meta as ItemsListMeta | undefined,
    isLoading: isListLoading,
    error: error as Error | undefined,
    mutate,
  }
}

export function useItem(id: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const swrKey = id != null && authReady ? `item:${id}` : null
  const endpoint = id != null ? `items/${id}` : ""

  const { data, isLoading, error, mutate } = useApiQuery<Item>(swrKey, endpoint)

  return {
    item: data,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
