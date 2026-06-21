import type { ReferenceRangeSnapshot } from "@/features/orders/types/order.types"

export type VerifyPatient = {
  id: number
  patient_number: string | null
  full_name: string | null
  phone: string | null
  gender: string | null
}

export type VerifyResultRow = {
  id?: number
  field_name: string
  field_type: string
  unit: string | null
  reference_range_snapshot?: ReferenceRangeSnapshot
  /** من `LabOrderItemResultResource` — تلميح ديموغرافي من اللقطة. */
  demographic_hint_ar?: string | null
  value: string | number | null
  result_flag: string | null
}

export type VerifyOrderItem = {
  id: number
  test_name: string
  is_abnormal: boolean
  results: VerifyResultRow[]
}

export type VerifyOrderPayload = {
  order_number: string
  ordered_at: string | null
  patient: VerifyPatient | null
  items: VerifyOrderItem[]
}

export type VerifyApiEnvelope =
  | { status: number; message: string; data: VerifyOrderPayload }
  | { status: number; message: string; data?: undefined }
