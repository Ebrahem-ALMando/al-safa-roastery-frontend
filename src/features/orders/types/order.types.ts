import type {
  FieldInputType,
  TestFieldReferenceRange,
  TestTemplateType,
} from "@/features/tests/types/test.types"

/** يطابق `Modules\Results\Enums\ResultFlag` */
export type LabOrderResultFlag = "normal" | "abnormal" | "low" | "high"

/**
 * لقطة الصف المرجعي المختار عند الحفظ (`reference_range_snapshot` من `LabOrderItemResultResource`).
 */
export type ReferenceBoundaryRecord = {
  id?: number
  test_field_id?: number
  priority?: number
  gender_code?: string | null
  patient_type_code?: string | null
  context?: Record<string, unknown> | null
  age_from?: string | null
  age_to?: string | null
  age_unit?: string | null
  min_value?: string | null
  max_value?: string | null
  critical_low?: string | null
  critical_high?: string | null
  reference_text?: string | null
  interpretation_text?: string | null
}

export type ReferenceRangeSnapshot = ReferenceBoundaryRecord | null | undefined

export type LabOrderItemResultAttachment = {
  id: number
  file_name: string
  url: string
  file_type: string
}

export type ResolvedMatchStatus = "matched" | "no_match"

export type LabOrderItemResult = {
  id: number
  test_field_id: number
  field_name: string
  field_type: string
  unit: string | null
  reference_range_snapshot: ReferenceRangeSnapshot
  /** وسيل شرح مختصرة من اللقطة المحفوظة (محسوبة على الخادم). */
  demographic_hint_ar?: string | null
  value: string | number | null
  entry_status: string
  result_flag: LabOrderResultFlag | null
  notes: string | null
  attachments?: LabOrderItemResultAttachment[]
}

/** حقول الفحص كما تُعاد مع `GET lab-orders/{id}` عند تحميل `items.test.fields`. */
export type LabOrderItemTestField = {
  id: number
  name: string
  code: string | null
  section_key?: string | null
  section_label?: string | null
  section_label_ar?: string | null
  input_type?: FieldInputType | null
  field_type: "number" | "text" | "select"
  unit: string | null
  select_options: unknown
  reference_range_mode: "single" | "advanced"
  /** المرجع المختار وفقًا لمريض الطلب (من الخادم فقط؛ اختياري أثناء الترحيل بين الإصدارات). */
  resolved_reference_range?: ReferenceBoundaryRecord | null
  resolved_demographic_hint_ar?: string | null
  resolved_match_status?: ResolvedMatchStatus
  reference_ranges: TestFieldReferenceRange[]
  sort_order: number
  is_required: boolean
}

export type LabOrderItemTestMeta = {
  id: number
  name: string
  code: string | null
  test_template_type?: TestTemplateType
  /** يطابق `tests.icon_name` — لأيقونة الفحص في الواجهة */
  icon_name?: string | null
  fields: LabOrderItemTestField[]
}

export type LabOrderItem = {
  id: number
  test_id: number
  test_name: string
  status: string
  sort_order: number
  is_abnormal: boolean
  results: LabOrderItemResult[]
  /** يُحمّل مع تفاصيل الطلب لإدخال النتائج */
  test?: LabOrderItemTestMeta | null
}

export type LabOrderPatient = {
  id: number
  patient_number: string | null
  full_name: string | null
  gender: string | null
  date_of_birth: string | null
  phone: string | null
  is_active: boolean
}

/** يطابق `UserResource` عند تضمينه في `LabOrderResource` كـ `requested_by_user`. */
export type LabOrderRequestingUser = {
  id: number
  name: string
  username: string
  email: string
  role: string
  is_active: boolean
  avatar_name: string | null
  avatar_url: string | null
}

export type LabOrder = {
  id: number
  order_number: string
  patient_id: number
  patient: LabOrderPatient | null
  status: "draft" | "pending" | "in_progress" | "completed" | "approved" | "cancelled"
  created_by: number | null
  requested_by: number | null
  requested_by_user: LabOrderRequestingUser | null
  requesting_doctor_name: string | null
  notes: string | null
  ordered_at: string | null
  items: LabOrderItem[]
}

export type LabOrdersListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export type LabOrdersListFilters = {
  order_number?: string
  patient_id?: number
  status?: LabOrder["status"]
  created_by?: number
  requested_by?: number
  ordered_from?: string
  ordered_to?: string
  search?: string
  page?: number
}
