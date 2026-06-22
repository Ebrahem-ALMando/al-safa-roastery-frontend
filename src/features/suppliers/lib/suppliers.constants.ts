export const SUPPLIERS_TABLE_COLUMNS_STORAGE_KEY = "al-safa:suppliers-table-columns"

export const SUPPLIERS_PAGE_CONFIG_KEY = "suppliers-page-config"

export const SUPPLIERS_PERIOD_STORAGE_KEY = "al-safa:suppliers-period-scope"

export type SuppliersViewMode = "table" | "cards"

export type SuppliersPeriodPreset =
  | "all"
  | "today"
  | "yesterday"
  | "current_week"
  | "current_month"
  | "custom"

export const SUPPLIERS_PERIOD_LABELS_AR: Record<SuppliersPeriodPreset, string> = {
  all: "الكل",
  today: "اليوم الحالي",
  yesterday: "الأمس",
  current_week: "هذا الأسبوع",
  current_month: "هذا الشهر",
  custom: "مخصص",
}

export const SUPPLIERS_PERIOD_DROPDOWN_PRESETS = [
  "today",
  "yesterday",
  "current_week",
  "current_month",
  "custom",
] as const satisfies readonly Exclude<SuppliersPeriodPreset, "all">[]

export type SupplierTableColumnId =
  | "row_number"
  | "supplier_name"
  | "contact_phone"
  | "code"
  | "current_balance"
  | "opening_balance"
  | "status"
  | "last_activity"
  | "created_at"
  | "actions"
  | "whatsapp"
  | "email"
  | "address"
  | "credit_limit"
  | "notes"
  | "updated_at"

export const SUPPLIER_TABLE_COLUMNS: {
  id: SupplierTableColumnId
  label: string
  defaultVisible: boolean
  essential?: boolean
}[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "supplier_name", label: "اسم المورد / المسؤول", defaultVisible: true, essential: true },
  { id: "contact_phone", label: "معلومات التواصل", defaultVisible: true },
  { id: "current_balance", label: "الرصيد الحالي", defaultVisible: true },
  { id: "status", label: "الحالة", defaultVisible: true },
  { id: "last_activity", label: "آخر نشاط", defaultVisible: true },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "code", label: "الكود", defaultVisible: false },
  { id: "opening_balance", label: "الرصيد الافتتاحي", defaultVisible: false },
  { id: "whatsapp", label: "واتساب", defaultVisible: false },
  { id: "email", label: "البريد الإلكتروني", defaultVisible: false },
  { id: "address", label: "العنوان", defaultVisible: false },
  { id: "credit_limit", label: "الحد الائتماني", defaultVisible: false },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "updated_at", label: "تاريخ التحديث", defaultVisible: false },
]

export const DEFAULT_VISIBLE_SUPPLIER_COLUMNS: SupplierTableColumnId[] =
  SUPPLIER_TABLE_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id)

export type SuppliersCustomPeriod = {
  from: string
  to: string
}

export type StoredSuppliersPeriod = {
  preset: SuppliersPeriodPreset
  custom?: SuppliersCustomPeriod
}

const VALID_COLUMN_IDS = new Set(SUPPLIER_TABLE_COLUMNS.map((c) => c.id))

/** Migrate legacy column ids and enforce actions last. */
export function normalizeSupplierVisibleColumns(
  columns: SupplierTableColumnId[]
): SupplierTableColumnId[] {
  const migrated = columns.map((id) => {
    if (id === ("name" as string)) return "supplier_name" as SupplierTableColumnId
    if (id === ("contact" as string)) return "contact_phone" as SupplierTableColumnId
    return id
  })

  const seen = new Set<SupplierTableColumnId>()
  const result: SupplierTableColumnId[] = []
  for (const id of migrated) {
    if (!VALID_COLUMN_IDS.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  if (!result.includes("supplier_name")) result.unshift("supplier_name")
  if (!result.includes("actions")) {
    result.push("actions")
  } else {
    const withoutActions = result.filter((id) => id !== "actions")
    return [...withoutActions, "actions"]
  }
  return result
}

/** Insert a newly enabled column immediately before actions. */
export function insertSupplierColumnBeforeActions(
  columns: SupplierTableColumnId[],
  columnId: SupplierTableColumnId
): SupplierTableColumnId[] {
  const without = columns.filter((id) => id !== columnId)
  const actionsIndex = without.indexOf("actions")
  if (actionsIndex === -1) return normalizeSupplierVisibleColumns([...without, columnId, "actions"])
  return normalizeSupplierVisibleColumns([
    ...without.slice(0, actionsIndex),
    columnId,
    ...without.slice(actionsIndex),
  ])
}

export function getSupplierColumnLabel(id: SupplierTableColumnId): string {
  return SUPPLIER_TABLE_COLUMNS.find((c) => c.id === id)?.label ?? id
}
