import type { LabOrderItem, LabOrderItemResult, LabOrderItemTestField } from "@/features/orders/types/order.types"
import {
  DEFAULT_SECTION_KEY,
  getTestTemplateType,
  groupTestFieldsBySection,
  shouldShowGroupedFields,
  type TestFieldSectionGroup,
} from "@/features/tests/lib/test-template-helpers"
import type { TestField } from "@/features/tests/types/test.types"

export type OrderItemResultSectionGroup = {
  sectionKey: string
  label: string
  results: LabOrderItemResult[]
}

function orderItemTestMeta(item: LabOrderItem) {
  return {
    test_template_type: item.test?.test_template_type,
    fields: (item.test?.fields ?? []) as TestField[],
  }
}

export function shouldGroupOrderItemResults(item: LabOrderItem): boolean {
  if (!item.test?.fields?.length) {
    return false
  }

  return shouldShowGroupedFields(orderItemTestMeta(item))
}

export function buildOrderItemResultSectionGroups(
  item: LabOrderItem,
  options?: { preferArabic?: boolean }
): OrderItemResultSectionGroup[] | null {
  const fields = item.test?.fields ?? []
  if (!shouldGroupOrderItemResults(item)) {
    return null
  }

  const preferArabic = options?.preferArabic ?? true
  const templateType = getTestTemplateType(orderItemTestMeta(item))
  const fieldGroups = groupTestFieldsBySection(fields as TestField[], {
    preferArabic,
    templateType,
  })

  const resultByFieldId = new Map(
    (item.results ?? []).map((result) => [result.test_field_id, result])
  )

  return fieldGroups.map((group) => ({
    sectionKey: group.sectionKey,
    label: group.label,
    results: group.fields
      .map((field) => resultByFieldId.get(field.id))
      .filter((result): result is LabOrderItemResult => result != null),
  }))
}

export function sortOrderItemResultsByFieldOrder(
  item: LabOrderItem,
  results: LabOrderItemResult[]
): LabOrderItemResult[] {
  const fieldById = new Map((item.test?.fields ?? []).map((field) => [field.id, field]))

  return [...results].sort((a, b) => {
    const fieldA = fieldById.get(a.test_field_id)
    const fieldB = fieldById.get(b.test_field_id)
    const sortA = fieldA?.sort_order ?? 0
    const sortB = fieldB?.sort_order ?? 0
    if (sortA !== sortB) return sortA - sortB
    return a.id - b.id
  })
}

export function findOrderItemFieldForResult(
  item: LabOrderItem,
  result: LabOrderItemResult
): LabOrderItemTestField | undefined {
  return item.test?.fields?.find((field) => field.id === result.test_field_id)
}

export function orderItemFieldGroupsForEntry(
  item: LabOrderItem,
  options?: { preferArabic?: boolean }
): TestFieldSectionGroup[] | null {
  const fields = item.test?.fields ?? []
  if (!fields.length) {
    return null
  }

  if (!shouldGroupOrderItemResults(item)) {
    return null
  }

  return groupTestFieldsBySection(fields as TestField[], {
    preferArabic: options?.preferArabic ?? true,
    templateType: getTestTemplateType(orderItemTestMeta(item)),
  })
}

export { DEFAULT_SECTION_KEY }
