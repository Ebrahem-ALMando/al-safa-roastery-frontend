import type { QueryParams } from "@/lib/api"
import type { ProductionListFilters } from "../types/production.types"

export function buildProductionQueryParams(page: number | null, filters: ProductionListFilters): QueryParams {
  const query: QueryParams = {}
  if (page !== null) query.page = page
  if (filters.search?.trim()) query.search = filters.search.trim()
  if (filters.status) query.status = filters.status
  if (filters.output_item_id) query.output_item_id = filters.output_item_id
  if (filters.input_item_ids?.length) query.input_item_ids = filters.input_item_ids
  if (filters.output_quantity_min !== undefined) query.output_quantity_min = filters.output_quantity_min
  if (filters.output_quantity_max !== undefined) query.output_quantity_max = filters.output_quantity_max
  if (filters.date_from) query.date_from = filters.date_from
  if (filters.date_to) query.date_to = filters.date_to
  if (filters.sort_by) query.sort_by = filters.sort_by
  if (filters.sort_direction) query.sort_direction = filters.sort_direction
  if (filters.per_page) query.per_page = Math.min(100, Math.max(1, filters.per_page))
  return query
}
