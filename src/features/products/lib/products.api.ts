import type { QueryParams } from "@/lib/api"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { ProductSummaryFilters, ProductsListFilters } from "../types/product.types"

export function buildReportDateQueryParams(
  dateRange: ResolvedOperationalDateRange | null
): QueryParams {
  if (!dateRange) return {}
  return {
    date_from: dateRange.from,
    date_to: dateRange.to,
  }
}

export function buildProductSummaryQueryParams(filters: ProductSummaryFilters): QueryParams {
  const q: QueryParams = {}
  if (filters.search?.trim()) q.search = filters.search.trim()
  if (typeof filters.is_active === "boolean") q.is_active = filters.is_active ? 1 : 0
  if (typeof filters.linked_item_id === "number") q.linked_item_id = filters.linked_item_id
  if (filters.price_status) q.price_status = filters.price_status
  if (filters.stock_status) q.stock_status = filters.stock_status
  if (filters.date_from) q.date_from = filters.date_from
  if (filters.date_to) q.date_to = filters.date_to
  return q
}

export function buildProductsQueryParams(page: number, filters: ProductsListFilters): QueryParams {
  const q: QueryParams = { page }

  if (filters.search?.trim()) q.search = filters.search.trim()
  if (typeof filters.is_active === "boolean") q.is_active = filters.is_active ? 1 : 0
  if (typeof filters.linked_item_id === "number") q.linked_item_id = filters.linked_item_id
  if (filters.price_status) q.price_status = filters.price_status
  if (filters.stock_status) q.stock_status = filters.stock_status
  if (filters.sort_by) q.sort_by = filters.sort_by
  if (filters.sort_direction) q.sort_direction = filters.sort_direction
  if (typeof filters.per_page === "number") {
    q.per_page = Math.min(100, Math.max(1, filters.per_page))
  }
  if (filters.date_from) q.date_from = filters.date_from
  if (filters.date_to) q.date_to = filters.date_to

  return q
}
