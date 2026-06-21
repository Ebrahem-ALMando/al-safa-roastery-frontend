import type { CreateTestInput, UpdateTestInput } from "@/features/tests"
import type { LabTest, LabTestField, ResultType } from "@/lib/lab-catalog-types"
import { parseSelectOptionsForm } from "@/components/tests/select-options-form"

function splitNumericReference(range: string): {
  min: number | null
  max: number | null
  text: string | null
} {
  const t = range.trim()
  if (!t) return { min: null, max: null, text: null }
  const m = t.match(/^([\d.,]+)\s*[-–]\s*([\d.,]+)$/)
  if (m) {
    const a = parseFloat(m[1].replace(",", "."))
    const b = parseFloat(m[2].replace(",", "."))
    if (!Number.isNaN(a) && !Number.isNaN(b)) {
      return { min: Math.min(a, b), max: Math.max(a, b), text: null }
    }
  }
  return { min: null, max: null, text: t }
}

function normalizeAdvancedRange(
  r: NonNullable<LabTestField["referenceRanges"]>[number]
) {
  const op = r.ui_operator ?? "between"
  const normalized = {
    min_value: null as string | number | null,
    max_value: null as string | number | null,
    reference_text: r.reference_text ?? null,
  }

  if (op === "between") {
    normalized.min_value = r.min_value ?? null
    normalized.max_value = r.max_value ?? null
    if (normalized.min_value != null || normalized.max_value != null) {
      normalized.reference_text = null
    }
  } else if (op === "greater_than") {
    const value = r.min_value ?? null
    normalized.min_value = null
    normalized.max_value = null
    normalized.reference_text = value != null && String(value).trim() !== "" ? `> ${value}` : null
  } else if (op === "less_than") {
    const value = r.max_value ?? null
    normalized.min_value = null
    normalized.max_value = null
    normalized.reference_text = value != null && String(value).trim() !== "" ? `< ${value}` : null
  }

  return normalized
}

function buildFieldPayload(field: LabTestField, index: number) {
  const name = field.name.trim()
  const code = field.code.trim() || null
  const rt = field.resultType as ResultType

  const common = {
    name,
    code,
    sort_order: index,
    is_required: true,
    is_active: field.isActive,
  }

  const reference_range_mode = field.referenceRangeMode ?? "single"
  const reference_ranges =
    Array.isArray(field.referenceRanges) && field.referenceRanges.length > 0
      ? field.referenceRanges.map((r) => ({
          ...normalizeAdvancedRange(r),
          gender_code: r.gender_code ?? null,
          patient_type_code: null,
          context: null,
          age_from: r.age_from ?? null,
          age_to: r.age_to ?? null,
          age_unit: r.age_unit ?? null,
          critical_low: r.critical_low ?? null,
          critical_high: r.critical_high ?? null,
          interpretation_text: r.interpretation_text ?? null,
          priority: typeof r.priority === "number" ? r.priority : 0,
          is_active: typeof r.is_active === "boolean" ? r.is_active : true,
        }))
      : null

  if (rt === "number") {
    const { min, max, text } = splitNumericReference(field.referenceRange)
    const singleRange = [
      {
        gender_code: null,
        patient_type_code: null,
        context: null,
        age_from: null,
        age_to: null,
        age_unit: null,
        min_value: min,
        max_value: max,
        critical_low: null,
        critical_high: null,
        reference_text: text,
        interpretation_text: null,
        priority: 0,
        is_active: true,
      },
    ]

    return {
      ...common,
      field_type: "number" as const,
      unit: field.unit.trim() || null,
      select_options: null as string[] | null,
      reference_range_mode,
      reference_ranges: reference_ranges ?? singleRange,
    }
  }

  if (rt === "text") {
    return {
      ...common,
      field_type: "text" as const,
      unit: field.unit.trim() || null,
      select_options: null as string[] | null,
      reference_range_mode: reference_range_mode,
      reference_ranges:
        reference_ranges ??
        [
          {
            gender_code: null,
            patient_type_code: null,
            context: null,
            age_from: null,
            age_to: null,
            age_unit: null,
            min_value: null,
            max_value: null,
            critical_low: null,
            critical_high: null,
            reference_text: field.referenceRange.trim() || null,
            interpretation_text: null,
            priority: 0,
            is_active: true,
          },
        ],
    }
  }

  const optionRows = parseSelectOptionsForm(field.selectOptions)
  const select_options = optionRows.map((r) => {
    const row: { value: string; label: string; is_normal?: boolean } = {
      value: r.value,
      label: r.value,
    }
    if (r.is_normal) {
      row.is_normal = true
    }
    return row
  })

  return {
    ...common,
    field_type: "select" as const,
    unit: null as string | null,
    select_options,
    reference_range_mode: reference_range_mode,
    reference_ranges:
      reference_ranges ??
      [
        {
          gender_code: null,
          patient_type_code: null,
          context: null,
          age_from: null,
          age_to: null,
          age_unit: null,
          min_value: null,
          max_value: null,
          critical_low: null,
          critical_high: null,
          reference_text: null,
          interpretation_text: null,
          priority: 0,
          is_active: true,
        },
      ],
  }
}

/** يحوّل نموذج `TestFormDialog` (LabTest) إلى جسم إنشاء متوافق مع الـ API. */
export function mapLabTestFormToCreateInput(form: Omit<LabTest, "id">): CreateTestInput {
  const category_id = Number(form.categoryId)
  
  // إذا كان هناك حقول، نستخدمها، وإلا نبني حقلاً واحداً من البيانات القديمة (للتوافق)
  const fields = form.fields?.length 
    ? form.fields.map((f, i) => buildFieldPayload(f, i))
    : [buildFieldPayload({
        name: (form.fieldName?.trim() || form.name.trim()).trim(),
        code: form.code.trim(),
        resultType: form.resultType || "number",
        unit: form.unit || "",
        referenceRange: form.referenceRange || "",
        selectOptions: form.selectOptions,
        sortOrder: 0,
        isActive: true,
      }, 0)]

  const prices = form.prices?.length
    ? form.prices.map(p => ({
        currency_code: p.currency_code,
        amount: Number(p.amount)
      }))
    : (typeof form.price === "number" && form.price > 0
        ? [{ currency_code: "SAR", amount: form.price }]
        : [])

  return {
    category_id,
    name: form.name.trim(),
    code: form.code.trim(),
    icon_name: form.icon_name === "default" ? null : form.icon_name,
    notes: form.notes?.trim() || null,
    is_active: form.isActive,
    fields,
    prices,
  }
}

/** نفس التحويل المستخدم في الإنشاء ولكن بصيغة تحديث. */
export function mapLabTestFormToUpdateInput(form: Omit<LabTest, "id">): UpdateTestInput {
  return mapLabTestFormToCreateInput(form) as UpdateTestInput
}
