"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildInventoryItemsQuery } from "../lib/inventory.api"
import type { InventoryItem, InventoryItemsFilters, InventoryPaginationMeta } from "../types/inventory.types"

export function useInventoryItems(filters: InventoryItemsFilters, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildInventoryItemsQuery(filters), [filters])
  const ready = enabled && !authLoading && isAuthenticated
  const key = ready ? `inventory-items:${JSON.stringify(queryParams)}` : null
  const query = useApiQuery<InventoryItem[]>(key, "inventory/items", { queryParams, paginated: true })
  return { items: query.data ?? [], meta: query.meta as InventoryPaginationMeta | undefined, isLoading: authLoading || !ready || query.isLoading, error: query.error, mutate: query.mutate }
}
