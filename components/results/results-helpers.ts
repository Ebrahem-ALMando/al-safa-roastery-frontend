import type {
  LabOrder,
  LabOrderItem,
  LabOrderItemResult,
  LabOrderItemTestField,
  LabOrderPatient,
  LabOrderResultFlag,
} from "@/features/orders"
import { parseSelectOptions } from "@/features/results/lib/select-options"
import { resolveReferenceRange } from "@/lib/reference-range-resolver"
import {
  formatReferenceBoundaryDisplay,
  hasEvaluableReferenceBoundary,
  referenceClassificationString,
  type ReferenceBoundaryLike,
} from "@/lib/reference-range-format"
import {
  patientClinicalBriefAr,
  referenceRangeDemographicHint,
  formatAgeDisplay,
} from "@/lib/patient-clinical-display"
import { formatArDateTime } from "@/components/orders/orders-helpers"

export type ResultsProgressStatus = "pending" | "partial" | "completed"

/** نص احترافي عند تعذّر مطابقة نطاق المرجع في سياق المريض (من الخادم). */
export const ORDER_FIELD_NO_REFERENCE_MATCH_AR =
  "لا يوجد نطاق مرجعي منطبق على بيانات هذا المريض وفقًا للتصنيفات المخزّنة."

/** نص مختصر للعرض في صف الإدخال/الجدول — التفاصيل في `title`. */
export const ORDER_FIELD_NO_REFERENCE_MATCH_SHORT_AR = "لا يوجد نطاق مرجعي منطبق"

/** عند نقص حقول الطلب قبل التحديث. */
export const ORDER_FIELD_REFERENCE_NOT_RESOLVED_AR =
  "لم يُحسب النطاق المرجعي للمريض — يُفضَّل تحديث الصفحة أو إعادة جلب الطلب."

const ENTERED_LIKE = new Set(["entered", "reviewed"])

function resultRowFilled(r: LabOrderItemResult): boolean {
  if (!ENTERED_LIKE.has(r.entry_status)) return false
  const v = r.value
  if (v === null || v === undefined) return false
  if (typeof v === "string" && v.trim() === "") return false
  return true
}

function countFilledRequiredForItem(item: LabOrderItem): { done: number; total: number } | null {
  const fields = item.test?.fields?.filter((f) => f.is_required)
  if (!fields?.length) return null
  let done = 0
  for (const f of fields) {
    const r = item.results?.find((x) => x.test_field_id === f.id)
    if (r && resultRowFilled(r)) done++
  }
  return { done, total: fields.length }
}

export function countItemProgress(order: LabOrder): { done: number; total: number } {
  const items = order.items ?? []
  let done = 0
  let total = 0
  for (const item of items) {
    const byFields = countFilledRequiredForItem(item)
    if (byFields) {
      done += byFields.done
      total += byFields.total
    } else {
      total += 1
      if (item.status === "completed" || item.status === "approved") done += 1
    }
  }
  return { done, total }
}

export function getResultsProgressStatus(order: LabOrder): ResultsProgressStatus {
  const { done, total } = countItemProgress(order)
  if (total === 0) return "pending"
  if (done === 0) return "pending"
  if (done === total) return "completed"
  return "partial"
}

export function countOrdersByResultsProgress(orders: LabOrder[]): {
  completed: number
  partial: number
  pending: number
} {
  let completed = 0
  let partial = 0
  let pending = 0
  for (const o of orders) {
    const s = getResultsProgressStatus(o)
    if (s === "completed") completed++
    else if (s === "partial") partial++
    else pending++
  }
  return { completed, partial, pending }
}

export function orderHasAbnormalFlag(order: LabOrder): boolean {
  return order.items.some((i) => i.is_abnormal)
}

export function formatOrderedAt(order: LabOrder): { date: string; time: string } {
  return formatArDateTime(order.ordered_at)
}

function resolvedEnvelopePresent(field: LabOrderItemTestField): boolean {
  return typeof field.resolved_match_status === "string"
}

/** النص الرئيسي لعمود «المعدل المرجعي» — من المرجَع المحسوب على الخادم فقط. */
export function orderResolvedReferencePrimaryLine(field: LabOrderItemTestField): string {
  if (!resolvedEnvelopePresent(field)) return ORDER_FIELD_REFERENCE_NOT_RESOLVED_AR
  if (field.resolved_match_status === "no_match") return ORDER_FIELD_NO_REFERENCE_MATCH_AR
  const rr = field.resolved_reference_range
  if (!rr || typeof rr !== "object") return ORDER_FIELD_NO_REFERENCE_MATCH_AR
  const display = formatReferenceBoundaryDisplay(rr, field.unit ?? null)
  return display.trim() === "—" ? ORDER_FIELD_NO_REFERENCE_MATCH_AR : display
}

