"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { InventoryDateRange, InventoryItem } from "../types/inventory.types"

export function useInventoryItemDetails(itemId: number | null, dateRange: InventoryDateRange, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => dateRange ? { date_from: dateRange.from, date_to: dateRange.to } : {}, [dateRange])
  const ready = enabled && !authLoading && isAuthenticated && itemId !== null
  const query = useApiQuery<InventoryItem>(ready ? `inventory-item:${itemId}:${JSON.stringify(queryParams)}` : null, itemId ? `inventory/items/${itemId}` : "", { queryParams })
  return { item: query.data, isLoading: authLoading || !ready || query.isLoading, error: query.error, mutate: query.mutate }
}
