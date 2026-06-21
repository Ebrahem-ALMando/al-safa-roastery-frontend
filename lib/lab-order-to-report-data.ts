import type { ReportData, TestGroup, TestResult } from "@/components/reports/report-template"
import { formatOrderItemResultReferenceParts } from "@/components/orders/orders-helpers"
import {
  effectiveResultFlagForDisplay,
  hasEvaluableReferenceForResult,
} from "@/components/results/results-helpers"
import type { LabOrderResultFlag } from "@/features/orders"
import {
  buildOrderItemResultSectionGroups,
  DEFAULT_SECTION_KEY,
} from "@/features/results/lib/order-item-result-sections"
import { filterResultsForReport } from "@/features/results/lib/report-result-inclusion"
import type { LabOrder, LabOrderItem, LabOrderItemResult } from "@/features/orders"
import type { LabProfile } from "@/lib/dashboard-prefs"
import { defaultLabProfile } from "@/lib/dashboard-prefs"
import {
  getTestTemplateBadgeLabel,
  getFieldInputType,
} from "@/features/tests/lib/test-template-helpers"

/** مفتاح مطابقة نفس الحقل بين طلبين: test_id + test_field_id */
export function previousResultKey(testId: number, testFieldId: number): string {
  return `${testId}:${testFieldId}`
}

function buildPreviousResultLookup(order: LabOrder): Map<string, { value: string; orderedAt: string }> {
  const m = new Map<string, { value: string; orderedAt: string }>()
  const orderedAt = order.ordered_at?.slice(0, 10) ?? ""
  for (const item of order.items) {
    const tid = item.test_id
    for (const r of item.results ?? []) {
      const val = r.value
      if (val === null || val === undefined) continue
      const s = String(val).trim()
      if (s === "") continue
      m.set(previousResultKey(tid, r.test_field_id), {
        value: s,
        orderedAt,
      })
    }
  }
  return m
}

/**
 * حساب العمر من Y-m-d دون انزياح المنطقة الزمنية.
 */
export function patientAgeYearsFromDob(dob: string | null): number | null {
  if (!dob?.trim()) return null
  const m = dob.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) {
    const d = new Date(dob)
    if (Number.isNaN(d.getTime())) return null
    return ageFromUtcDate(d)
  }
  const y = Number(m[1])
  const mo = Number(m[2])
  const day = Number(m[3])
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(day)) return null
  const birth = new Date(y, mo - 1, day)
  if (Number.isNaN(birth.getTime())) return null
  return ageFromUtcDate(birth)
}

function ageFromUtcDate(birthDate: Date): number {
  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  const m = now.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return Math.max(0, age)
}

function genderLabelAr(gender: string | null): string {
  if (!gender) return "—"
  const g = gender.trim().toLowerCase()
  if (g === "male" || g === "m" || g === "ذكر") return "ذكر"
  if (g === "female" || g === "f" || g === "أنثى") return "أنثى"
  return gender
}

function referenceRangeForReport(item: LabOrderItem, r: LabOrderItemResult): string {
  const parts = formatOrderItemResultReferenceParts(item, r)
  if (parts.range === "—") return "—"
  if (parts.demographicLabel?.trim()) {
    return `${parts.range} · ${parts.demographicLabel.trim()}`
  }
  return parts.range
}

function fieldLabelForResult(item: LabOrderItem, r: LabOrderItemResult): string {
  const f = item.test?.fields?.find((x) => x.id === r.test_field_id)
  if (f?.name?.trim()) return f.name.trim()
  return r.field_name?.trim() || "—"
}

function fieldCodeForResult(item: LabOrderItem, r: LabOrderItemResult): string {
  const f = item.test?.fields?.find((x) => x.id === r.test_field_id)
  const code = f?.code?.trim()
  if (code) return code
  if (item.test?.code?.trim()) return item.test.code.trim()
  return String(r.test_field_id)
}

function flagToReportRowStyle(flag: LabOrderResultFlag | null): {
  isAbnormal: boolean
  abnormalType?: "high" | "low"
} {
  if (flag === "low") {
    return { isAbnormal: true, abnormalType: "low" }
  }
  if (flag === "high" || flag === "abnormal") {
    return { isAbnormal: true, abnormalType: "high" }
  }
  return { isAbnormal: false }
}

