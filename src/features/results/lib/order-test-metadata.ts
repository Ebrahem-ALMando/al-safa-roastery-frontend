import type { LabOrder, LabOrderItem, LabOrderItemTestField } from "@/features/orders/types/order.types"
import {
  getTestTemplateType,
  isTemplateTest,
} from "@/features/tests/lib/test-template-helpers"

function fieldHasSectionMetadata(field: LabOrderItemTestField): boolean {
  return Boolean(field.section_key?.trim())
}

/**
 * True when nested `item.test` already carries enough template metadata from
 * `GET /api/v1/lab-orders/{id}` so grouping and input rendering work without
 * `GET /tests/{id}`. `input_type` may be omitted; it is derived from `field_type`.
 */
export function isOrderItemTestMetadataComplete(item: LabOrderItem): boolean {
  if (!item.test) {
    return false
  }

  const fields = item.test.fields ?? []
  if (fields.length === 0) {
    return true
  }

  const templateType = getTestTemplateType(item.test)

  if (!isTemplateTest(item.test)) {
    return true
  }

  const rawType = item.test.test_template_type
  if (rawType !== templateType) {
    return false
  }

  return fields.every((field) => fieldHasSectionMetadata(field))
}

export function getOrderTestIdsNeedingCatalogEnrichment(order: LabOrder): number[] {
  const ids = new Set<number>()

  for (const item of order.items) {
    if (typeof item.test_id !== "number" || item.test_id <= 0) {
      continue
    }
    if (!isOrderItemTestMetadataComplete(item)) {
      ids.add(item.test_id)
    }
  }

  return [...ids].sort((a, b) => a - b)
}

export function isLabOrderTemplateMetadataComplete(order: LabOrder): boolean {
  return getOrderTestIdsNeedingCatalogEnrichment(order).length === 0
}
