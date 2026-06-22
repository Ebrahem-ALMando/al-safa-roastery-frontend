import type {
  PurchaseInvoiceStatus,
  PurchasePaymentMethod,
  PurchasePaymentStatus,
} from "../types/purchase.types"

export const PURCHASES_TABLE_COLUMNS_STORAGE_KEY = "al-safa:purchases-table-columns"
export const PURCHASES_PAGE_CONFIG_KEY = "al-safa:purchases-page-config"
export const PURCHASES_PERIOD_STORAGE_KEY = "al-safa:purchases-period"

export type PurchasesViewMode = "table" | "cards"

export type PurchasesPeriodPreset =
  | "all"
  | "today"
  | "yesterday"
  | "current_week"
  | "current_month"
  | "custom"

export const PURCHASES_PERIOD_LABELS_AR: Record<PurchasesPeriodPreset, string> = {
  all: "الكل",
  today: "اليوم الحالي",
  yesterday: "الأمس",
  current_week: "هذا الأسبوع",
  current_month: "هذا الشهر",
  custom: "مخصص",
}

export const PURCHASES_PERIOD_DROPDOWN_PRESETS = [
  "today",
  "yesterday",
  "current_week",
  "current_month",
  "custom",
] as const satisfies readonly Exclude<PurchasesPeriodPreset, "all">[]

export const PURCHASE_STATUS_LABELS_AR: Record<PurchaseInvoiceStatus, string> = {
  draft: "مسودة",
  completed: "مكتملة",
  cancelled: "ملغاة",
}

export const PURCHASE_PAYMENT_STATUS_LABELS_AR: Record<PurchasePaymentStatus, string> = {
  unpaid: "غير مدفوع",
  partial: "مدفوع جزئياً",
  paid: "مدفوع بالكامل",
}

export const PURCHASE_PAYMENT_METHOD_LABELS_AR: Record<PurchasePaymentMethod, string> = {
  cash: "كاش",
  sham_cash: "Sham Cash",
  bank_transfer: "تحويل بنكي",
  other: "أخرى",
}

export type PurchaseTableColumnId =
  | "row_number"
  | "invoice_number"
  | "invoice_date"
  | "supplier_name"
  | "status"
  | "payment_status"
  | "payment_method"
  | "total"
  | "paid_amount"
  | "remaining_amount"
  | "lines_count"
  | "actions"
  | "notes"
  | "completed_at"
  | "cancelled_at"
  | "created_at"

export const PURCHASE_TABLE_COLUMNS: {
  id: PurchaseTableColumnId
  label: string
  defaultVisible: boolean
  essential?: boolean
}[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "invoice_number", label: "رقم الفاتورة", defaultVisible: true, essential: true },
  { id: "invoice_date", label: "تاريخ الفاتورة", defaultVisible: true },
  { id: "supplier_name", label: "المورد", defaultVisible: true },
  { id: "status", label: "الحالة", defaultVisible: true },
  { id: "payment_status", label: "حالة الدفع", defaultVisible: true },
  { id: "payment_method", label: "طريقة الدفع", defaultVisible: true },
  { id: "total", label: "الإجمالي", defaultVisible: true },
  { id: "paid_amount", label: "المدفوع", defaultVisible: true },
  { id: "remaining_amount", label: "المتبقي", defaultVisible: true },
  { id: "lines_count", label: "البنود", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "completed_at", label: "تاريخ الإكمال", defaultVisible: false },
  { id: "cancelled_at", label: "تاريخ الإلغاء", defaultVisible: false },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: false },
]

export const DEFAULT_VISIBLE_PURCHASE_COLUMNS: PurchaseTableColumnId[] = PURCHASE_TABLE_COLUMNS.filter(
  (c) => c.defaultVisible
).map((c) => c.id)

export type PurchasesCustomPeriod = {
  from: string
  to: string
}

export type StoredPurchasesPeriod = {
  preset: PurchasesPeriodPreset
  custom?: PurchasesCustomPeriod
}

const VALID_COLUMN_IDS = new Set(PURCHASE_TABLE_COLUMNS.map((c) => c.id))

export function normalizePurchaseVisibleColumns(
  columns: PurchaseTableColumnId[]
): PurchaseTableColumnId[] {
  const seen = new Set<PurchaseTableColumnId>()
  const result: PurchaseTableColumnId[] = []
  for (const id of columns) {
    if (!VALID_COLUMN_IDS.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  if (!result.includes("invoice_number")) result.unshift("invoice_number")
  if (!result.includes("actions")) {
    result.push("actions")
  } else {
    const withoutActions = result.filter((id) => id !== "actions")
    return [...withoutActions, "actions"]
  }
  return result
}

export function insertPurchaseColumnBeforeActions(
  columns: PurchaseTableColumnId[],
  columnId: PurchaseTableColumnId
): PurchaseTableColumnId[] {
  const without = columns.filter((id) => id !== columnId)
  const actionsIndex = without.indexOf("actions")
  if (actionsIndex === -1) return normalizePurchaseVisibleColumns([...without, columnId, "actions"])
  return normalizePurchaseVisibleColumns([
    ...without.slice(0, actionsIndex),
    columnId,
    ...without.slice(actionsIndex),
  ])
}

export function getPurchaseColumnLabel(id: PurchaseTableColumnId): string {
  return PURCHASE_TABLE_COLUMNS.find((c) => c.id === id)?.label ?? id
}
