export const STATEMENTS_PERIOD_STORAGE_KEY = "al-safa:statements-period"

export type StatementPeriodPreset = "all" | "today" | "yesterday" | "current_week" | "current_month" | "custom"
export type StatementCustomPeriod = { from: string; to: string }

export const STATEMENT_ENTRY_LABELS_AR: Record<string, string> = {
  opening_balance: "رصيد افتتاحي",
  customer_opening_balance: "رصيد افتتاحي",
  supplier_opening_balance: "رصيد افتتاحي",
  sales_invoice: "فاتورة بيع",
  purchase_invoice: "فاتورة شراء",
  customer_payment: "دفعة زبون",
  supplier_payment: "دفعة مورد",
  customer_return: "مرتجع زبون",
  supplier_return: "مرتجع مورد",
  adjustment: "تسوية",
}

export const STATEMENT_MESSAGES = {
  selectEntity: "اختر زبوناً أو مورداً لعرض كشف الحساب.",
  emptyPeriod: "لا توجد حركات ضمن الفترة المحددة.",
  loadingError: "تعذر تحميل كشف الحساب. حاول مجدداً.",
  fallback: "تعذر تنفيذ العملية. حاول مجدداً.",
} as const
