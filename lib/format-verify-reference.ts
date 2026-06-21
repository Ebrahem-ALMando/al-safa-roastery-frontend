import type { VerifyResultRow } from "@/lib/verify-types"
import { cleanNumericDisplay, formatReferenceBoundaryDisplay } from "@/lib/reference-range-format"

/** Human-readable reference range for verification table cells. */
export function formatVerifyReference(r: VerifyResultRow): string {
  const snap = r.reference_range_snapshot
  if (!snap || typeof snap !== "object") return "—"
  const o = snap as Record<string, unknown>
  return formatReferenceBoundaryDisplay(
    {
      reference_text: typeof o.reference_text === "string" ? o.reference_text : null,
      min_value: o.min_value != null ? String(o.min_value) : null,
      max_value: o.max_value != null ? String(o.max_value) : null,
    },
    r.unit ?? null
  )
}

/** المعدّل + التلميح الديموغرافي من الخادم (سطر ثان خفيف). */
export function formatVerifyReferenceDisplayBlock(r: VerifyResultRow): string {
  const main = formatVerifyReference(r)
  const hint =
    typeof r.demographic_hint_ar === "string" ? r.demographic_hint_ar.trim() : ""
  const cleanedHint = hint ? hint.replace(/\d+\.\d+/g, (m) => cleanNumericDisplay(m)) : ""
  if (!cleanedHint) return main
  if (main === "—" || !main.trim()) return cleanedHint
  return `${main}\n${cleanedHint}`
}
