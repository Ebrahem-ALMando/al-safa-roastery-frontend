import type { InventoryDirectionFilter, InventoryItemType, InventoryStockStatusFilter } from "../types/inventory.types"

export const INVENTORY_TABLE_COLUMNS_STORAGE_KEY = "al-safa:inventory-table-columns"
export const INVENTORY_PAGE_CONFIG_KEY = "al-safa:inventory-page-config"
export const INVENTORY_PERIOD_STORAGE_KEY = "al-safa:inventory-period"
export const INVENTORY_MOVEMENTS_TABLE_COLUMNS_STORAGE_KEY = "al-safa:inventory-movements-table-columns"
export const INVENTORY_MOVEMENTS_PAGE_CONFIG_KEY = "al-safa:inventory-movements-page-config"

export type InventoryViewMode = "table" | "cards"
export type InventoryPeriodPreset = "all" | "today" | "yesterday" | "current_week" | "current_month" | "custom"
export type InventoryCustomPeriod = { from: string; to: string }

export const INVENTORY_PERIOD_LABELS_AR: Record<InventoryPeriodPreset, string> = {
  all: "الكل", today: "اليوم الحالي", yesterday: "الأمس", current_week: "هذا الأسبوع",
  current_month: "هذا الشهر", custom: "مخصص",
}
export const INVENTORY_ITEM_TYPE_LABELS_AR: Record<InventoryItemType, string> = { raw: "خام", ready: "جاهز" }
export const INVENTORY_STOCK_STATUS_LABELS_AR: Record<InventoryStockStatusFilter, string> = {
  available: "متوفر", low: "منخفض", out_of_stock: "نافد", reorder_required: "يحتاج إعادة طلب",
}
export const WITHDRAWAL_REASON_LABELS_AR = {
  general: "عام", internal_use: "استهلاك داخلي", damage: "تلف", sample: "عينات", shortage: "ضياع", other: "أخرى",
} as const
export const ADJUSTMENT_REASON_LABELS_AR = {
  stock_count: "جرد فعلي", correction: "تصحيح إدخال", damaged_found: "تلف مكتشف", other: "أخرى",
} as const

export const INVENTORY_MOVEMENT_TYPE_OPTIONS = [
  { value: "purchase", label: "فاتورة شراء" },
  { value: "production_input", label: "سحب إنتاج" },
  { value: "production_output", label: "ناتج إنتاج" },
  { value: "sale", label: "بيع" },
  { value: "withdrawal", label: "سحب يدوي" },
  { value: "adjustment", label: "تسوية مخزون" },
  { value: "customer_return", label: "مرتجع زبون" },
  { value: "supplier_return", label: "مرتجع مورد" },
] as const

export const INVENTORY_DIRECTION_FILTER_LABELS_AR: Record<InventoryDirectionFilter, string> = {
  in: "وارد",
  out: "صادر",
  adjustment: "تسوية",
}

export const INVENTORY_SOURCE_TYPE_OPTIONS = [
  { value: "purchases", label: "مشتريات" },
  { value: "production", label: "إنتاج" },
  { value: "sales", label: "مبيعات" },
  { value: "withdrawal", label: "سحب يدوي" },
  { value: "adjustment", label: "تسوية" },
  { value: "returns", label: "مرتجعات" },
] as const

export const INVENTORY_SOURCE_TYPE_LABELS_AR: Record<string, string> = {
  purchases: "مشتريات",
  purchase_invoice_line: "مشتريات",
  purchase_invoice_cancellation: "إلغاء مشتريات",
  production: "إنتاج",
  production_batch_input: "مدخل إنتاج",
  production_batch_output: "ناتج إنتاج",
  production_batch_input_cancellation: "إلغاء مدخل إنتاج",
  production_batch_output_cancellation: "إلغاء ناتج إنتاج",
  sales: "مبيعات",
  sales_invoice_line: "مبيعات",
  sales_invoice_cancellation: "إلغاء مبيعات",
  withdrawal: "سحب يدوي",
  stock_withdrawal: "سحب يدوي",
  adjustment: "تسوية",
  inventory_adjustment: "تسوية",
  returns: "مرتجعات",
  supplier_return_line: "مرتجع مورد",
  customer_return_line: "مرتجع زبون",
  supplier_return_cancellation: "إلغاء مرتجع مورد",
  customer_return_cancellation: "إلغاء مرتجع زبون",
}

