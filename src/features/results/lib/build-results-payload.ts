import type { LabOrderItem } from "@/features/orders/types/order.types"

export type ResultValueRow = {
  test_field_id: number
  value_number?: number | null
  value_text?: string | null
  value_select?: string | null
  notes?: string | null
}

function hasText(v: string | undefined): boolean {
  return v != null && v.trim() !== ""
}

function parseNumber(raw: string): number | null {
  const t = raw.trim().replace(",", ".")
  if (t === "") return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function buildResultRowsForItem(
  item: LabOrderItem,
  values: Record<string, string>,
  options?: { enforceRequired?: boolean }
): { rows: ResultValueRow[]; errors: string[] } {
  const errors: string[] = []
  const enforceRequired = options?.enforceRequired ?? true
  const fields = item.test?.fields ?? []
  if (fields.length === 0) {
    return { rows: [], errors: ["لا توجد حقول فحص مرتبطة بهذا البند."] }
  }

  const rows: ResultValueRow[] = []

  for (const field of fields) {
    const key = `${item.id}:${field.id}`
    const raw = values[key] ?? ""

    if (!hasText(raw)) {
      if (enforceRequired && field.is_required) {
        errors.push(`الحقل «${field.name}» إلزامي.`)
      }
      continue
    }

    if (field.field_type === "number") {
      const n = parseNumber(raw)
      if (n === null) {
        errors.push(`قيمة غير صالحة للحقل «${field.name}».`)
        continue
      }
      rows.push({
        test_field_id: field.id,
        value_number: n,
        value_text: null,
        value_select: null,
        notes: null,
      })
      continue
    }

    if (field.field_type === "text") {
      rows.push({
        test_field_id: field.id,
        value_number: null,
        value_text: raw.trim(),
        value_select: null,
        notes: null,
      })
      continue
    }

    rows.push({
      test_field_id: field.id,
      value_number: null,
      value_text: null,
      value_select: raw.trim(),
      notes: null,
    })
  }

  return { rows, errors }
}

export function itemHasAllRequiredFilled(
  item: LabOrderItem,
  values: Record<string, string>
): boolean {
  const fields = item.test?.fields ?? []
  for (const f of fields) {
    if (!f.is_required) continue
    const key = `${item.id}:${f.id}`
    if (!hasText(values[key] ?? "")) return false
  }
  return fields.length > 0
}
