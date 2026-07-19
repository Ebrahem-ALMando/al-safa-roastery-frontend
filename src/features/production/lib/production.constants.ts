import type { ProductionStatus } from "../types/production.types"

export const PRODUCTION_TABLE_COLUMNS_STORAGE_KEY = "al-safa:production-table-columns"
export const PRODUCTION_PAGE_CONFIG_KEY = "al-safa:production-page-config"
export const PRODUCTION_PERIOD_STORAGE_KEY = "al-safa:production-period"

export type ProductionViewMode = "table" | "cards"
export type ProductionPeriodPreset = "all" | "today" | "yesterday" | "current_week" | "current_month" | "custom"
export type ProductionCustomPeriod = { from: string; to: string }

export const PRODUCTION_PERIOD_LABELS_AR: Record<ProductionPeriodPreset, string> = {
  all: "الكل",
  today: "اليوم الحالي",
  yesterday: "الأمس",
  current_week: "هذا الأسبوع",
  current_month: "هذا الشهر",
  custom: "مخصص",
}

export const PRODUCTION_PERIOD_PRESETS = ["today", "yesterday", "current_week", "current_month", "custom"] as const

export const PRODUCTION_STATUS_LABELS_AR: Record<ProductionStatus, string> = {
  draft: "مسودة",
  completed: "مكتملة",
  cancelled: "ملغاة",
}

export type ProductionTableColumnId =
  | "row_number" | "batch_number" | "production_date" | "output_item" | "output_quantity"
  | "inputs_count" | "total_input_cost" | "cost_per_output_kg" | "status" | "created_at" | "actions"
  | "notes" | "created_by" | "completed_by" | "cancelled_by" | "completed_at" | "cancelled_at"
  | "updated_at" | "input_items_summary" | "yield_percentage"

export const PRODUCTION_TABLE_COLUMNS: Array<{ id: ProductionTableColumnId; label: string; defaultVisible: boolean; essential?: boolean }> = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "batch_number", label: "رقم العملية", defaultVisible: true, essential: true },
  { id: "production_date", label: "تاريخ الإنتاج", defaultVisible: true },
  { id: "output_item", label: "الصنف الناتج", defaultVisible: true },
  { id: "output_quantity", label: "الكمية المنتجة", defaultVisible: true },
  { id: "inputs_count", label: "عدد الأصناف الداخلة", defaultVisible: true },
  { id: "total_input_cost", label: "تكلفة المواد الداخلة", defaultVisible: true },
  { id: "cost_per_output_kg", label: "تكلفة الكيلو الناتج", defaultVisible: true },
  { id: "status", label: "الحالة", defaultVisible: true },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "created_by", label: "أنشئ بواسطة", defaultVisible: false },
  { id: "completed_by", label: "اعتمد بواسطة", defaultVisible: false },
  { id: "cancelled_by", label: "ألغي بواسطة", defaultVisible: false },
  { id: "completed_at", label: "تاريخ الاعتماد", defaultVisible: false },
  { id: "cancelled_at", label: "تاريخ الإلغاء", defaultVisible: false },
  { id: "updated_at", label: "تاريخ التحديث", defaultVisible: false },
  { id: "input_items_summary", label: "ملخص المواد الداخلة", defaultVisible: false },
  { id: "yield_percentage", label: "نسبة المردود", defaultVisible: false },
]

export const DEFAULT_VISIBLE_PRODUCTION_COLUMNS = PRODUCTION_TABLE_COLUMNS.filter((column) => column.defaultVisible).map((column) => column.id)
const VALID_COLUMNS = new Set(PRODUCTION_TABLE_COLUMNS.map((column) => column.id))

export function normalizeProductionColumns(columns: ProductionTableColumnId[]): ProductionTableColumnId[] {
  const result = columns.filter((id, index) => VALID_COLUMNS.has(id) && columns.indexOf(id) === index && id !== "actions")
  if (!result.includes("batch_number")) result.unshift("batch_number")
  return [...result, "actions"]
}

export function getProductionColumnLabel(id: ProductionTableColumnId): string {
  return PRODUCTION_TABLE_COLUMNS.find((column) => column.id === id)?.label ?? id
}
