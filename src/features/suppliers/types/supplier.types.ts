/**
 * Shapes from Laravel `SupplierResource`, `IndexSupplierRequest`, `StoreSupplierRequest`, `UpdateSupplierRequest`.
 * Keys match backend (snake_case) exactly.
 */

export type SupplierUserRef = {
  id: number
  name: string
}

export type Supplier = {
  id: number
  code: string | null
  name: string
  phone: string | null
  secondary_phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  contact_person: string | null
  opening_balance: string | number | null
  current_balance: string | number | null
  credit_limit: string | number | null
  is_active: boolean
  notes: string | null
  created_at: string | null
  updated_at: string | null
  created_by?: SupplierUserRef
  updated_by?: SupplierUserRef
}

export type SuppliersListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

/** `IndexSupplierRequest` + Laravel paginator `page`. */
export type SuppliersListFilters = {
  search?: string
  is_active?: boolean
  sort_by?: string
  sort_direction?: "asc" | "desc"
  page?: number
  per_page?: number
}

/** `StoreSupplierRequest` */
export type CreateSupplierInput = {
  code?: string | null
  name: string
  phone?: string | null
  secondary_phone?: string | null
  whatsapp?: string | null
  email?: string | null
  address?: string | null
  contact_person?: string | null
  opening_balance?: number | null
  credit_limit?: number | null
  is_active?: boolean
  notes?: string | null
}

/** `UpdateSupplierRequest` — partial updates only. */
export type UpdateSupplierInput = {
  code?: string | null
  name?: string
  phone?: string | null
  secondary_phone?: string | null
  whatsapp?: string | null
  email?: string | null
  address?: string | null
  contact_person?: string | null
  opening_balance?: number | null
  credit_limit?: number | null
  is_active?: boolean
  notes?: string | null
}

export type ReportCard = {
  key: string
  label: string
  value: string | number
  type: string
  description?: string
}

export type ReportPayload = {
  filters: Record<string, unknown>
  cards: ReportCard[]
  charts: unknown[]
  tables: Record<string, unknown>
}

export type SuppliersSummaryData = {
  activeSuppliersCount: number | null
  purchasesTotalInPeriod: string | null
  suppliersPayableTotal: string | null
  supplierCreditTotal: string | null
}
