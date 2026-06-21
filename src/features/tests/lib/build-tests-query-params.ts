import type { QueryParams } from "@/lib/api"
import { operationalDateScopeQueryKeysForPage } from "@/lib/date-scope/operational-date-scope-query-mapping"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { appendOperationalDateRangeToQueryParams } from "@/lib/date-scope/operational-date-scope-query"
import type { TestsListFilters } from "../types/test.types"

export function buildTestsQueryParams(
  page: number,
  filters: Omit<TestsListFilters, "page" | "created_from" | "created_to">,
  dateRange: ResolvedOperationalDateRange | null,
  options?: { perPage?: number }
): QueryParams {
  const q: QueryParams = { page }
  if (filters.search != null && String(filters.search).trim() !== "") {
    q.search = String(filters.search).trim()
  }
  if (typeof filters.category_id === "number") {
    q.category_id = filters.category_id
  }
  if (typeof filters.is_active === "boolean") {
    q.is_active = filters.is_active ? 1 : 0
  }
  const withDate = appendOperationalDateRangeToQueryParams(
    q,
    dateRange,
    operationalDateScopeQueryKeysForPage("tests")
  )
  if (typeof options?.perPage === "number") {
    withDate.per_page = Math.min(100, Math.max(1, options.perPage))
  }
  return withDate
}
