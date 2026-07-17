import type { CustomerType } from "../../customers/types/customer.types"

export type StatementEntityType = "customer" | "supplier"

export type StatementUserRef = {
  id: number
  name: string
}

export type StatementParty = {
  id: number
  type: StatementEntityType
  code: string | null
  name: string
  phone: string | null
  customer_type?: CustomerType | null
  current_balance: string | number
}

export type StatementPeriod = {
  date_from: string | null
  date_to: string | null
  include_opening_balance: boolean
  include_cancelled: boolean
}

export type StatementSummary = {
  entries_count: number
  opening_balance: string | number
  total_increase: string | number
  total_decrease: string | number
  net_change: string | number
  closing_balance: string | number
  current_stored_balance: string | number
  difference: string | number
}

export type StatementEntry = {
  entry_type: string
  entry_label: string
  reference_type: string | null
  reference_id: number | null
  reference_number: string | null
  entry_date: string
  status: string
  total: string | number
  paid_or_received_amount: string | number
  remaining_or_balance_impact: string | number
  increase: string | number
  decrease: string | number
  balance_after: string | number
  allocated_amount: string | number | null
  unallocated_amount: string | number | null
  notes: string | null
  created_by: StatementUserRef | null
}

export type StatementResponse = {
  party: StatementParty
  period: StatementPeriod
  summary: StatementSummary
  entries: StatementEntry[]
}

export type StatementEntityOption = {
  id: number
  name: string
  code: string | null
  phone: string | null
}

export type StatementQuery = {
  date_from?: string
  date_to?: string
}

export type StatementTab = "movements" | "invoices" | "payments" | "returns"
export type StatementDataTab = Exclude<StatementTab, "movements">

export type StatementPaginationMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

export type StatementReference = {
  id: number | null
  number: string | null
}

export type StatementInvoice = {
  id: number
  invoice_number: string
  invoice_date: string
  subtotal: string | number
  discount: string | number
  total: string | number
  paid_amount: string | number
  remaining_amount: string | number
  payment_status: string
  status: string
  notes: string | null
  created_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  created_by: StatementUserRef | null
}

export type StatementPayment = {
  id: number
  payment_number: string
  payment_date: string
  amount: string | number
  allocated_amount: string | number
  unallocated_amount: string | number
  payment_method: string
  status: string
  references: StatementReference[]
  notes: string | null
  created_at: string | null
  updated_at: string | null
  created_by: StatementUserRef | null
}

export type StatementReturn = {
  id: number
  return_number: string
  return_date: string
  total: string | number
  status: string
  reference: StatementReference | null
  notes: string | null
  cancel_reason: string | null
  created_at: string | null
  updated_at: string | null
  created_by: StatementUserRef | null
}

export type StatementInvoiceSummary = {
  invoices_count: number
  total_amount: string | number
  paid_amount: string | number
  remaining_amount: string | number
}

export type StatementPaymentSummary = {
  payments_count: number
  total_amount: string | number
  latest_payment_date: string | null
  most_used_payment_method: string | null
}

export type StatementReturnSummary = {
  returns_count: number
  total_amount: string | number
  latest_return_date: string | null
  average_amount: string | number
}

export type StatementTabResponse<TItem, TSummary> = {
  items: TItem[]
  meta: StatementPaginationMeta
  summary: TSummary
}

export type StatementTabQuery = StatementQuery & {
  search?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_direction?: "asc" | "desc"
  status?: string
  payment_status?: string
  payment_method?: string
}

export type StatementMovementColumnId = "entry_date" | "entry_type" | "reference" | "description" | "debit" | "credit" | "running_balance" | "user"
export type StatementInvoiceColumnId = "invoice_number" | "invoice_date" | "total" | "paid_amount" | "remaining_amount" | "payment_status" | "status" | "actions" | "subtotal" | "discount" | "notes" | "created_at" | "completed_at" | "cancelled_at" | "created_by"
export type StatementPaymentColumnId = "payment_number" | "payment_date" | "amount" | "payment_method" | "reference" | "notes" | "user" | "status" | "allocated_amount" | "unallocated_amount" | "created_at" | "updated_at"
export type StatementReturnColumnId = "return_number" | "return_date" | "amount" | "status" | "reference" | "reason" | "user" | "notes" | "created_at" | "updated_at"
export type StatementColumnId = StatementMovementColumnId | StatementInvoiceColumnId | StatementPaymentColumnId | StatementReturnColumnId

export type StatementColumnDefinition<TId extends StatementColumnId> = {
  id: TId
  label: string
  defaultVisible: boolean
  protected?: boolean
}
