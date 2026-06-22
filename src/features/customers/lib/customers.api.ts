import type { QueryParams } from "@/lib/api"
import type { CustomersListFilters } from "../types/customer.types"

export function buildCustomersQueryParams(
  page: number,
  filters: CustomersListFilters
): QueryParams {
  const q: QueryParams = { page }

  if (filters.search != null && String(filters.search).trim() !== "") {
    q.search = String(filters.search).trim()
  }
  if (typeof filters.is_active === "boolean") {
    q.is_active = filters.is_active ? 1 : 0
  }
  if (filters.customer_type) {
    q.customer_type = filters.customer_type
  }
  if (filters.balance_status) {
    q.balance_status = filters.balance_status
  }
  if (typeof filters.balance_min === "number" && Number.isFinite(filters.balance_min)) {
    q.balance_min = filters.balance_min
  }
  if (typeof filters.balance_max === "number" && Number.isFinite(filters.balance_max)) {
    q.balance_max = filters.balance_max
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
