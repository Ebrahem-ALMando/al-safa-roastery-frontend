/**
 * تمثيل خيارات القائمة في نموذج إضافة/تعديل الفحص (سلسلة JSON في `LabTestField.selectOptions`).
 */

export type SelectOptionFormRow = {
  value: string
  /** الخيار الذي يُعتبر «طبيعيًا» ضمن المعدل عند الإدخال الافتراضي للنتائج */
  is_normal?: boolean
}

export function parseSelectOptionsForm(raw: string | undefined): SelectOptionFormRow[] {
  if (raw == null || !String(raw).trim()) return []
  const s = String(raw).trim()
  if (s.startsWith("[")) {
    try {
      const j = JSON.parse(s) as unknown
      if (!Array.isArray(j)) return []
      return j.flatMap((row): SelectOptionFormRow[] => {
        if (typeof row === "string" && row.trim()) {
          return [{ value: row.trim() }]
        }
        if (row && typeof row === "object" && "value" in row) {
          const o = row as { value?: unknown; is_normal?: unknown }
          const value = typeof o.value === "string" ? o.value.trim() : String(o.value ?? "").trim()
          if (!value) return []
          return [{ value, is_normal: Boolean(o.is_normal) }]
        }
        return []
      })
    } catch {
      /* fallthrough */
    }
  }
  return s
    .split(/[,،]/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((value) => ({ value }))
}

export function serializeSelectOptionsForm(rows: SelectOptionFormRow[]): string {
  const cleaned = rows
    .map((r) => ({ value: r.value.trim(), is_normal: Boolean(r.is_normal) }))
    .filter((r) => r.value.length > 0)
  return JSON.stringify(
    cleaned.map(({ value, is_normal }) => (is_normal ? { value, is_normal: true } : { value }))
  )
}

/** تحويل ما يعيده الـ API إلى سلسلة النموذج (JSON موحّد). */
export function apiSelectOptionsToFormString(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value.trim()
  if (!Array.isArray(value)) return ""
  if (value.length === 0) return ""
  if (typeof value[0] === "string") {
    const rows: SelectOptionFormRow[] = value
      .map((v) => ({ value: String(v).trim() }))
      .filter((r) => r.value.length > 0)
    return serializeSelectOptionsForm(rows)
  }
  const rows: SelectOptionFormRow[] = value.flatMap((row): SelectOptionFormRow[] => {
    if (typeof row === "string" && row.trim()) return [{ value: row.trim() }]
    if (row && typeof row === "object" && "value" in row) {
      const o = row as { value?: unknown; is_normal?: unknown; label?: unknown }
      const val = typeof o.value === "string" ? o.value.trim() : String(o.value ?? "").trim()
      if (!val) return []
      return [{ value: val, is_normal: Boolean(o.is_normal) }]
    }
    return []
  })
  return serializeSelectOptionsForm(rows)
}
