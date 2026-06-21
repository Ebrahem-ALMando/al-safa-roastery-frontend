import type {
  LabOrderItem,
  LabOrderItemResult,
  LabOrderItemTestField,
  LabOrderPatient,
} from "@/features/orders/types/order.types"
import { parseSelectOptions } from "@/features/results/lib/select-options"
import { getFieldInputType } from "@/features/tests/lib/test-template-helpers"
import { resolveReferenceRange } from "@/lib/reference-range-resolver"
import {
  hasEvaluableReferenceBoundary,
  type ReferenceBoundaryLike,
} from "@/lib/reference-range-format"
import {
  ORDER_FIELD_NO_REFERENCE_MATCH_AR,
  ORDER_FIELD_NO_REFERENCE_MATCH_SHORT_AR,
  ORDER_FIELD_REFERENCE_NOT_RESOLVED_AR,
  referenceClassificationForResultEntry,
  orderResolvedReferencePrimaryLine,
  orderResolvedReferenceSubtleLine,
} from "@/components/results/results-helpers"

const OPTIONAL_NARRATIVE_FIELD_CODES = new Set([
  "SEM_NOTES",
  "UR_OTHER",
  "ST_OTHER_PARASITES",
])

export type ResultEntryRowStatus =
  | "empty"
  | "normal"
  | "out_of_range"
  | "invalid"
  | "unknown"
  | "unevaluated"

export type ResultEntryPreviewBadge = {
  label: string
  status: ResultEntryRowStatus
}

const previewLabels: Record<ResultEntryRowStatus, string> = {
  empty: "فارغ",
  normal: "ضمن المعدل",
  out_of_range: "خارج المعدل",
  invalid: "قيمة غير صالحة",
  unknown: "قيمة غير معروفة",
  unevaluated: "بدون نطاق",
}

export function hasEvaluableReferenceFromClassification(classification: string): boolean {
  return classification.trim().length > 0
}

export function hasEvaluableReference(
  boundary: ReferenceBoundaryLike | null | undefined
): boolean {
  return hasEvaluableReferenceBoundary(boundary)
}

export function hasEvaluableReferenceForEntryField(
  field: LabOrderItemTestField,
  existingResult?: LabOrderItemResult
): boolean {
  const classification = referenceClassificationForResultEntry(existingResult, field)
  return hasEvaluableReferenceFromClassification(classification)
}

export function isOptionalNarrativeResultField(field: LabOrderItemTestField): boolean {
  if (!field.is_required && getFieldInputType(field) === "textarea") {
    return true
  }

  const code = field.code?.trim().toUpperCase()
  return code != null && OPTIONAL_NARRATIVE_FIELD_CODES.has(code)
}

export function orderResolvedReferenceDisplayForEntry(
  field: LabOrderItemTestField,
  patient: LabOrderPatient | null | undefined
): {
  primaryLine: string
  subtleLine: string | null
  useArabicTypography: boolean
  fullTitle: string | null
} {
  const rawMain = orderResolvedReferencePrimaryLine(field)
  const subtle = orderResolvedReferenceSubtleLine(field, patient)

  if (rawMain === ORDER_FIELD_NO_REFERENCE_MATCH_AR) {
    return {
      primaryLine: ORDER_FIELD_NO_REFERENCE_MATCH_SHORT_AR,
      subtleLine: subtle,
      useArabicTypography: true,
      fullTitle: ORDER_FIELD_NO_REFERENCE_MATCH_AR,
    }
  }

  if (rawMain === ORDER_FIELD_REFERENCE_NOT_RESOLVED_AR) {
    return {
      primaryLine: rawMain,
      subtleLine: null,
      useArabicTypography: true,
      fullTitle: rawMain,
    }
  }

  const matchedNumeric =
    field.resolved_match_status === "matched" &&
    hasEvaluableReferenceBoundary(field.resolved_reference_range)

  return {
    primaryLine: rawMain,
    subtleLine: subtle,
    useArabicTypography: !matchedNumeric,
    fullTitle: subtle ? `${rawMain}\n${subtle}` : rawMain,
  }
}

