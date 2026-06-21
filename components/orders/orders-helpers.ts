import type { LabOrder, LabOrderItem, LabOrderItemResult, LabOrderResultFlag } from "@/features/orders"
import { ORDER_FIELD_NO_REFERENCE_MATCH_SHORT_AR } from "@/components/results/results-helpers"
import {
  formatCatalogFieldReferenceCompact,
  formatReferenceBoundaryDisplay,
} from "@/lib/reference-range-format"

export const orderStatusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "draft", label: "مسودة" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "completed", label: "مكتمل" },
  { value: "approved", label: "معتمد" },
  { value: "cancelled", label: "ملغي" },
] as const

export function getOrderStatusLabel(status: LabOrder["status"]): string {
  return orderStatusOptions.find((s) => s.value === status)?.label ?? status
}

export function getOrderStatusClassName(status: LabOrder["status"]): string {
  switch (status) {
    case "draft":
      return "bg-slate-500/10 text-slate-700 border-slate-500/30"
    case "pending":
      return "bg-amber-500/10 text-amber-700 border-amber-500/30"
    case "in_progress":
      return "bg-blue-500/10 text-blue-700 border-blue-500/30"
    case "completed":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
    case "approved":
      return "bg-violet-500/10 text-violet-700 border-violet-500/30"
    case "cancelled":
      return "bg-rose-500/10 text-rose-700 border-rose-500/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export function getLabOrderItemStatusLabelAr(status: string): string {
  const map: Record<string, string> = {
    pending: "قيد الانتظار",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    approved: "معتمد",
    cancelled: "ملغي",
  }
  return map[status] ?? status
}

export function getEntryStatusLabelAr(status: string): string {
  const map: Record<string, string> = {
    not_entered: "غير مدخل",
    entered: "مدخل",
    reviewed: "مراجع",
  }
  return map[status] ?? status
}

export function getResultFlagLabelAr(flag: LabOrderResultFlag | null | undefined): string {
  if (flag == null) return "—"
  const map: Record<LabOrderResultFlag, string> = {
    normal: "طبيعي",
    abnormal: "غير طبيعي",
    low: "منخفض",
    high: "مرتفع",
  }
  return map[flag] ?? flag
}

/** خلفية صف الجدول بلون خفيف حسب `ResultFlag` (تنسيق عرضي هادئ). */
export function getResultFlagRowClassName(flag: LabOrderResultFlag | null | undefined): string {
  switch (flag) {
    case "normal":
      return "bg-emerald-50/95 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/40"
    case "low":
      return "bg-sky-50/95 hover:bg-sky-50/90 dark:bg-sky-950/30 dark:hover:bg-sky-950/40"
    case "high":
      return "bg-amber-50/95 hover:bg-amber-50/90 dark:bg-amber-950/30 dark:hover:bg-amber-950/40"
    case "abnormal":
      return "bg-rose-50/95 hover:bg-rose-50/90 dark:bg-rose-950/30 dark:hover:bg-rose-950/40"
    default:
      return "bg-slate-50/90 hover:bg-slate-100/90 dark:bg-muted/25 dark:hover:bg-muted/35"
  }
}

export type ReferenceDisplayParts = {
  range: string
  /** تسمية مختصرة للشارة (ذكور، إناث، عمر…) — null إذا المرجع عاماً للجميع. */
  demographicLabel: string | null
}

/** يحوّل تلميح الخادم إلى نص شارة قصير دون «ينطبق على» أو «عموم المراجع». */
export function demographicHintToBadgeLabel(hint: string | null | undefined): string | null {
  if (!hint?.trim()) return null

  const raw = hint
    .trim()
    .replace(/^ينطبق على:\s*/u, "")
    .trim()
  if (!raw || raw.includes("عموم المراجع")) return null

  const mapPart = (part: string) => {
    const t = part.trim()
    if (t === "ذكر") return "ذكور"
    if (t === "أنثى") return "إناث"
    return t
  }

  return raw
    .split("·")
    .map((p) => mapPart(p))
    .filter(Boolean)
    .join(" · ")
}

function snapshotToBoundary(snap: LabOrderItemResult["reference_range_snapshot"]) {
  if (snap == null || typeof snap !== "object") return null
  const o = snap as Record<string, unknown>
  return {
    reference_text: typeof o.reference_text === "string" ? o.reference_text : null,
    min_value: o.min_value != null ? String(o.min_value) : null,
    max_value: o.max_value != null ? String(o.max_value) : null,
  }
}

export function formatResultReferenceParts(r: LabOrderItemResult): ReferenceDisplayParts {
  const boundary = snapshotToBoundary(r.reference_range_snapshot)
  if (!boundary) return { range: "—", demographicLabel: null }

  const range = formatReferenceBoundaryDisplay(boundary, r.unit)
  if (range === "—") return { range: "—", demographicLabel: null }

  return {
    range,
    demographicLabel: demographicHintToBadgeLabel(r.demographic_hint_ar),
  }
}

export function formatResultReference(r: LabOrderItemResult): string {
  const { range, demographicLabel } = formatResultReferenceParts(r)
  if (range === "—") return "—"
  if (demographicLabel) return `${range}\n${demographicLabel}`
  return range
}

/**
 * مرجع النتيجة للعرض: اللقطة المحفوظة عند الإدخال، وإلا المرجع المحلول لسياق مريض الطلب،
 * وإلا ملخص من كتالوج الفحص — للطلبات القديمة بلا `reference_range_snapshot`.
 */
export function formatOrderItemResultReferenceParts(
  item: LabOrderItem,
  r: LabOrderItemResult
): ReferenceDisplayParts {
  const fromSnapshot = formatResultReferenceParts(r)
  if (fromSnapshot.range !== "—") return fromSnapshot

  const field = item.test?.fields?.find((f) => f.id === r.test_field_id)
  if (!field) return { range: "—", demographicLabel: null }

  if (field.resolved_match_status === "no_match") {
    return { range: ORDER_FIELD_NO_REFERENCE_MATCH_SHORT_AR, demographicLabel: null }
  }

  if (field.resolved_match_status === "matched" && field.resolved_reference_range) {
    const range = formatReferenceBoundaryDisplay(field.resolved_reference_range, r.unit ?? field.unit)
    if (range.trim() && range !== "—") {
      return {
        range,
        demographicLabel: demographicHintToBadgeLabel(field.resolved_demographic_hint_ar),
      }
    }
  }

  const catalog = formatCatalogFieldReferenceCompact(field)
  if (catalog.trim() && catalog !== "—") {
    return { range: catalog, demographicLabel: null }
  }

  return { range: "—", demographicLabel: null }
}

export function formatOrderItemResultReference(item: LabOrderItem, r: LabOrderItemResult): string {
  const { range, demographicLabel } = formatOrderItemResultReferenceParts(item, r)
  if (range === "—") return "—"
  if (demographicLabel) return `${range}\n${demographicLabel}`
  return range
}

/** طلب فيه أي نتيجة مصنّفة بخلاف «طبيعي» وفق `result_flag`. */
export function orderHasNonNormalResultFlag(order: LabOrder): boolean {
  return order.items.some((item) =>
    (item.results ?? []).some((r) => r.result_flag != null && r.result_flag !== "normal")
  )
}

export function formatResultValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "number" && Number.isNaN(value)) return "—"
  return String(value)
}

export function formatArDateTime(value: string | null): { date: string; time: string } {
  if (!value) return { date: "—", time: "—" }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return { date: "—", time: "—" }
  return {
    date: d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}
