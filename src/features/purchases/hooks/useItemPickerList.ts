"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import type { QueryParams } from "@/lib/api"
import type { Item, ItemsListMeta } from "@/features/items/types/item.types"

const ENDPOINT = "items"
const PICKER_PER_PAGE = 100

export type ItemPickerRow = {
  id: string
  name: string
  code: string
  itemType: Item["item_type"]
  currentQuantityKg: string | number | null
  averageCost: string | number | null
}

function mapItem(item: Item): ItemPickerRow {
  return {
    id: String(item.id),
    name: item.name,
    code: item.code?.trim() ? item.code : "—",
    itemType: item.item_type,
    currentQuantityKg: item.current_quantity_kg,
    averageCost: item.average_cost,
  }
}

type UseItemPickerListArgs = {
  open: boolean
  search: string
  debounceMs?: number
}

export function useItemPickerList({ open, search, debounceMs = 350 }: UseItemPickerListArgs) {
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
    () => (open ? `item-picker:${JSON.stringify(queryParams)}` : null),
    [open, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Item[]>(swrKey, ENDPOINT, {
    queryParams,
  })

  const rows = useMemo(() => (data ?? []).map(mapItem), [data])
  const listMeta = meta as ItemsListMeta | undefined

  return {
    rows,
    meta: listMeta,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
    isSearchPending: open && debouncedSearch !== search,
  }
}
