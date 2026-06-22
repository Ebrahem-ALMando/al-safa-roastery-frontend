import type { QueryParams } from "@/lib/api"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { ItemsListFilters } from "../types/item.types"

export function buildReportDateQueryParams(
  dateRange: ResolvedOperationalDateRange | null
): QueryParams {
  if (!dateRange) return {}
  return {
    date_from: dateRange.from,
    date_to: dateRange.to,
  }
}

export function buildItemsQueryParams(page: number, filters: ItemsListFilters): QueryParams {
  const q: QueryParams = { page }

  if (filters.search != null && String(filters.search).trim() !== "") {
    q.search = String(filters.search).trim()
  }
  if (typeof filters.is_active === "boolean") {
    q.is_active = filters.is_active ? 1 : 0
  }
  if (filters.item_type) {
    q.item_type = filters.item_type
  }
  if (filters.stock_status) {
    q.stock_status = filters.stock_status
  }
  if (typeof filters.quantity_min === "number" && Number.isFinite(filters.quantity_min)) {
    q.quantity_min = filters.quantity_min
  }
  if (typeof filters.quantity_max === "number" && Number.isFinite(filters.quantity_max)) {
    q.quantity_max = filters.quantity_max
  }
  if (filters.sort_by) {
    q.sort_by = filters.sort_by
  }
  if (filters.sort_direction) {
    q.sort_direction = filters.sort_direction
  }
  if (typeof filters.per_page === "number") {
    q.per_page = Math.min(100, Math.max(1, filters.per_page))
  }
  if (filters.date_from) {
    q.date_from = filters.date_from
  }
  if (filters.date_to) {
    q.date_to = filters.date_to
  }

  return q
}