function mapResultToTestResult(
  item: LabOrderItem,
  r: LabOrderItemResult,
  previousByKey: Map<string, { value: string; orderedAt: string }> | null
): TestResult {
  const field = item.test?.fields?.find((x) => x.id === r.test_field_id)
  const hasEvaluableReference = hasEvaluableReferenceForResult(r, field ?? null)
  const flag = effectiveResultFlagForDisplay(
    r,
    field?.select_options,
    field ?? null
  )
  const { isAbnormal, abnormalType } = flagToReportRowStyle(flag)

  const attachments =
    r.attachments?.map((a) => ({
      id: String(a.id),
      name: a.file_name,
      url: a.url,
      type: a.file_type,
      uploadDate: new Date().toISOString(),
    })) ?? undefined

  const key = previousResultKey(item.test_id, r.test_field_id)
  const prev = previousByKey?.get(key)

  const rawValue = r.value != null && r.value !== "" ? String(r.value) : "—"
  const isMultiline = field ? getFieldInputType(field) === "textarea" : false

  return {
    name: fieldLabelForResult(item, r),
    code: fieldCodeForResult(item, r),
    value: rawValue,
    unit: r.unit?.trim() || field?.unit?.trim() || "",
    referenceRange: referenceRangeForReport(item, r),
    isAbnormal,
    abnormalType,
    resultFlag: flag,
    hasEvaluableReference,
    fieldType: r.field_type,
    isMultiline,
    attachments,
    previousValue: prev?.value,
    previousOrderedAt: prev?.orderedAt ?? null,
  }
}

function itemForReport(item: LabOrderItem): LabOrderItem {
  return {
    ...item,
    results: filterResultsForReport(item),
  }
}

function mapItemToTestGroup(
  item: LabOrderItem,
  previousByKey: Map<string, { value: string; orderedAt: string }> | null
): TestGroup | null {
  const reportItem = itemForReport(item)
  const results = reportItem.results ?? []
  if (results.length === 0) return null

  const category = item.test_name?.trim() || item.test?.name?.trim() || "فحص"
  const sectionGroups = buildOrderItemResultSectionGroups(reportItem, { preferArabic: true })

  if (sectionGroups && sectionGroups.length > 0) {
    const includedResultIds = new Set<number>()
    const mappedSections = sectionGroups
      .map((group) => ({
        sectionKey: group.sectionKey,
        label: group.label,
        tests: group.results.map((r) => {
          includedResultIds.add(r.id)
          return mapResultToTestResult(reportItem, r, previousByKey)
        }),
      }))
      .filter((g) => g.tests.length > 0)

    const orphanResults = results.filter((r) => !includedResultIds.has(r.id))
    if (orphanResults.length > 0) {
      mappedSections.push({
        sectionKey: DEFAULT_SECTION_KEY,
        label: "عام",
        tests: orphanResults.map((r) =>
          mapResultToTestResult(reportItem, r, previousByKey)
        ),
      })
    }

    if (mappedSections.length === 0) return null

    const templateBadge = item.test
      ? getTestTemplateBadgeLabel(
          {
            test_template_type: item.test.test_template_type,
            fields: item.test.fields,
          },
          true
        )
      : undefined

    return {
      category,
      tests: [],
      sectionGroups: mappedSections,
      templateBadge,
    }
  }

  return {
    category,
    tests: results.map((r) => mapResultToTestResult(reportItem, r, previousByKey)),
  }
}

function orderNotesToArray(notes: string | null): string[] | undefined {
  if (!notes?.trim()) return undefined
  const lines = notes
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  return lines.length > 0 ? lines : undefined
}

/**
 * يبني بيانات قالب التقرير من طلب المختبر الفعلي وبيانات هوية المختبر من الإعدادات.
 * @param previousOrder طلب سابق لنفس المريض (لعمود النتيجة السابقة عند وجود تطابق).
 */
export function labOrderToReportData(
  order: LabOrder,
  labProfile: LabProfile = defaultLabProfile,
  previousOrder: LabOrder | null = null
): ReportData {
  const p = order.patient
  const patientName = p?.full_name?.trim() || "—"
  const patientFileId = p?.patient_number?.trim() || (p?.id != null ? String(p.id) : "—")

  const orderedDay =
    order.ordered_at && !Number.isNaN(Date.parse(order.ordered_at))
      ? order.ordered_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10)

  const issueDay = new Date().toISOString().slice(0, 10)

  const doctorName =
    order.requesting_doctor_name?.trim() ||
    order.requested_by_user?.name?.trim() ||
    undefined

  const sortedItems = [...order.items].sort((a, b) => a.sort_order - b.sort_order)

  const previousByKey =
    previousOrder != null ? buildPreviousResultLookup(previousOrder) : null
  const showPreviousColumn = previousOrder != null

  const testGroups: TestGroup[] = sortedItems
    .map((item) => mapItemToTestGroup(item, showPreviousColumn ? previousByKey : null))
    .filter((g): g is TestGroup => g != null)

  const ageYears = patientAgeYearsFromDob(p?.date_of_birth ?? null)

  return {
    orderId: order.order_number,
    orderDbId: order.id,
    date: orderedDay,
    issueDate: issueDay,
    patient: {
      name: patientName,
      id: patientFileId,
      dbId: order.patient_id ?? p?.id ?? undefined,
      age: ageYears,
      gender: genderLabelAr(p?.gender ?? null),
      phone: p?.phone?.trim() || undefined,
    },
    doctor: doctorName,
    testGroups,
    notes: orderNotesToArray(order.notes),
    labInfo: {
      name: labProfile.labName,
      subtitle: "تقرير نتائج التحاليل الطبية",
      phone: labProfile.labPhone,
      address: labProfile.labAddress,
    },
    showPreviousResultColumn: showPreviousColumn,
  }
}
