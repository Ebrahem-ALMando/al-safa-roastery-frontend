"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import type { QueryParams } from "@/lib/api"
import type { Supplier, SuppliersListMeta } from "@/features/suppliers/types/supplier.types"

const ENDPOINT = "suppliers"
const PICKER_PER_PAGE = 100

export type SupplierPickerRow = {
  id: string
  name: string
  code: string
  phone: string
}

function mapSupplier(s: Supplier): SupplierPickerRow {
  return {
    id: String(s.id),
    name: s.name,
    code: s.code?.trim() ? s.code : "—",
    phone: s.phone?.trim() ? s.phone : "—",
  }
}

type UseSupplierPickerListArgs = {
  open: boolean
  search: string
  debounceMs?: number
}

export function useSupplierPickerList({
  open,
  search,
  debounceMs = 350,
}: UseSupplierPickerListArgs) {
  const debouncedSearch = useDebouncedValue(search, debounceMs)

  const queryParams = useMemo((): QueryParams => {
    const q: QueryParams = {
      page: 1,
      per_page: PICKER_PER_PAGE,
      is_active: 1,
    }
    const s = debouncedSearch.trim()
    if (s !== "") {
      q.search = s
    }
    return q
  }, [debouncedSearch])

  const swrKey = useMemo(
    () => (open ? `supplier-picker:${JSON.stringify(queryParams)}` : null),
    [open, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Supplier[]>(swrKey, ENDPOINT, {
    queryParams,
  })

  const rows = useMemo(() => (data ?? []).map(mapSupplier), [data])
  const listMeta = meta as SuppliersListMeta | undefined

  return {
    rows,
    meta: listMeta,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
    isSearchPending: open && debouncedSearch !== search,
  }
}