/** سطر مساعد: موجز سياقي ديموغرافي للمعدل المرجعي المطابق — ليناسب القارئ الطبي. */
export function orderResolvedReferenceSubtleLine(
  field: LabOrderItemTestField,
  patient: LabOrderPatient | null | undefined
): string | null {
  if (!resolvedEnvelopePresent(field) || field.resolved_match_status !== "matched") {
    return null
  }
  const rr = field.resolved_reference_range
  if (!rr || typeof rr !== "object") return null

  const patientAgeYears = (() => {
    const dob = patient?.date_of_birth ?? null
    if (!dob) return null
    const d = new Date(dob)
    if (Number.isNaN(d.getTime())) return null
    return Math.abs(Date.now() - d.getTime()) / (365.25 * 86_400_000)
  })()

  const hint = referenceRangeDemographicHint({
    genderCode: rr.gender_code ?? null,
    agePreset: (rr.ui_age_preset as "general" | "child" | "adult" | "custom" | null) ?? null,
    ageFrom: rr.age_from ?? null,
    ageTo: rr.age_to ?? null,
    ageUnit: rr.age_unit ?? null,
    patientAgeYears,
    patientGender: patient?.gender ?? null,
  })

  return hint !== "جميع الأعمار" ? hint : null
}

/** @deprecated استخدم orderResolvedReferencePrimaryLine */
export function formatFieldReference(field: LabOrderItemTestField): string {
  return orderResolvedReferencePrimaryLine(field)
}

export function referenceBoundaryForClassification(b: ReferenceBoundaryLike | null | undefined): string {
  return referenceClassificationString(b ?? null).trim()
}

/** تصنيف سريع حسب المرجَع الذي أعاده الخادم للحقل ضمن هذا الطلب. */
export function referenceClassificationFromResolvedOrderField(field: LabOrderItemTestField): string {
  if (!resolvedEnvelopePresent(field)) return ""
  if (field.resolved_match_status !== "matched") return ""
  return referenceClassificationString(field.resolved_reference_range ?? null).trim()
}

function snapshotToBoundary(snap: LabOrderItemResult["reference_range_snapshot"]): ReferenceBoundaryLike | null {
  if (snap == null || typeof snap !== "object") return null
  const o = snap as Record<string, unknown>
  return {
    reference_text: typeof o.reference_text === "string" ? o.reference_text : null,
    min_value: o.min_value != null ? String(o.min_value) : null,
    max_value: o.max_value != null ? String(o.max_value) : null,
  }
}

/**
 * لتصنيف المعاينة: اللُقطة المخزّنة عند الحفظ؛ وإلا المرجَع المحلول من الخادم لسياق المريض.
 */
export function referenceClassificationForResultEntry(
  existingResult: LabOrderItemResult | undefined,
  field: LabOrderItemTestField
): string {
  const fromSnap = referenceClassificationString(snapshotToBoundary(existingResult?.reference_range_snapshot)).trim()
  if (fromSnap) return fromSnap

  const fromResolved = referenceClassificationFromResolvedOrderField(field)
  if (fromResolved) return fromResolved

  return ""
}

export function defaultSelectValueForField(field: LabOrderItemTestField): string {
  if (field.field_type !== "select") return ""
  const options = parseSelectOptions(field.select_options)
  if (options.length === 0) return ""

  const marked = options.find((o) => o.is_normal)
  if (marked) return marked.value

  const ref = referenceClassificationFromResolvedOrderField(field)
  if (!ref.trim()) {
    return options[0].value
  }

  for (const o of options) {
    if (resolveReferenceRange(o.value, ref, "select").status === "normal") {
      return o.value
    }
  }

  return ""
}

export const resultsProgressLabels: Record<
  ResultsProgressStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "لم يكتمل",
    badgeClass: "bg-muted/80 text-muted-foreground border-border/60",
  },
  partial: {
    label: "جزئي",
    badgeClass: "bg-amber-500/10 text-amber-800 border-amber-500/25 dark:text-amber-200",
  },
  completed: {
    label: "مكتمل",
    badgeClass: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:text-emerald-200",
  },
}

export function sortTestFields(fields: LabOrderItemTestField[]): LabOrderItemTestField[] {
  return [...fields].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
}

function catalogReferenceBoundary(
  field: LabOrderItemTestField
): ReferenceBoundaryLike | null {
  for (const row of field.reference_ranges ?? []) {
    const boundary: ReferenceBoundaryLike = {
      reference_text: row.reference_text ?? null,
      min_value: row.min_value != null ? String(row.min_value) : null,
      max_value: row.max_value != null ? String(row.max_value) : null,
    }
    if (hasEvaluableReferenceBoundary(boundary)) {
      return boundary
    }
  }
  return null
}

