"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import { buildInventoryMovementsQuery } from "../lib/inventory.api"
import type { InventoryMovement, InventoryMovementFilters, InventoryPaginationMeta } from "../types/inventory.types"

export function useInventoryMovements(filters: InventoryMovementFilters, itemScoped = false, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const queryParams = useMemo(() => buildInventoryMovementsQuery(filters), [filters])
  const endpoint = itemScoped && filters.item_id ? `inventory/items/${filters.item_id}/movements` : "inventory/movements"
  const ready = enabled && !authLoading && isAuthenticated && (!itemScoped || Boolean(filters.item_id))
  const query = useApiQuery<InventoryMovement[]>(ready ? `inventory-movements:${JSON.stringify({ endpoint, queryParams })}` : null, endpoint, { queryParams, paginated: true })
  return { movements: query.data ?? [], meta: query.meta as InventoryPaginationMeta | undefined, isLoading: authLoading || !ready || query.isLoading, error: query.error, mutate: query.mutate }
}
