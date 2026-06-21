import type { QueryParams } from "@/lib/api"
import type { OperationalDateRangeQueryKeysPick } from "./operational-date-scope-query-mapping"
import type { ResolvedOperationalDateRange } from "./operational-date-scope.types"

/** يدمج `{ from, to }` في بارامترات GET حسب ربط الصفحة (انظر `operational-date-scope-query-mapping`). */
export function appendOperationalDateRangeToQueryParams(
  q: QueryParams,
  range: ResolvedOperationalDateRange | null | undefined,
  keys: OperationalDateRangeQueryKeysPick
): QueryParams {
  if (!range) return q
  return {
    ...q,
    [keys.queryFromKey]: range.from,
    [keys.queryToKey]: range.to,
  }
}
