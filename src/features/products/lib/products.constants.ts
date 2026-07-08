import type { ProductPriceStatus, ProductStockStatus } from "../types/product.types"

export const PRODUCTS_TABLE_COLUMNS_STORAGE_KEY = "al-safa:products-table-columns"
export const PRODUCTS_PAGE_CONFIG_KEY = "al-safa:products-page-config"
export const PRODUCTS_PERIOD_STORAGE_KEY = "al-safa:products-period"

export type ProductsViewMode = "table" | "cards"

export type ProductsPeriodPreset =
  | "all"
  | "today"
  | "yesterday"
  | "current_week"
  | "current_month"
  | "custom"

export const PRODUCTS_PERIOD_LABELS_AR: Record<ProductsPeriodPreset, string> = {
  all: "الكل",
  today: "اليوم الحالي",
  yesterday: "الأمس",
  current_week: "هذا الأسبوع",
  current_month: "هذا الشهر",
  custom: "مخصص",
}

export const PRODUCTS_PERIOD_DROPDOWN_PRESETS = [
  "today",
  "yesterday",
  "current_week",
  "current_month",
  "custom",
] as const satisfies readonly Exclude<ProductsPeriodPreset, "all">[]

export const PRODUCT_PRICE_STATUS_LABELS_AR: Record<ProductPriceStatus, string> = {
  priced: "مسعّر",
  unpriced: "بدون سعر",
}

export const PRODUCT_STOCK_STATUS_LABELS_AR: Record<ProductStockStatus, string> = {
  available: "متوفر",
  reorder_required: "يحتاج إعادة طلب",
  low: "منخفض",
  out_of_stock: "نافد",
  unlinked: "غير مرتبط",
}

export type ProductTableColumnId =
  | "row_number"
  | "product"
  | "linked_item"
  | "price"
  | "price_status"
  | "available_stock"
  | "stock_status"
  | "is_active"
  | "actions"
  | "code"
  | "barcode"
  | "sku"
  | "notes"
  | "created_at"
  | "updated_at"
  | "created_by"
  | "updated_by"

export const PRODUCT_TABLE_COLUMNS: {
  id: ProductTableColumnId
  label: string
  defaultVisible: boolean
  essential?: boolean
}[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "product", label: "المنتج", defaultVisible: true, essential: true },
  { id: "linked_item", label: "الصنف المرتبط", defaultVisible: true },
  { id: "price", label: "السعر", defaultVisible: true },
  { id: "price_status", label: "حالة التسعير", defaultVisible: true },
  { id: "available_stock", label: "المخزون المتاح", defaultVisible: true },
  { id: "stock_status", label: "حالة المخزون", defaultVisible: true },
  { id: "is_active", label: "الحالة", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "code", label: "الكود", defaultVisible: false },
  { id: "barcode", label: "الباركود", defaultVisible: false },
  { id: "sku", label: "SKU", defaultVisible: false },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: false },
  { id: "updated_at", label: "تاريخ التحديث", defaultVisible: false },
  { id: "created_by", label: "أنشئ بواسطة", defaultVisible: false },
  { id: "updated_by", label: "حُدّث بواسطة", defaultVisible: false },
]

export const DEFAULT_VISIBLE_PRODUCT_COLUMNS: ProductTableColumnId[] = PRODUCT_TABLE_COLUMNS.filter(
  (column) => column.defaultVisible
).map((column) => column.id)

export type ProductsCustomPeriod = {
  from: string
  to: string
}

export type StoredProductsPeriod = {
  preset: ProductsPeriodPreset
  custom?: ProductsCustomPeriod
}

const VALID_COLUMN_IDS = new Set(PRODUCT_TABLE_COLUMNS.map((column) => column.id))

export function normalizeProductVisibleColumns(
  columns: ProductTableColumnId[]
): ProductTableColumnId[] {
  const seen = new Set<ProductTableColumnId>()
  const result: ProductTableColumnId[] = []

  for (const id of columns) {
    if (!VALID_COLUMN_IDS.has(id) || seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  if (!result.includes("product")) result.unshift("product")
  if (!result.includes("actions")) {
    result.push("actions")
  } else {
    const withoutActions = result.filter((id) => id !== "actions")
    return [...withoutActions, "actions"]
  }

  return result
}

export function insertProductColumnBeforeActions(
  columns: ProductTableColumnId[],
  columnId: ProductTableColumnId
): ProductTableColumnId[] {
  const without = columns.filter((id) => id !== columnId)
  const actionsIndex = without.indexOf("actions")
  if (actionsIndex === -1) return normalizeProductVisibleColumns([...without, columnId, "actions"])
  return normalizeProductVisibleColumns([
    ...without.slice(0, actionsIndex),
    columnId,
    ...without.slice(actionsIndex),
  ])
}

export function getProductColumnLabel(id: ProductTableColumnId): string {
  return PRODUCT_TABLE_COLUMNS.find((column) => column.id === id)?.label ?? id
}
