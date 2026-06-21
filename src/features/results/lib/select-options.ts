export type SelectOptionRow = { value: string; label: string; is_normal?: boolean }

/**
 * يدعم JSON من الـ API: مصفوفة نصوص، أو مصفوفة كائنات { value, label, is_normal? }، أو سلسلة مفصولة بفواصل.
 */
export function parseSelectOptions(raw: unknown): SelectOptionRow[] {
  if (raw == null) return []
  if (Array.isArray(raw)) {
    return raw
      .map((row): SelectOptionRow | null => {
        if (typeof row === "string" && row.trim()) {
          return { value: row.trim(), label: row.trim() }
        }
        if (row && typeof row === "object" && "value" in row) {
          const o = row as { value?: unknown; label?: unknown; is_normal?: unknown }
          const value = typeof o.value === "string" ? o.value.trim() : String(o.value ?? "").trim()
          if (!value) return null
          const label =
            typeof o.label === "string" && o.label.trim() ? o.label.trim() : value
          const is_normal = Boolean(o.is_normal)
          return { value, label, ...(is_normal ? { is_normal: true } : {}) }
        }
        return null
      })
      .filter((x): x is SelectOptionRow => x != null)
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,|]/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ value: s, label: s }))
  }
  return []
}
