"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { QueryParams } from "@/lib/api"
import { buildSuppliersQueryParams } from "../lib/suppliers.api"
import type { Supplier, SuppliersListFilters, SuppliersListMeta } from "../types/supplier.types"

const ENDPOINT = "suppliers"

type UseSuppliersArgs = {
  page: number
  search: string
  columnFilters: Omit<SuppliersListFilters, "search" | "page">
  perPage?: number
}

export function useSuppliers({ page, search, columnFilters, perPage }: UseSuppliersArgs) {
  const queryParams = useMemo(() => {
    const q = buildSuppliersQueryParams(page, {
      ...columnFilters,
      search: search.trim() || undefined,
      per_page: perPage,
    })
    return q
  }, [page, search, columnFilters, perPage])

  const swrKey = useMemo(() => `suppliers:${JSON.stringify(queryParams)}`, [queryParams])

  const { data, meta, isLoading, error, mutate } = useApiQuery<Supplier[]>(swrKey, ENDPOINT, {
    queryParams,
  })

  return {
    suppliers: data ?? [],
    meta: meta as SuppliersListMeta | undefined,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}

/** Lightweight count query for active suppliers KPI. */
export function useActiveSuppliersCount() {
  const queryParams = useMemo<QueryParams>(
    () => ({ is_active: 1, page: 1, per_page: 1 }),
    []
  )
  const swrKey = "suppliers:active-count"

  const { meta, isLoading, error } = useApiQuery<Supplier[]>(swrKey, ENDPOINT, { queryParams })

  return {
    count: (meta as SuppliersListMeta | undefined)?.total ?? null,
    isLoading,
    error: error as Error | undefined,
  }
}

export function useSupplier(id: number | null) {
  const swrKey = id != null ? `supplier:${id}` : null
  const endpoint = id != null ? `suppliers/${id}` : ""

  const { data, isLoading, error, mutate } = useApiQuery<Supplier>(swrKey, endpoint)

  return {
    supplier: data,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
