import type { LabOrderItem, LabOrderItemResult } from "@/features/orders/types/order.types"
import { isOptionalNarrativeResultField } from "@/features/results/lib/result-entry-reference"

function resultHasValue(r: LabOrderItemResult): boolean {
  const val = r.value
  if (val === null || val === undefined) return false
  return String(val).trim() !== ""
}

/**
 * Report/print: omit optional empty saved rows; keep required rows even if empty.
 */
export function shouldIncludeResultInReport(
  item: LabOrderItem,
  result: LabOrderItemResult
): boolean {
  if (resultHasValue(result)) return true

  const field = item.test?.fields?.find((f) => f.id === result.test_field_id)
  if (!field) return false
  if (field.is_required) return true

  if (isOptionalNarrativeResultField(field)) return false

  return false
}

export function filterResultsForReport(item: LabOrderItem): LabOrderItemResult[] {
  return (item.results ?? []).filter((r) => shouldIncludeResultInReport(item, r))
}
