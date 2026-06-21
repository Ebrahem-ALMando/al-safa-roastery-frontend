"use client"

import { ApiRequestError } from "@/lib/api"
import { toast } from "@/components/ui/custom-toast-with-icons"
import type { Test, UpdateTestInput } from "@/features/tests"
import { useCategoriesTree } from "@/features/categories"
import type { LabTest, LabTestField, ResultType } from "@/lib/lab-catalog-types"
import { TestFormDialog } from "./test-form-dialog"
import { mapLabTestFormToUpdateInput } from "./map-lab-test-form-to-api"
import { apiSelectOptionsToFormString } from "./select-options-form"

type EditTestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  test: Test | null
  onUpdate: (id: number, payload: UpdateTestInput) => Promise<unknown>
  onTestUpdated?: (test: Test) => void
}

function mapSubmitError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 422) return "البيانات غير صحيحة"
    if (error.status === 401) return "غير مصرح"
    if (error.status === 403) return "الحساب غير مفعل"
    if (error.status >= 500) return "حدث خطأ في النظام"
    if (error.status === 0) return "تحقق من الاتصال"
  }
  return "تحقق من الاتصال"
}

export function EditTestDialog({
  open,
  onOpenChange,
  test,
  onUpdate,
  onTestUpdated,
}: EditTestDialogProps) {
  const { categoryTree } = useCategoriesTree(open)

  const initial = test ? toLabTestForm(test) : null

  async function handleSubmit(formData: Omit<LabTest, "id">) {
    if (!test) return
    const payload = mapLabTestFormToUpdateInput(formData) as UpdateTestInput
    try {
      const updated = (await onUpdate(test.id, payload)) as Test
      onTestUpdated?.(updated)
    } catch (err) {
      toast.error("تعذر التحديث", { description: mapSubmitError(err) })
      throw err
    }
  }

  return (
    <TestFormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      categoryTree={categoryTree}
      initial={initial}
      title="تعديل الفحص"
    />
  )
}

function toLabTestForm(test: Test): LabTest {
  const fields: LabTestField[] = (test.fields ?? []).map((f, i) => ({
    id: String(f.id),
    name: f.name ?? "",
    code: f.code ?? "",
    resultType: f.field_type as ResultType,
    unit: f.unit ?? "",
    referenceRange:
      f.reference_range_mode === "single"
        ? buildLegacySingleReferenceRange(f.reference_ranges?.[0] ?? null)
        : "",
    referenceRangeMode: f.reference_range_mode ?? "single",
    referenceRanges: (f.reference_ranges ?? []).map((r) => ({
      id: String(r.id),
      gender_code: r.gender_code ?? null,
      age_from: r.age_from,
      age_to: r.age_to,
      age_unit: r.age_unit,
      min_value: r.min_value,
      max_value: r.max_value,
      critical_low: r.critical_low,
      critical_high: r.critical_high,
      reference_text: r.reference_text,
      interpretation_text: r.interpretation_text,
      priority: r.priority,
      is_active: r.is_active,
      ui_show_critical: r.critical_low != null || r.critical_high != null,
      ui_operator: r.reference_text?.trim().startsWith(">")
        ? "greater_than"
        : r.reference_text?.trim().startsWith("<")
          ? "less_than"
          : "between",
    })),
    selectOptions: apiSelectOptionsToFormString(f.select_options),
    sortOrder: typeof f.sort_order === "number" ? f.sort_order : i,
    isActive: f.is_active ?? true,
  }))

  const first = fields[0]
  const firstPrice = test.prices?.[0]

  return {
    id: String(test.id),
    name: test.name ?? "",
    code: test.code ?? "",
    categoryId: String(test.category_id),
    isActive: test.is_active ?? true,
    fields,
    prices: (test.prices ?? []).map((p) => ({
      currency_code: p.currency_code,
      amount: Number(p.amount) || 0,
    })),
    icon_name: test.icon_name ?? null,
    notes: test.notes ?? null,
    // legacy compatibility with existing UI pieces
    price: firstPrice ? Number(firstPrice.amount) || 0 : 0,
    unit: first?.unit ?? "",
    referenceRange: first?.referenceRange ?? "",
    fieldName: first?.name ?? test.name,
    resultType: first?.resultType ?? "number",
    selectOptions: first?.selectOptions,
  }
}

function buildLegacySingleReferenceRange(
  range: Test["fields"][number]["reference_ranges"][number] | null
): string {
  if (!range) return ""
  if (range.reference_text && String(range.reference_text).trim()) {
    return String(range.reference_text).trim()
  }
  const min = range.min_value != null ? String(range.min_value).trim() : ""
  const max = range.max_value != null ? String(range.max_value).trim() : ""
  if (min || max) return `${min || "—"} - ${max || "—"}`
  return ""
}

