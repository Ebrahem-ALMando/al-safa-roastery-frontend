import type { QueryParams } from "@/lib/api"
import type { InventoryItemsFilters, InventoryMovementFilters } from "../types/inventory.types"

function compact(input: Record<string, unknown>): QueryParams {
  const result: QueryParams = {}
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0)) {
      result[key] = value as QueryParams[string]
    }
  })
  return result
}
export const buildInventoryItemsQuery = (filters: InventoryItemsFilters): QueryParams => compact(filters)
export const buildInventoryMovementsQuery = (filters: InventoryMovementFilters): QueryParams => compact(filters)