export type InventoryMovementTableColumnId =
  | "row_number" | "movement_date" | "item" | "movement_type" | "source"
  | "incoming" | "outgoing" | "cost" | "balance_after" | "user" | "notes"
  | "direction" | "source_type" | "unit_cost" | "total_cost" | "created_at"

export const INVENTORY_MOVEMENT_TABLE_COLUMNS: { id: InventoryMovementTableColumnId; label: string; defaultVisible: boolean }[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "movement_date", label: "التاريخ", defaultVisible: true },
  { id: "item", label: "الصنف", defaultVisible: true },
  { id: "movement_type", label: "نوع الحركة", defaultVisible: true },
  { id: "source", label: "المرجع", defaultVisible: true },
  { id: "incoming", label: "الوارد", defaultVisible: true },
  { id: "outgoing", label: "الصادر", defaultVisible: true },
  { id: "cost", label: "التكلفة", defaultVisible: true },
  { id: "balance_after", label: "الرصيد بعد الحركة", defaultVisible: true },
  { id: "user", label: "المستخدم", defaultVisible: true },
  { id: "notes", label: "ملاحظات", defaultVisible: true },
  { id: "direction", label: "الاتجاه", defaultVisible: false },
  { id: "source_type", label: "مصدر الحركة", defaultVisible: false },
  { id: "unit_cost", label: "تكلفة الوحدة", defaultVisible: false },
  { id: "total_cost", label: "إجمالي التكلفة", defaultVisible: false },
  { id: "created_at", label: "تاريخ التسجيل", defaultVisible: false },
]

export const DEFAULT_VISIBLE_INVENTORY_MOVEMENT_COLUMNS = INVENTORY_MOVEMENT_TABLE_COLUMNS
  .filter((column) => column.defaultVisible)
  .map((column) => column.id)

const VALID_MOVEMENT_COLUMNS = new Set(INVENTORY_MOVEMENT_TABLE_COLUMNS.map((column) => column.id))
const MOVEMENT_CONTEXT_COLUMNS: InventoryMovementTableColumnId[] = ["movement_date", "item", "source"]

export function normalizeInventoryMovementColumns(columns: InventoryMovementTableColumnId[]): InventoryMovementTableColumnId[] {
  const normalized = [...new Set(columns.filter((id) => VALID_MOVEMENT_COLUMNS.has(id)))]
  if (!normalized.some((id) => MOVEMENT_CONTEXT_COLUMNS.includes(id))) normalized.unshift("movement_date")
  return normalized.length > 0 ? normalized : DEFAULT_VISIBLE_INVENTORY_MOVEMENT_COLUMNS
}

export type InventoryTableColumnId = "row_number" | "item" | "item_type" | "current_quantity" |
  "average_cost" | "stock_value" | "minimum_quantity" | "stock_status" | "last_activity" | "actions" |
  "code" | "last_purchase_price" | "movements_count_in_period" | "created_at" | "updated_at"

export const INVENTORY_TABLE_COLUMNS: { id: InventoryTableColumnId; label: string; defaultVisible: boolean; essential?: boolean }[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "item", label: "الصنف", defaultVisible: true, essential: true },
  { id: "item_type", label: "النوع", defaultVisible: true },
  { id: "current_quantity", label: "الكمية الحالية", defaultVisible: true },
  { id: "average_cost", label: "متوسط التكلفة", defaultVisible: true },
  { id: "stock_value", label: "قيمة المخزون", defaultVisible: true },
  { id: "minimum_quantity", label: "حد إعادة الطلب", defaultVisible: true },
  { id: "stock_status", label: "حالة المخزون", defaultVisible: true },
  { id: "last_activity", label: "آخر حركة", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "code", label: "الكود", defaultVisible: false },
  { id: "last_purchase_price", label: "آخر سعر شراء", defaultVisible: false },
  { id: "movements_count_in_period", label: "حركات الفترة", defaultVisible: false },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: false },
  { id: "updated_at", label: "تاريخ التحديث", defaultVisible: false },
]
export const DEFAULT_VISIBLE_INVENTORY_COLUMNS = INVENTORY_TABLE_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id)
const VALID = new Set(INVENTORY_TABLE_COLUMNS.map((c) => c.id))
export function normalizeInventoryColumns(columns: InventoryTableColumnId[]): InventoryTableColumnId[] {
  const result = [...new Set(columns.filter((id) => VALID.has(id)))]
  if (!result.includes("item")) result.unshift("item")
  const withoutActions = result.filter((id) => id !== "actions")
  return [...withoutActions, "actions"]
}
