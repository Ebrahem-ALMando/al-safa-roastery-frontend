import type { InventoryItemType, InventoryStockStatusFilter } from "../types/inventory.types"

export const INVENTORY_TABLE_COLUMNS_STORAGE_KEY = "al-safa:inventory-table-columns"
export const INVENTORY_PAGE_CONFIG_KEY = "al-safa:inventory-page-config"
export const INVENTORY_PERIOD_STORAGE_KEY = "al-safa:inventory-period"

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
