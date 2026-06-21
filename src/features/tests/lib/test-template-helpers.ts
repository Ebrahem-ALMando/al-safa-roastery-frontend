import type { Test, TestField, TestTemplateType } from "../types/test.types"

export const DEFAULT_SECTION_KEY = "__general__"

const TEMPLATE_SECTION_ORDER: Record<TestTemplateType, string[]> = {
  standard: [],
  urinalysis: ["physical", "chemical", "microscopic"],
  stool_analysis: ["physical", "microscopic", "protozoa", "ova"],
  semen_analysis: ["physical", "morphology", "microscopic", "motility", "count"],
}

const TEMPLATE_BADGE_LABELS_AR: Record<TestTemplateType, string> = {
  standard: "قياسي",
  urinalysis: "قالب تحليل بول",
  stool_analysis: "قالب تحليل براز",
  semen_analysis: "قالب تحليل سائل منوي",
}

const TEMPLATE_BADGE_LABELS_EN: Record<TestTemplateType, string> = {
  standard: "Standard",
  urinalysis: "Urinalysis Template",
  stool_analysis: "Stool Analysis Template",
  semen_analysis: "Semen Analysis Template",
}

const INPUT_TYPE_LABELS_AR: Record<string, string> = {
  number: "رقمي",
  text: "نصي",
  textarea: "نص متعدد",
  select: "قائمة",
  radio: "اختيار أحادي",
}

const INPUT_TYPE_LABELS_EN: Record<string, string> = {
  number: "Number",
  text: "Text",
  textarea: "Textarea",
  select: "Select",
  radio: "Radio",
}

export type TestFieldSectionGroup = {
  sectionKey: string
  label: string
  fields: TestField[]
}

export function getTestTemplateType(test: Pick<Test, "test_template_type">): TestTemplateType {
  const value = test.test_template_type
  if (
    value === "urinalysis" ||
    value === "stool_analysis" ||
    value === "semen_analysis"
  ) {
    return value
  }

  return "standard"
}

export function isTemplateTest(test: Pick<Test, "test_template_type">): boolean {
  return getTestTemplateType(test) !== "standard"
}

export function getFieldInputType(field: Pick<TestField, "field_type" | "input_type">): NonNullable<TestField["input_type"]> {
  if (
    field.input_type === "number" ||
    field.input_type === "text" ||
    field.input_type === "textarea" ||
    field.input_type === "select" ||
    field.input_type === "radio"
  ) {
    return field.input_type
  }

  if (field.field_type === "number") return "number"
  if (field.field_type === "select") return "select"

  return "text"
}

export function shouldShowGroupedFields(
  test: Pick<Test, "test_template_type" | "fields">
): boolean {
  if (isTemplateTest(test)) return true

  return test.fields.some((field) => Boolean(field.section_key?.trim()))
}

export function getTestTemplateBadgeLabel(
  test: Pick<Test, "test_template_type">,
  preferArabic = true
): string {
  const type = getTestTemplateType(test)
  return preferArabic ? TEMPLATE_BADGE_LABELS_AR[type] : TEMPLATE_BADGE_LABELS_EN[type]
}

export function getFieldInputTypeLabel(
  field: Pick<TestField, "field_type" | "input_type">,
  preferArabic = true
): string {
  const inputType = getFieldInputType(field)
  const labels = preferArabic ? INPUT_TYPE_LABELS_AR : INPUT_TYPE_LABELS_EN

  return labels[inputType] ?? inputType
}

/**
 * Single badge label for field storage type vs effective UI input type.
 */
export function getFieldTypeInputBadgeLabel(
  field: Pick<TestField, "field_type" | "input_type">,
  preferArabic = true
): string {
  const inputType = getFieldInputType(field)
  const fieldType = field.field_type

  if (!preferArabic) {
    if (fieldType === "number" && inputType === "number") return "Number"
    if (fieldType === "text" && inputType === "text") return "Text"
    if (fieldType === "select" && inputType === "select") return "Select"
    if (fieldType === "select" && inputType === "radio") return "Select / Radio"
    if (fieldType === "text" && inputType === "textarea") return "Text / Textarea"

    return `${fieldType} / ${getFieldInputTypeLabel(field, false)}`
  }

  if (fieldType === "number" && inputType === "number") return "رقمي"
  if (fieldType === "text" && inputType === "text") return "نصي"
  if (fieldType === "select" && inputType === "select") return "قائمة"
  if (fieldType === "select" && inputType === "radio") return "قائمة / اختيار أحادي"
  if (fieldType === "text" && inputType === "textarea") return "نص / نص متعدد"

  const storageLabel =
    fieldType === "number" ? "رقمي" : fieldType === "select" ? "قائمة" : "نص"

  return `${storageLabel} / ${getFieldInputTypeLabel(field)}`
}

function resolveSectionLabel(
  sectionKey: string,
  sampleField: TestField | undefined,
  preferArabic: boolean
): string {
  if (sectionKey === DEFAULT_SECTION_KEY) {
    return preferArabic ? "عام" : "General"
  }

  if (preferArabic && sampleField?.section_label_ar?.trim()) {
    return sampleField.section_label_ar.trim()
  }

  if (sampleField?.section_label?.trim()) {
    return sampleField.section_label.trim()
  }

  return sectionKey
}

function sortSectionKeys(keys: string[], templateType: TestTemplateType): string[] {
  const order = TEMPLATE_SECTION_ORDER[templateType]
  if (order.length === 0) {
    return keys
  }

  const rank = new Map(order.map((key, index) => [key, index]))

  return [...keys].sort((a, b) => {
    const aRank = rank.get(a)
    const bRank = rank.get(b)

    if (aRank !== undefined && bRank !== undefined) return aRank - bRank
    if (aRank !== undefined) return -1
    if (bRank !== undefined) return 1

    return a.localeCompare(b)
  })
}

export function groupTestFieldsBySection(
  fields: TestField[],
  options?: {
    preferArabic?: boolean
    templateType?: TestTemplateType
  }
): TestFieldSectionGroup[] {
  const preferArabic = options?.preferArabic ?? true
  const templateType = options?.templateType ?? "standard"
  const sorted = [...fields].sort((a, b) => a.sort_order - b.sort_order)

  const groups = new Map<string, TestField[]>()
  const order: string[] = []

  for (const field of sorted) {
    const key = field.section_key?.trim() || DEFAULT_SECTION_KEY
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(field)
  }

  const sectionKeys = sortSectionKeys(order, templateType)

  return sectionKeys.map((sectionKey) => {
    const sectionFields = groups.get(sectionKey) ?? []

    return {
      sectionKey,
      label: resolveSectionLabel(sectionKey, sectionFields[0], preferArabic),
      fields: sectionFields,
    }
  })
}
