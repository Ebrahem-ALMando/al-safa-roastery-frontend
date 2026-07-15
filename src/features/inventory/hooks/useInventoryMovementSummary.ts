"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildInventoryMovementsQuery } from "../lib/inventory.api"
import type { InventoryMovementFilters, InventoryMovementSummaryResponse } from "../types/inventory.types"

type SummaryFilters = Omit<InventoryMovementFilters, "page" | "per_page" | "sort_by" | "sort_direction">

export function useInventoryMovementSummary(filters: SummaryFilters, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildInventoryMovementsQuery(filters), [filters])
  const ready = enabled && !authLoading && isAuthenticated
  const query = useApiQuery<InventoryMovementSummaryResponse>(
    ready ? `inventory-movements-summary:${JSON.stringify(queryParams)}` : null,
    "inventory/movements/summary",
    { queryParams }
  )
  return {
    summary: query.data,
    isLoading: authLoading || !ready || query.isLoading,
    error: query.error,
    mutate: query.mutate,
  }
}