/** Snapshot → resolved order field → first catalog range (for flag + classification). */
export function referenceEvaluationForResult(
  r: LabOrderItemResult,
  field: LabOrderItemTestField | null | undefined
): { classification: string; boundary: ReferenceBoundaryLike | null } {
  const snap = snapshotToBoundary(r.reference_range_snapshot)
  const fromSnap = referenceClassificationString(snap).trim()
  if (fromSnap || hasEvaluableReferenceBoundary(snap)) {
    return { classification: fromSnap, boundary: snap }
  }

  if (field) {
    const fromResolved = referenceClassificationFromResolvedOrderField(field)
    if (fromResolved) {
      return {
        classification: fromResolved,
        boundary: field.resolved_reference_range ?? null,
      }
    }

    const catalog = catalogReferenceBoundary(field)
    if (catalog) {
      return {
        classification: referenceClassificationString(catalog).trim(),
        boundary: catalog,
      }
    }
  }

  return { classification: "", boundary: null }
}

export function hasEvaluableReferenceForResult(
  r: LabOrderItemResult,
  field: LabOrderItemTestField | null | undefined
): boolean {
  const { classification, boundary } = referenceEvaluationForResult(r, field ?? null)
  return classification.length > 0 || hasEvaluableReferenceBoundary(boundary)
}

function referenceClassificationForSavedOrCatalogRow(
  r: LabOrderItemResult,
  field: LabOrderItemTestField | null | undefined
): string {
  return referenceEvaluationForResult(r, field ?? null).classification
}

function inferResultTypeForFlagComparison(
  r: LabOrderItemResult,
  classification: string,
  boundary: ReferenceBoundaryLike | null
): "number" | "select" | "text" {
  if (r.field_type === "number") return "number"
  if (r.field_type === "select") return "select"
  if (hasEvaluableReferenceBoundary(boundary) && (boundary?.min_value || boundary?.max_value)) {
    return "number"
  }
  if (/^\d/.test(classification) || /\d[\d.]*\s*[-–—]\s*\d/.test(classification)) {
    return "number"
  }
  if (/^[<>≤≥=]/.test(classification.trim())) return "number"
  return "text"
}

function deriveFlagFromReferenceEvaluation(
  r: LabOrderItemResult,
  classification: string,
  boundary: ReferenceBoundaryLike | null,
  selectOptionsFromField: unknown | null | undefined
): LabOrderResultFlag | null {
  const raw = String(r.value ?? "").trim()
  if (!raw) return null

  const compareType =
    r.field_type === "select"
      ? "select"
      : inferResultTypeForFlagComparison(r, classification, boundary)

  const { status } = resolveReferenceRange(raw, classification, compareType)

  if (status === "normal") return "normal"
  if (status === "low") return "low"
  if (status === "high") return "high"
  if (status === "abnormal" || status === "critical") {
    if (r.field_type === "select" && selectOptionsFromField != null) {
      const opts = parseSelectOptions(selectOptionsFromField)
      const marked = opts.find((o) => o.is_normal)
      if (marked && marked.value.trim() === raw) return "normal"
    }
    return "abnormal"
  }
  if (status === "pending" || status === "invalid") return null
  return null
}

function isStoredResultFlag(flag: LabOrderResultFlag | null | undefined): flag is LabOrderResultFlag {
  return (
    flag === "normal" ||
    flag === "low" ||
    flag === "high" ||
    flag === "abnormal"
  )
}

export function effectiveResultFlagForDisplay(
  r: LabOrderItemResult,
  selectOptionsFromField: unknown | null | undefined,
  catalogField: LabOrderItemTestField | null | undefined
): LabOrderResultFlag | null {
  const field = catalogField ?? null
  const { classification, boundary } = referenceEvaluationForResult(r, field)
  const hasRef = hasEvaluableReferenceForResult(r, field)

  if (!hasRef) {
    if (r.field_type !== "select") return null

    const raw = String(r.value ?? "").trim()
    if (!raw) return r.result_flag
    if (selectOptionsFromField == null) return null

    const opts = parseSelectOptions(selectOptionsFromField)
    if (!opts.some((o) => o.value.trim() === raw)) return r.result_flag
    const marked = opts.find((o) => o.is_normal)
    if (marked) return marked.value.trim() === raw ? "normal" : "abnormal"
    return "normal"
  }

  if (isStoredResultFlag(r.result_flag)) {
    return r.result_flag
  }

  return deriveFlagFromReferenceEvaluation(
    r,
    classification,
    boundary,
    selectOptionsFromField
  )
}
