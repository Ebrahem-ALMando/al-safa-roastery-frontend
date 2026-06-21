import type { LabOrder, LabOrderItemTestField } from "@/features/orders/types/order.types"
import type { Test } from "@/features/tests/types/test.types"

export function mergeCatalogIntoOrderItemTestFields(
  fields: LabOrderItemTestField[],
  catalogFields: Test["fields"]
): LabOrderItemTestField[] {
  const byId = new Map(catalogFields.map((field) => [field.id, field]))

  return fields.map((field) => {
    const catalogField = byId.get(field.id)
    if (!catalogField) {
      return field
    }

    return {
      ...field,
      section_key: catalogField.section_key ?? null,
      section_label: catalogField.section_label ?? null,
      section_label_ar: catalogField.section_label_ar ?? null,
      input_type: catalogField.input_type ?? null,
    }
  })
}

export function enrichLabOrderWithTestCatalogs(
  order: LabOrder,
  catalogs: Map<number, Test>
): LabOrder {
  return {
    ...order,
    items: order.items.map((item) => {
      const catalog = catalogs.get(item.test_id)
      if (!catalog?.fields?.length || !item.test) {
        return item
      }

      return {
        ...item,
        test: {
          ...item.test,
          test_template_type: catalog.test_template_type ?? item.test.test_template_type,
          fields: mergeCatalogIntoOrderItemTestFields(item.test.fields, catalog.fields),
        },
      }
    }),
  }
}
