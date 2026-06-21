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
  | "code"
  | "name"
  | "contact"
  | "current_balance"
  | "status"
  | "last_activity"
  | "actions"
  | "email"
  | "address"
  | "credit_limit"
  | "notes"
  | "created_at"
  | "updated_at"

export const SUPPLIER_TABLE_COLUMNS: {
  id: SupplierTableColumnId
  label: string
  defaultVisible: boolean
  essential?: boolean
}[] = [
  { id: "code", label: "الكود", defaultVisible: true },
  { id: "name", label: "اسم المورد", defaultVisible: true, essential: true },
  { id: "contact", label: "الهاتف / الشخص المسؤول", defaultVisible: true },
  { id: "current_balance", label: "الرصيد الحالي", defaultVisible: true },
  { id: "status", label: "الحالة", defaultVisible: true },
  { id: "last_activity", label: "آخر تحديث", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "email", label: "البريد الإلكتروني", defaultVisible: false },
  { id: "address", label: "العنوان", defaultVisible: false },
  { id: "credit_limit", label: "الحد الائتماني", defaultVisible: false },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: false },
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
