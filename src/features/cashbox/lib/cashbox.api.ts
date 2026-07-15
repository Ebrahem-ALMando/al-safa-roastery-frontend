import type { QueryParams } from "@/lib/api"
import type { CashboxFilters } from "../types/cashbox.types"

export function buildCashboxQuery(filters: CashboxFilters): QueryParams {
  const query: QueryParams = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query[key] = value
  })
  return query
}
