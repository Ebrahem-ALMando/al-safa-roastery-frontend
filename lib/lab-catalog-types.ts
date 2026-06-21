/** Hierarchical category for tree UI */
export interface CategoryNode {
  id: string
  name: string
  parent_id?: number | null
  /** Key into icon map (e.g. hematology, biochemistry) */
  iconKey?: string
  is_active?: boolean
  children?: CategoryNode[]
  /** Subtree test count (computed in UI) */
  count?: number
  children_count?: number
}

export type ResultType = "number" | "select" | "text"

export interface LabTestField {
  id?: string
  name: string
  code: string
  resultType: ResultType
  unit: string
  referenceRange: string
  referenceRangeMode?: "single" | "advanced"
  referenceRanges?: Array<{
    id?: string
    gender_code?: string | null
    age_from?: string | number | null
    age_to?: string | number | null
    age_unit?: string | null
    min_value?: string | number | null
    max_value?: string | number | null
    critical_low?: string | number | null
    critical_high?: string | number | null
    reference_text?: string | null
    interpretation_text?: string | null
    priority?: number
    is_active?: boolean
    // Frontend-only UI helpers (not sent to backend)
    ui_age_preset?: "general" | "child" | "adult" | "custom"
    ui_show_critical?: boolean
    ui_operator?: "between" | "greater_than" | "less_than"
  }>
  selectOptions?: string
  sortOrder: number
  isActive: boolean
}

export interface LabTestPrice {
  currency_code: string
  amount: number
}

export interface LabTest {
  id: string
  name: string
  code: string
  /** Leaf category id this test belongs to */
  categoryId: string
  isActive: boolean
  fields: LabTestField[]
  prices: LabTestPrice[]
  icon_name?: string | null
  notes?: string | null
  // Legacy support (optional for transition)
  price?: number
  unit?: string
  referenceRange?: string
  fieldName?: string
  resultType?: ResultType
  selectOptions?: string
}

/** Keys for lab category icons (Lucide map in category-icons.tsx) */
export type CategoryIconKey =
  | "default"
  | "hematology"
  | "biochemistry"
  | "renal"
  | "liver"
  | "thyroid"
  | "serology"
  | "microbiology"
  | "immunology"
  | "cardiology"
  | "radiology"
  | "urinalysis"
  | "hormones"
  | "coagulation"
  | "vitamins"
  | "genetics"
  | "pathology"
  | "stethoscope"
  | "neurology"
  | "ophthalmology"
  | "pediatrics"
  | "orthopedics"
