import type { ItemType } from "../types/item.types"

export const ITEMS_TABLE_COLUMNS_STORAGE_KEY = "al-safa:items-table-columns"

export const ITEMS_PAGE_CONFIG_KEY = "al-safa:items-page-config"

export const ITEMS_PERIOD_STORAGE_KEY = "al-safa:items-period"

export type ItemsViewMode = "table" | "cards"

export type ItemsPeriodPreset =
  | "all"
  | "today"
  | "yesterday"
  | "current_week"
  | "current_month"
  | "custom"

export const ITEMS_PERIOD_LABELS_AR: Record<ItemsPeriodPreset, string> = {
  all: "الكل",
  today: "اليوم الحالي",
  yesterday: "الأمس",
  current_week: "هذا الأسبوع",
  current_month: "هذا الشهر",
  custom: "مخصص",
}

export const ITEMS_PERIOD_DROPDOWN_PRESETS = [
  "today",
  "yesterday",
  "current_week",
  "current_month",
  "custom",
] as const satisfies readonly Exclude<ItemsPeriodPreset, "all">[]

export const ITEM_TYPE_LABELS_AR: Record<ItemType, string> = {
  raw: "خام",
  ready: "جاهز",
}

export const STOCK_STATUS_LABELS_AR = {
  available: "متوفر",
  low: "منخفض",
  out_of_stock: "نافد",
} as const

export type ItemTableColumnId =
  | "row_number"
  | "item_name"
  | "item_type"
  | "current_quantity"
  | "average_cost"
  | "stock_status"
  | "last_activity"
  | "is_active"
  | "actions"
  | "code"
  | "minimum_quantity"
  | "last_purchase_price"
  | "unit"
  | "notes"
  | "created_at"
  | "updated_at"

export const ITEM_TABLE_COLUMNS: {
  id: ItemTableColumnId
  label: string
  defaultVisible: boolean
  essential?: boolean
}[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "item_name", label: "اسم الصنف", defaultVisible: true, essential: true },
  { id: "item_type", label: "نوع الصنف", defaultVisible: true },
  { id: "current_quantity", label: "الكمية الحالية", defaultVisible: true },
  { id: "average_cost", label: "متوسط التكلفة", defaultVisible: true },
  { id: "stock_status", label: "حالة المخزون", defaultVisible: true },
  { id: "last_activity", label: "آخر نشاط", defaultVisible: true },
  { id: "is_active", label: "الحالة", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "code", label: "الكود", defaultVisible: false },
  { id: "minimum_quantity", label: "الحد الأدنى", defaultVisible: false },
  { id: "last_purchase_price", label: "آخر سعر شراء", defaultVisible: false },
  { id: "unit", label: "الوحدة", defaultVisible: false },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: false },
  { id: "updated_at", label: "تاريخ التحديث", defaultVisible: false },
]

export const DEFAULT_VISIBLE_ITEM_COLUMNS: ItemTableColumnId[] = ITEM_TABLE_COLUMNS.filter(
  (c) => c.defaultVisible
).map((c) => c.id)

export type ItemsCustomPeriod = {
  from: string
  to: string
}

export type StoredItemsPeriod = {
  preset: ItemsPeriodPreset
  custom?: ItemsCustomPeriod
}

const VALID_COLUMN_IDS = new Set(ITEM_TABLE_COLUMNS.map((c) => c.id))

export function normalizeItemVisibleColumns(columns: ItemTableColumnId[]): ItemTableColumnId[] {
  const seen = new Set<ItemTableColumnId>()
  const result: ItemTableColumnId[] = []
  for (const id of columns) {
    if (!VALID_COLUMN_IDS.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  if (!result.includes("item_name")) result.unshift("item_name")
  if (!result.includes("actions")) {
    result.push("actions")
  } else {
    const withoutActions = result.filter((id) => id !== "actions")
    return [...withoutActions, "actions"]
  }
  return result
}

export function insertItemColumnBeforeActions(
  columns: ItemTableColumnId[],
  columnId: ItemTableColumnId
): ItemTableColumnId[] {
  const without = columns.filter((id) => id !== columnId)
  const actionsIndex = without.indexOf("actions")
  if (actionsIndex === -1) return normalizeItemVisibleColumns([...without, columnId, "actions"])
  return normalizeItemVisibleColumns([
    ...without.slice(0, actionsIndex),
    columnId,
    ...without.slice(actionsIndex),
  ])
}

export function getItemColumnLabel(id: ItemTableColumnId): string {
  return ITEM_TABLE_COLUMNS.find((c) => c.id === id)?.label ?? id
}

export function getItemTypeLabel(type: ItemType | null | undefined): string {
  if (!type) return "—"
  return ITEM_TYPE_LABELS_AR[type] ?? type
}
