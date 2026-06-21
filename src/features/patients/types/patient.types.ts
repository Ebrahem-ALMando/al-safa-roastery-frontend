/**
 * Shapes from Laravel `PatientResource`, `IndexPatientRequest`, `StorePatientRequest`, `UpdatePatientRequest`.
 * Keys match backend (snake_case) exactly.
 */

export type Patient = {
  id: number
  patient_number: string | null
  national_id: string | null
  full_name: string
  gender: string | null
  date_of_birth: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  /** موجود في استجابة `GET patients/{id}`؛ قد لا يُرسل ضمن بعض قوائم الملخص. */
  medical_history?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PatientsListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

/** `Modules/Patients/Requests/IndexPatientRequest` + Laravel `page` for paginator. */
export type PatientsListFilters = {
  patient_number?: string
  national_id?: string
  full_name?: string
  phone?: string
  gender?: string
  is_active?: boolean
  search?: string
  /** إنشاء السجل بين هذين التاريخين (شامل، YYYY-MM-DD) — استعلامات القائمة فقط */
  created_from?: string
  created_to?: string
  page?: number
}

/**
 * `StorePatientRequest` — JSON body keys. `full_name` is required; others per rules.
 * Omit keys you do not send (undefined). `is_active` uses `PatientData` default `true` when absent on create.
 */
export type CreatePatientInput = {
  full_name: string
  national_id?: string | null
  gender?: string | null
  date_of_birth?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  medical_history?: string | null
  is_active?: boolean
}

/**
 * `UpdatePatientRequest` — partial: only include keys to change. Values align with `PatientData` / rules.
 */
export type UpdatePatientInput = {
  full_name?: string
  patient_number?: string | null
  national_id?: string | null
  gender?: string | null
  date_of_birth?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
  medical_history?: string | null
  is_active?: boolean | null
}
