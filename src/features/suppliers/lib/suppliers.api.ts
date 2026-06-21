import type { QueryParams } from "@/lib/api"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { SuppliersListFilters } from "../types/supplier.types"

export function buildSuppliersQueryParams(
  page: number,
  filters: SuppliersListFilters
): QueryParams {
  const q: QueryParams = { page }

  if (filters.search != null && String(filters.search).trim() !== "") {
    q.search = String(filters.search).trim()
  }
  if (typeof filters.is_active === "boolean") {
    q.is_active = filters.is_active ? 1 : 0
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

  return q
}

export function buildReportDateQueryParams(
  dateRange: ResolvedOperationalDateRange | null
): QueryParams {
  if (!dateRange) return {}
  return {
    date_from: dateRange.from,
    date_to: dateRange.to,
  }
}
