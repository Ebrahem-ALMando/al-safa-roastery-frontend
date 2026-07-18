import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"

export type CashboxDirection = "in" | "out"
export type CashboxPaymentMethod = "cash" | "sham_cash" | "bank_transfer" | "other"
export type CashboxTransactionType =
  | "customer_payment"
  | "supplier_payment"
  | "expense"
  | "manual_deposit"
  | "manual_withdrawal"
  | "refund"
  | "opening_balance"
  | "cancellation"

export type CashboxUserRef = { id: number; name: string }

export type CashboxTransaction = {
  id: number
  transaction_number: string | null
  transaction_date: string
  transaction_type: CashboxTransactionType | string
  direction: CashboxDirection
  amount: string | number
  payment_method: CashboxPaymentMethod | null
  before_balance: string | number | null
  after_balance: string | number | null
  reference_type: string | null
  reference_id: number | null
  source_type: string | null
  source_id: number | null
  source_number: string | null
  description: string | null
  notes: string | null
  is_manual: boolean
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at?: string | null
  created_by?: CashboxUserRef
}

export type CashboxSummary = {
  current_balance: string | number
  total_in: string | number
  total_out: string | number
  transactions_count: number
}

export type CashboxPaginationMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
  from?: number
  to?: number
}

export type CashboxFilters = {
  search?: string
  type?: CashboxDirection
  source_type?: string
  payment_method?: CashboxPaymentMethod
  transaction_type?: CashboxTransactionType
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_direction?: "asc" | "desc"
}

export type CashboxDateRange = ResolvedOperationalDateRange | null

export type ManualCashboxTransactionInput = {
  transaction_date: string
  amount: number
  payment_method: CashboxPaymentMethod
  description: string
  notes?: string | null
}
