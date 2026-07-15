import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"

export type InventoryItemType = "raw" | "ready"
export type InventoryStockStatus = "available" | "low" | "out_of_stock"
export type InventoryStockStatusFilter = InventoryStockStatus | "reorder_required"
export type InventoryDirection = "in" | "out"

export type InventoryUserRef = { id: number; name: string; username?: string }
export type InventoryLastActivity = { type: string; label: string; number: string | null; date: string }

export type InventoryMovement = {
  id: number
  item_id: number
  item?: Pick<InventoryItem, "id" | "code" | "name" | "item_type" | "current_quantity_kg">
  movement_type: string
  movement_label_ar: string
  direction: InventoryDirection
  quantity_kg: string | number
  unit_cost: string | number | null
  total_cost: string | number | null
  quantity_before: string | number
  quantity_after: string | number
  balance_after_kg: string | number | null
  source_type: string | null
  source_id: number | null
  source_number: string | null
  reason: string | null
  notes: string | null
  movement_date: string
  created_at: string
  created_by?: InventoryUserRef
}

export type InventoryItem = {
  id: number
  code: string
  name: string
  item_type: InventoryItemType
  unit: string
  current_quantity_kg: string | number
  average_cost: string | number
  last_purchase_price: string | number
  minimum_quantity_kg: string | number
  stock_status: InventoryStockStatus
  reorder_required: boolean
  stock_value: string | number
  is_active: boolean
  notes: string | null
  last_activity: InventoryLastActivity | null
  movements_count_in_period: number | null
  latest_movement: InventoryMovement | null
  movement_totals_in_period: {
    movements_count: number
    incoming_quantity_kg: string | number
    outgoing_quantity_kg: string | number
  } | null
  created_at: string
  updated_at: string
  created_by?: InventoryUserRef
  updated_by?: InventoryUserRef
}

export type InventorySummaryResponse = {
  current_stock_value: string | number
  available_items_count: number
  reorder_required_items_count: number
  movements_count_in_period: number
}

export type InventoryPaginationMeta = {
  total: number; current_page: number; per_page: number; last_page: number; from?: number; to?: number
}

export type InventoryItemsFilters = {
  search?: string; item_id?: number; item_type?: InventoryItemType
  stock_status?: InventoryStockStatusFilter; quantity_min?: number; quantity_max?: number
  page?: number; per_page?: number; sort_by?: string; sort_direction?: "asc" | "desc"
  date_from?: string; date_to?: string
}

export type InventoryMovementFilters = {
  search?: string; item_id?: number; item_type?: InventoryItemType; movement_type?: string
  direction?: InventoryDirection; source_type?: string; page?: number; per_page?: number
  sort_by?: string; sort_direction?: "asc" | "desc"; date_from?: string; date_to?: string
}

export type WithdrawalReason = "general" | "internal_use" | "damage" | "sample" | "shortage" | "other"
export type AdjustmentReason = "stock_count" | "correction" | "damaged_found" | "other"
export type InventoryWithdrawalInput = { item_id: number; quantity_kg: number; reason: WithdrawalReason; notes?: string | null }
export type InventoryAdjustmentInput = { item_id: number; actual_quantity_kg: number; reason: AdjustmentReason; unit_cost?: number; notes?: string | null }

export type InventoryDateRange = ResolvedOperationalDateRange | null
