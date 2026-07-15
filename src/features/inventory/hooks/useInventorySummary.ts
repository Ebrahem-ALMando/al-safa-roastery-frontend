"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { InventoryItemsFilters, InventorySummaryResponse } from "../types/inventory.types"
import { buildInventoryItemsQuery } from "../lib/inventory.api"

export function useInventorySummary(filters: Pick<InventoryItemsFilters, "date_from" | "date_to" | "item_type" | "stock_status" | "item_id">, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildInventoryItemsQuery(filters), [filters])
  const ready = enabled && !authLoading && isAuthenticated
  const query = useApiQuery<InventorySummaryResponse>(ready ? `inventory-summary:${JSON.stringify(queryParams)}` : null, "inventory/summary", { queryParams })
  return { summary: query.data, isLoading: authLoading || !ready || query.isLoading, error: query.error, mutate: query.mutate }
}
