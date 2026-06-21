import type { OperationalDateScopePageId, OperationalDateScopePreset } from "./operational-date-scope.types"

/** افتراضي لكل صفحة عند عدم وجود قيمة صالحة في التخزين المحلي */
export const OPERATIONAL_DATE_SCOPE_DEFAULT_PRESET = {
  patients: "all",
  orders: "today",
  results: "today",
  reports: "today",
  tests: "all",
  test_categories: "all",
} satisfies Record<OperationalDateScopePageId, OperationalDateScopePreset>
