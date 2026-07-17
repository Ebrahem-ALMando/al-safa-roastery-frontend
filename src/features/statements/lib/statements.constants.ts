import type { StatementColumnDefinition, StatementEntityType, StatementInvoiceColumnId, StatementMovementColumnId, StatementMovementDirection, StatementMovementEntryType, StatementPaymentColumnId, StatementReturnColumnId } from "../types/statement.types"

export const STATEMENTS_PERIOD_STORAGE_KEY = "al-safa:statements-period"
export const STATEMENTS_MOVEMENTS_COLUMNS_KEY = "al-safa:statements-movements-columns"
export const STATEMENTS_CUSTOMER_INVOICES_COLUMNS_KEY = "al-safa:statements-customer-invoices-columns"
export const STATEMENTS_SUPPLIER_INVOICES_COLUMNS_KEY = "al-safa:statements-supplier-invoices-columns"
export const STATEMENTS_CUSTOMER_PAYMENTS_COLUMNS_KEY = "al-safa:statements-customer-payments-columns"
export const STATEMENTS_SUPPLIER_PAYMENTS_COLUMNS_KEY = "al-safa:statements-supplier-payments-columns"
export const STATEMENTS_CUSTOMER_RETURNS_COLUMNS_KEY = "al-safa:statements-customer-returns-columns"
export const STATEMENTS_SUPPLIER_RETURNS_COLUMNS_KEY = "al-safa:statements-supplier-returns-columns"

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
  emptyPeriod: "لا توجد حركات ضمن الفلاتر الحالية.",
  loadingError: "تعذر تحميل كشف الحساب. حاول مجدداً.",
  fallback: "تعذر تنفيذ العملية. حاول مجدداً.",
} as const

export const STATEMENT_MOVEMENT_TYPE_OPTIONS: Array<{ value: StatementMovementEntryType; label: string; entityType?: StatementEntityType }> = [
  { value: "opening_balance", label: "رصيد افتتاحي" },
  { value: "sales_invoice", label: "فاتورة بيع", entityType: "customer" },
  { value: "purchase_invoice", label: "فاتورة شراء", entityType: "supplier" },
  { value: "customer_payment", label: "دفعة زبون", entityType: "customer" },
  { value: "supplier_payment", label: "دفعة مورد", entityType: "supplier" },
  { value: "customer_return", label: "مرتجع زبون", entityType: "customer" },
  { value: "supplier_return", label: "مرتجع مورد", entityType: "supplier" },
]

export const STATEMENT_MOVEMENT_DIRECTION_OPTIONS: Array<{ value: StatementMovementDirection; label: string }> = [
  { value: "debit", label: "مدين" },
  { value: "credit", label: "دائن" },
]

export const STATEMENT_TAB_LABELS_AR = {
  movements: "الحركات",
  invoices: "الفواتير",
  payments: "الدفعات",
  returns: "المرتجعات",
} as const

export const STATEMENT_PAYMENT_METHOD_LABELS_AR: Record<string, string> = {
  cash: "كاش",
  sham_cash: "شام كاش",
  bank_transfer: "تحويل بنكي",
  other: "أخرى",
}

export const STATEMENT_STATUS_LABELS_AR: Record<string, string> = {
  draft: "مسودة",
  completed: "مكتمل",
  cancelled: "ملغى",
  paid: "مدفوع",
  partial: "مدفوع جزئياً",
  unpaid: "غير مدفوع",
  active: "نشط",
}

export const STATEMENT_MOVEMENT_COLUMNS: StatementColumnDefinition<StatementMovementColumnId>[] = [
  { id: "entry_date", label: "التاريخ", defaultVisible: true, protected: true },
  { id: "entry_type", label: "نوع الحركة", defaultVisible: true },
  { id: "reference", label: "المرجع", defaultVisible: true, protected: true },
  { id: "description", label: "البيان", defaultVisible: true },
  { id: "debit", label: "مدين", defaultVisible: true },
  { id: "credit", label: "دائن", defaultVisible: true },
  { id: "running_balance", label: "الرصيد الجاري", defaultVisible: true, protected: true },
  { id: "user", label: "المستخدم", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, protected: true },
  { id: "source_type", label: "نوع المصدر", defaultVisible: false },
  { id: "source_number", label: "رقم المصدر", defaultVisible: false },
  { id: "created_at", label: "تاريخ التسجيل", defaultVisible: false },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
]

export const STATEMENT_INVOICE_COLUMNS: StatementColumnDefinition<StatementInvoiceColumnId>[] = [
  { id: "invoice_number", label: "رقم الفاتورة", defaultVisible: true, protected: true },
  { id: "invoice_date", label: "التاريخ", defaultVisible: true, protected: true },
  { id: "total", label: "الإجمالي", defaultVisible: true },
  { id: "paid_amount", label: "المدفوع", defaultVisible: true },
  { id: "remaining_amount", label: "المتبقي", defaultVisible: true },
  { id: "payment_status", label: "حالة الدفع", defaultVisible: true },
  { id: "status", label: "حالة الفاتورة", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true },
  { id: "subtotal", label: "المجموع الفرعي", defaultVisible: false },
  { id: "discount", label: "الحسم", defaultVisible: false },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "created_at", label: "تاريخ التسجيل", defaultVisible: false },
  { id: "completed_at", label: "تاريخ الإكمال", defaultVisible: false },
  { id: "cancelled_at", label: "تاريخ الإلغاء", defaultVisible: false },
  { id: "created_by", label: "أنشأ بواسطة", defaultVisible: false },
]

export const STATEMENT_PAYMENT_COLUMNS: StatementColumnDefinition<StatementPaymentColumnId>[] = [
  { id: "payment_number", label: "رقم الدفعة", defaultVisible: true, protected: true },
  { id: "payment_date", label: "التاريخ", defaultVisible: true, protected: true },
  { id: "amount", label: "المبلغ", defaultVisible: true },
  { id: "payment_method", label: "طريقة الدفع", defaultVisible: true },
  { id: "reference", label: "المرجع", defaultVisible: true },
  { id: "notes", label: "ملاحظات", defaultVisible: true },
  { id: "user", label: "المستخدم", defaultVisible: true },
  { id: "status", label: "الحالة", defaultVisible: false },
  { id: "allocated_amount", label: "المبلغ المخصص", defaultVisible: false },
  { id: "unallocated_amount", label: "المبلغ غير المخصص", defaultVisible: false },
  { id: "created_at", label: "تاريخ التسجيل", defaultVisible: false },
  { id: "updated_at", label: "آخر تحديث", defaultVisible: false },
]

export const STATEMENT_RETURN_COLUMNS: StatementColumnDefinition<StatementReturnColumnId>[] = [
  { id: "return_number", label: "رقم المرتجع", defaultVisible: true, protected: true },
  { id: "return_date", label: "التاريخ", defaultVisible: true, protected: true },
  { id: "amount", label: "القيمة", defaultVisible: true },
  { id: "status", label: "الحالة", defaultVisible: true },
  { id: "reference", label: "المرجع", defaultVisible: true },
  { id: "reason", label: "السبب", defaultVisible: true },
  { id: "user", label: "المستخدم", defaultVisible: true },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "created_at", label: "تاريخ التسجيل", defaultVisible: false },
  { id: "updated_at", label: "آخر تحديث", defaultVisible: false },
]