function previewBadgeSelectWithoutReference(
  raw: string,
  selectOptionsRaw: unknown,
  options?: { optionalNarrative?: boolean }
): ResultEntryPreviewBadge {
  const v = raw.trim()
  const opts = parseSelectOptions(selectOptionsRaw)
  const inList = opts.some((o) => o.value.trim() === v)
  if (!inList) return { label: previewLabels.unknown, status: "unknown" }

  const marked = opts.find((o) => o.is_normal)
  if (marked) {
    return marked.value.trim() === v
      ? { label: previewLabels.normal, status: "normal" }
      : { label: previewLabels.out_of_range, status: "out_of_range" }
  }

  return { label: previewLabels.normal, status: "normal" }
}

function unevaluatedBadge(field: LabOrderItemTestField): ResultEntryPreviewBadge {
  if (isOptionalNarrativeResultField(field)) {
    return { label: "اختياري", status: "unevaluated" }
  }
  return { label: previewLabels.unevaluated, status: "unevaluated" }
}

export function computePreviewBadgeForEntry(
  field: LabOrderItemTestField,
  raw: string,
  referenceLabel: string,
  selectOptionsRaw?: unknown
): ResultEntryPreviewBadge {
  if (!raw.trim()) return { label: previewLabels.empty, status: "empty" }

  const hasRef = hasEvaluableReferenceFromClassification(referenceLabel)

  if (!hasRef) {
    if (field.field_type === "select") {
      return previewBadgeSelectWithoutReference(raw, selectOptionsRaw, {
        optionalNarrative: isOptionalNarrativeResultField(field),
      })
    }
    return unevaluatedBadge(field)
  }

  const rt = field.field_type === "number" ? "number" : field.field_type === "select" ? "select" : "text"
  const { status } = resolveReferenceRange(raw, referenceLabel, rt)

  if (status === "normal") return { label: previewLabels.normal, status: "normal" }

  if (field.field_type === "select" && status === "abnormal" && selectOptionsRaw != null) {
    const opts = parseSelectOptions(selectOptionsRaw)
    const v = raw.trim()
    const marked = opts.find((o) => o.is_normal)
    if (marked && marked.value.trim() === v) {
      return { label: previewLabels.normal, status: "normal" }
    }
  }

  if (status === "invalid") return { label: previewLabels.invalid, status: "invalid" }
  if (status === "pending") return { label: "—", status: "empty" }

  return { label: previewLabels.out_of_range, status: "out_of_range" }
}

export function isAbnormalEntryPreviewStatus(status: ResultEntryRowStatus): boolean {
  return status === "out_of_range" || status === "invalid"
}

export function fieldRowAggregateForEntry(
  item: LabOrderItem,
  values: Record<string, string>,
  fields: LabOrderItemTestField[],
  cellKey: (itemId: number, fieldId: number) => string
): { filled: number; abnormal: number; total: number } {
  let filled = 0
  let abnormal = 0

  for (const f of fields) {
    const raw = values[cellKey(item.id, f.id)] ?? ""
    if (raw.trim()) filled++

    const existing = item.results.find((r) => r.test_field_id === f.id)
    const refClass = referenceClassificationForResultEntry(existing, f)
    const badge = computePreviewBadgeForEntry(f, raw, refClass, f.select_options)
    if (isAbnormalEntryPreviewStatus(badge.status)) abnormal++
  }

  return { filled, abnormal, total: fields.length }
}

export function sectionCompletionForEntry(
  item: LabOrderItem,
  fields: LabOrderItemTestField[],
  values: Record<string, string>,
  cellKey: (itemId: number, fieldId: number) => string
): { completed: number; total: number; requiredMissing: number } {
  let completed = 0
  let requiredMissing = 0

  for (const f of fields) {
    const raw = values[cellKey(item.id, f.id)] ?? ""
    if (raw.trim()) {
      completed++
    } else if (f.is_required) {
      requiredMissing++
    }
  }

  return { completed, total: fields.length, requiredMissing }
}

export function snapshotHasEvaluableReference(
  snap: LabOrderItemResult["reference_range_snapshot"]
): boolean {
  if (snap == null || typeof snap !== "object") return false
  const o = snap as Record<string, unknown>
  return hasEvaluableReference({
    reference_text: typeof o.reference_text === "string" ? o.reference_text : null,
    min_value: o.min_value != null ? String(o.min_value) : null,
    max_value: o.max_value != null ? String(o.max_value) : null,
  })
}
