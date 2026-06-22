import type { QueryParams } from "@/lib/api"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { PurchaseSummaryFilters, PurchasesListFilters } from "../types/purchase.types"

export function buildReportDateQueryParams(
  dateRange: ResolvedOperationalDateRange | null
): QueryParams {
  if (!dateRange) return {}
  return {
    date_from: dateRange.from,
    date_to: dateRange.to,
  }
}

export function buildSummaryQueryParams(filters: PurchaseSummaryFilters): QueryParams {
  const q: QueryParams = {}
  if (filters.date_from) q.date_from = filters.date_from
  if (filters.date_to) q.date_to = filters.date_to
  if (typeof filters.supplier_id === "number") q.supplier_id = filters.supplier_id
  if (filters.status) q.status = filters.status
  if (filters.payment_status) q.payment_status = filters.payment_status
  if (filters.payment_method) q.payment_method = filters.payment_method
  return q
}

export function buildPurchasesQueryParams(page: number, filters: PurchasesListFilters): QueryParams {
  const q: QueryParams = { page }

  if (filters.search != null && String(filters.search).trim() !== "") {
    q.search = String(filters.search).trim()
  }
  if (typeof filters.supplier_id === "number") {
    q.supplier_id = filters.supplier_id
  }
  if (filters.status) {
    q.status = filters.status
  }
  if (filters.payment_status) {
    q.payment_status = filters.payment_status
  }
  if (filters.payment_method) {
    q.payment_method = filters.payment_method
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
