export type PurchaseInvoiceStatus = "draft" | "completed" | "cancelled"
export type PurchasePaymentStatus = "unpaid" | "partial" | "paid"
export type PurchasePaymentMethod = "cash" | "sham_cash" | "bank_transfer" | "other"

export type PurchaseUserRef = {
  id: number
  name: string
}

export type PurchaseSupplierRef = {
  id: number
  code: string | null
  name: string
  current_balance?: string | number | null
}

export type PurchaseItemRef = {
  id: number
  code: string | null
  name: string
  item_type: string
  current_quantity_kg: string | number | null
  average_cost: string | number | null
}

export type PurchaseInvoiceLine = {
  id: number
  purchase_invoice_id: number
  item_id: number
  quantity_kg: string | number
  unit_price: string | number
  line_total: string | number
  previous_average_cost: string | number | null
  new_average_cost: string | number | null
  inventory_movement_id: number | null
  cancellation_inventory_movement_id: number | null
  notes: string | null
  item?: PurchaseItemRef
}

export type PurchaseInvoice = {
  id: number
  invoice_number: string
  supplier_id: number
  invoice_date: string
  status: PurchaseInvoiceStatus
  payment_status: PurchasePaymentStatus
  payment_method: PurchasePaymentMethod | null
  subtotal: string | number
  discount: string | number
  total: string | number
  paid_amount: string | number
  remaining_amount: string | number
  supplier_total_remaining_after: string | number | null
  cashbox_transaction_id: number | null
  cancellation_cashbox_transaction_id: number | null
  notes: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  lines_count: number | null
  created_at: string | null
  updated_at: string | null
  supplier?: PurchaseSupplierRef
  lines?: PurchaseInvoiceLine[]
  created_by?: PurchaseUserRef
  updated_by?: PurchaseUserRef
  completed_by?: PurchaseUserRef
  cancelled_by?: PurchaseUserRef
}

export type PurchasesListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export type PurchasesListFilters = {
  search?: string
  supplier_id?: number
  status?: PurchaseInvoiceStatus
  payment_status?: PurchasePaymentStatus
  payment_method?: PurchasePaymentMethod
  date_from?: string
  date_to?: string
  sort_by?: string
  sort_direction?: "asc" | "desc"
  page?: number
  per_page?: number
}

export type PurchaseSummaryResponse = {
  total_purchases: string
  completed_invoices_count: number
  total_paid: string
  total_remaining: string
}

export type PurchaseSummaryFilters = {
  date_from?: string
  date_to?: string
  supplier_id?: number
  status?: PurchaseInvoiceStatus
  payment_status?: PurchasePaymentStatus
  payment_method?: PurchasePaymentMethod
}

export type CancelPurchaseInput = {
  cancel_reason: string
}
