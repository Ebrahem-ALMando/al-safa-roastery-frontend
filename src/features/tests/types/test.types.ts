/**
 * Shapes from Laravel `TestResource`, `IndexTestRequest`, `StoreTestRequest`, `UpdateTestRequest`.
 */

export type TestTemplateType =
  | "standard"
  | "urinalysis"
  | "stool_analysis"
  | "semen_analysis"

export type FieldInputType = "number" | "text" | "textarea" | "select" | "radio"

export type TestCategoryBrief = {
  id: number
  name: string
}

export type TestField = {
  id: number
  name: string
  code: string | null
  section_key?: string | null
  section_label?: string | null
  section_label_ar?: string | null
  field_type: "number" | "text" | "select"
  input_type?: FieldInputType | null
  unit: string | null
  select_options: unknown
  reference_range_mode: "single" | "advanced"
  reference_ranges: TestFieldReferenceRange[]
  sort_order: number
  is_required: boolean
  is_active: boolean
}

export type TestFieldReferenceRange = {
  id: number
  gender_code: string | null
  patient_type_code: string | null
  context: Record<string, unknown> | null
  age_from: string | null
  age_to: string | null
  age_unit: string | null
  min_value: string | null
  max_value: string | null
  critical_low: string | null
  critical_high: string | null
  reference_text: string | null
  interpretation_text: string | null
  priority: number
  is_active: boolean
}

export type TestPrice = {
  id: number
  currency_code: string
  amount: number
}

export type Test = {
  id: number
  name: string
  code: string
  category_id: number
  category?: TestCategoryBrief | null
  icon_name: string | null
  notes: string | null
  test_template_type?: TestTemplateType
  is_active: boolean
  fields: TestField[]
  prices: TestPrice[]
}

export type TestsListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export type TestsListFilters = {
  search?: string
  category_id?: number
  is_active?: boolean
  created_from?: string
  created_to?: string
  page?: number
}

export type CreateTestInput = {
  category_id: number
  name: string
  code: string
  icon_name?: string | null
  notes?: string | null
  test_template_type?: TestTemplateType
  is_active?: boolean
  fields?: unknown[]
  prices?: unknown[]
}

export type UpdateTestInput = {
  category_id?: number
  name?: string
  code?: string
  icon_name?: string | null
  notes?: string | null
  test_template_type?: TestTemplateType
  is_active?: boolean
  fields?: TestField[] | unknown[]
  prices?: TestPrice[] | unknown[]
}
