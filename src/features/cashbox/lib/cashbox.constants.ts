import type { CashboxDirection, CashboxPaymentMethod, CashboxTransactionType } from "../types/cashbox.types"

export const CASHBOX_TABLE_COLUMNS_STORAGE_KEY = "al-safa:cashbox-table-columns"
export const CASHBOX_PAGE_CONFIG_KEY = "al-safa:cashbox-page-config"
export const CASHBOX_PERIOD_STORAGE_KEY = "al-safa:cashbox-period"

export type CashboxViewMode = "table" | "cards"
export type CashboxPeriodPreset = "all" | "today" | "yesterday" | "current_week" | "current_month" | "custom"
export type CashboxCustomPeriod = { from: string; to: string }

export const CASHBOX_DIRECTION_LABELS_AR: Record<CashboxDirection, string> = {
  in: "وارد",
  out: "صادر",
}

export const CASHBOX_PAYMENT_METHOD_LABELS_AR: Record<CashboxPaymentMethod, string> = {
  cash: "كاش",
  sham_cash: "Sham Cash",
  bank_transfer: "تحويل بنكي",
  other: "أخرى",
}

export const CASHBOX_TRANSACTION_TYPE_LABELS_AR: Record<CashboxTransactionType, string> = {
  customer_payment: "دفعة زبون",
  supplier_payment: "دفعة مورد",
  expense: "مصروف",
  manual_deposit: "إيداع يدوي",
  manual_withdrawal: "سحب يدوي",
  refund: "استرداد",
  opening_balance: "رصيد افتتاحي",
  cancellation: "حركة إلغاء",
}

export const CASHBOX_TRANSACTION_TYPE_OPTIONS = Object.entries(CASHBOX_TRANSACTION_TYPE_LABELS_AR).map(
  ([value, label]) => ({ value: value as CashboxTransactionType, label }),
)

export const CASHBOX_SOURCE_TYPE_OPTIONS = [
  { value: "sales_invoice", label: "مبيعات" },
  { value: "sales_invoice_cancellation", label: "إلغاء مبيعات" },
  { value: "purchase_invoice", label: "مشتريات" },
  { value: "purchase_invoice_cancellation", label: "إلغاء مشتريات" },
  { value: "customer_payment", label: "دفعة زبون" },
  { value: "customer_payment_cancellation", label: "إلغاء دفعة زبون" },
  { value: "supplier_payment", label: "دفعة مورد" },
  { value: "supplier_payment_cancellation", label: "إلغاء دفعة مورد" },
  { value: "expense", label: "مصروف" },
  { value: "expense_cancellation", label: "إلغاء مصروف" },
  { value: "customer_return", label: "مرتجع زبون" },
  { value: "customer_return_cancellation", label: "إلغاء مرتجع زبون" },
  { value: "supplier_return", label: "مرتجع مورد" },
  { value: "supplier_return_cancellation", label: "إلغاء مرتجع مورد" },
  { value: "manual_cashbox_transaction", label: "حركة يدوية" },
  { value: "cashbox_transaction_cancellation", label: "إلغاء حركة صندوق" },
] as const

export const CASHBOX_SOURCE_TYPE_LABELS_AR: Record<string, string> = Object.fromEntries(
  CASHBOX_SOURCE_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

export type CashboxTableColumnId =
  | "row_number"
  | "transaction_date"
  | "transaction_number"
  | "type"
  | "source"
  | "payment_method"
  | "incoming"
  | "outgoing"
  | "balance_after"
  | "user"
  | "notes"
  | "transaction_type"
  | "source_type"
  | "source_number"
  | "description"
  | "created_at"

export const CASHBOX_TABLE_COLUMNS: { id: CashboxTableColumnId; label: string; defaultVisible: boolean }[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "transaction_date", label: "التاريخ", defaultVisible: true },
  { id: "transaction_number", label: "رقم الحركة", defaultVisible: true },
  { id: "type", label: "نوع الحركة", defaultVisible: true },
  { id: "source", label: "المصدر", defaultVisible: true },
  { id: "payment_method", label: "طريقة الدفع", defaultVisible: true },
  { id: "incoming", label: "الوارد", defaultVisible: true },
  { id: "outgoing", label: "الصادر", defaultVisible: true },
  { id: "balance_after", label: "الرصيد بعد الحركة", defaultVisible: true },
  { id: "user", label: "المستخدم", defaultVisible: true },
  { id: "notes", label: "ملاحظات", defaultVisible: true },
  { id: "transaction_type", label: "تصنيف الحركة", defaultVisible: false },
  { id: "source_type", label: "نوع المصدر", defaultVisible: false },
  { id: "source_number", label: "رقم المصدر", defaultVisible: false },
  { id: "description", label: "الوصف", defaultVisible: false },
  { id: "created_at", label: "تاريخ التسجيل", defaultVisible: false },
]

export const DEFAULT_VISIBLE_CASHBOX_COLUMNS = CASHBOX_TABLE_COLUMNS
  .filter((column) => column.defaultVisible)
  .map((column) => column.id)

const VALID_COLUMNS = new Set(CASHBOX_TABLE_COLUMNS.map((column) => column.id))
export const CASHBOX_CONTEXT_COLUMNS: CashboxTableColumnId[] = ["transaction_date", "source", "incoming", "outgoing"]

export function normalizeCashboxColumns(columns: CashboxTableColumnId[]): CashboxTableColumnId[] {
  const normalized = [...new Set(columns.filter((id) => VALID_COLUMNS.has(id)))]
  if (!normalized.some((id) => CASHBOX_CONTEXT_COLUMNS.includes(id))) normalized.unshift("transaction_date")
  return normalized.length > 0 ? normalized : DEFAULT_VISIBLE_CASHBOX_COLUMNS
}
