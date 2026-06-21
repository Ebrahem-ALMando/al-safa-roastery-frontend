/**
 * Display + classification helpers for reference range rows and stored result snapshots.
 * Aligns field names with `TestFieldReferenceRange` and Laravel `reference_range_snapshot_json`.
 */

import type { TestFieldReferenceRange } from "@/features/tests/types/test.types"

export type ReferenceBoundaryLike = {
  reference_text?: string | null
  min_value?: string | number | null
  max_value?: string | number | null
}

/** Remove trailing zeros after decimal point, e.g. 2.0000 → 2, 13.5000 → 13.5 */
export function cleanNumericDisplay(value: string | number | null | undefined): string {
  if (value == null) return ""
  const s = String(value).trim()
  if (!s) return ""
  if (!/^\d+(\.\d+)?$/.test(s)) return s
  const n = parseFloat(s)
  if (Number.isNaN(n)) return s
  const rounded = Math.round(n * 10_000) / 10_000
  if (Number.isInteger(rounded)) return String(Math.round(rounded))
  return String(rounded)
}

/** Value passed into `resolveReferenceRange` — supports >, <, range, textual. */
export function referenceClassificationString(b: ReferenceBoundaryLike | null | undefined): string {
  const text = String(b?.reference_text ?? "").trim()
  if (text) return text

  const minRaw = b?.min_value != null ? String(b.min_value).trim() : ""
  const maxRaw = b?.max_value != null ? String(b.max_value).trim() : ""

  if (minRaw && maxRaw) return `${cleanNumericDisplay(minRaw)}-${cleanNumericDisplay(maxRaw)}`
  if (minRaw) return `>= ${cleanNumericDisplay(minRaw)}`
  if (maxRaw) return `<= ${cleanNumericDisplay(maxRaw)}`
  return ""
}

/** RTL-friendly monospace label (unit suffix optional). */
export function formatReferenceBoundaryDisplay(
  b: ReferenceBoundaryLike | null | undefined,
  unit?: string | null
): string {
  const cls = referenceClassificationString(b)
  const u = unit?.trim() ? ` ${unit.trim()}` : ""
  if (!cls) return "—"
  const t = cls.trim()
  if (t.includes("≤") || t.includes("≥") || t.startsWith("<") || t.startsWith(">"))
    return `${t}${u}`
  if (/^\d/.test(t) || t.includes("–") || t.includes("-")) return `${t.replace(/-/g, "–")}${u}`
  return `${t}${u}`
}

/** True when min/max or non-empty reference_text can be used for evaluation. */
export function hasEvaluableReferenceBoundary(b: ReferenceBoundaryLike | null | undefined): boolean {
  const text = String(b?.reference_text ?? "").trim()
  if (text) return true

  const minRaw = b?.min_value != null ? String(b.min_value).trim() : ""
  const maxRaw = b?.max_value != null ? String(b.max_value).trim() : ""

  return Boolean(minRaw || maxRaw)
}

function hasNumericReferenceBoundary(b: ReferenceBoundaryLike | null | undefined): boolean {
  const minRaw = b?.min_value != null ? String(b.min_value).trim() : ""
  const maxRaw = b?.max_value != null ? String(b.max_value).trim() : ""

  return Boolean(minRaw || maxRaw)
}

/**
 * Test details dialog: clearer labels for numeric bounds, reference_text, and empty rows.
 */
export function formatTestDetailsReferenceRangeDisplay(
  row: ReferenceBoundaryLike | null | undefined,
  unit?: string | null
): string {
  if (hasNumericReferenceBoundary(row)) {
    return formatReferenceBoundaryDisplay(
      {
        min_value: row?.min_value ?? null,
        max_value: row?.max_value ?? null,
        reference_text: null,
      },
      unit
    )
  }

  const referenceText = String(row?.reference_text ?? "").trim()
  if (referenceText) {
    // return `القيمة الطبيعية: ${referenceText}`
    return `${referenceText}`

  }

  return "لا يوجد نطاق مرجعي محدد"
}

const GENDER_LABEL: Record<string, string> = { male: "ذكر", female: "أنثى", __any__: "الكل" }

/** Short Arabic tags for demographics on a catalog row (for detail tables). */
export function describeReferenceRowMeta(row: TestFieldReferenceRange): string {
  const bits: string[] = []
  if (row.gender_code?.trim()) {
    const key = row.gender_code.trim().toLowerCase()
    bits.push(`الجنس: ${GENDER_LABEL[key] ?? row.gender_code}`)
  }
  const afRaw = row.age_from != null && String(row.age_from).trim() !== "" ? String(row.age_from).trim() : ""
  const atRaw = row.age_to != null && String(row.age_to).trim() !== "" ? String(row.age_to).trim() : ""
  const af = afRaw ? cleanNumericDisplay(afRaw) : ""
  const at = atRaw ? cleanNumericDisplay(atRaw) : ""
  if (af || at) {
    const unit = row.age_unit?.trim() === "month" ? "شهرًا" : row.age_unit?.trim() === "day" ? "يومًا" : "سنة"
    bits.push(af && at ? `العمر: ${af}–${at} ${unit}` : af ? `العمر: من ${af} ${unit}` : `العمر: حتى ${at} ${unit}`)
  }
  if (bits.length === 0) return "بدون تقييد ديموغرافي"
  return bits.join(" · ")
}

/** One-line stub when no patient context (lists, badges). */
export function formatCatalogFieldReferenceCompact(field: {
  reference_ranges?: TestFieldReferenceRange[] | undefined
  unit?: string | null
}): string {
  const rows = field.reference_ranges?.filter((r) => r.is_active !== false) ?? []
  if (rows.length === 0) return "—"
  if (rows.length === 1)
    return formatReferenceBoundaryDisplay(rows[0], field.unit ?? null)
  return `مراجع متعددة (${rows.length})`
}
