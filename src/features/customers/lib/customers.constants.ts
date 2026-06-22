import type { CustomerType } from "../types/customer.types"

export const CUSTOMERS_TABLE_COLUMNS_STORAGE_KEY = "al-safa:customers-table-columns"

export const CUSTOMERS_PAGE_CONFIG_KEY = "al-safa:customers-page-config"

export const CUSTOMERS_PERIOD_STORAGE_KEY = "al-safa:customers-period"

export type CustomersViewMode = "table" | "cards"

export type CustomersPeriodPreset =
  | "all"
  | "today"
  | "yesterday"
  | "current_week"
  | "current_month"
  | "custom"

export const CUSTOMERS_PERIOD_LABELS_AR: Record<CustomersPeriodPreset, string> = {
  all: "الكل",
  today: "اليوم الحالي",
  yesterday: "الأمس",
  current_week: "هذا الأسبوع",
  current_month: "هذا الشهر",
  custom: "مخصص",
}

export const CUSTOMERS_PERIOD_DROPDOWN_PRESETS = [
  "today",
  "yesterday",
  "current_week",
  "current_month",
  "custom",
] as const satisfies readonly Exclude<CustomersPeriodPreset, "all">[]

export const CUSTOMER_TYPE_LABELS_AR: Record<CustomerType, string> = {
  retail: "مفرق",
  wholesale: "جملة",
  car: "سيارة",
}

export type CustomerTableColumnId =
  | "row_number"
  | "customer_name"
  | "contact_phone"
  | "customer_type"
  | "code"
  | "car_number"
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

export const CUSTOMER_TABLE_COLUMNS: {
  id: CustomerTableColumnId
  label: string
  defaultVisible: boolean
  essential?: boolean
}[] = [
  { id: "row_number", label: "#", defaultVisible: true },
  { id: "customer_name", label: "اسم الزبون / المسؤول", defaultVisible: true, essential: true },
  { id: "contact_phone", label: "معلومات التواصل", defaultVisible: true },
  { id: "customer_type", label: "نوع الزبون", defaultVisible: true },
  { id: "current_balance", label: "الرصيد الحالي", defaultVisible: true },
  { id: "status", label: "الحالة", defaultVisible: true },
  { id: "last_activity", label: "آخر نشاط", defaultVisible: true },
  { id: "actions", label: "الإجراءات", defaultVisible: true, essential: true },
  { id: "code", label: "الكود", defaultVisible: false },
  { id: "car_number", label: "رقم السيارة", defaultVisible: false },
  { id: "opening_balance", label: "الرصيد الافتتاحي", defaultVisible: false },
  { id: "whatsapp", label: "واتساب", defaultVisible: false },
  { id: "email", label: "البريد الإلكتروني", defaultVisible: false },
  { id: "address", label: "العنوان", defaultVisible: false },
  { id: "credit_limit", label: "الحد الائتماني", defaultVisible: false },
  { id: "notes", label: "ملاحظات", defaultVisible: false },
  { id: "created_at", label: "تاريخ الإنشاء", defaultVisible: false },
  { id: "updated_at", label: "تاريخ التحديث", defaultVisible: false },
]

export const DEFAULT_VISIBLE_CUSTOMER_COLUMNS: CustomerTableColumnId[] =
  CUSTOMER_TABLE_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id)

export type CustomersCustomPeriod = {
  from: string
  to: string
}

export type StoredCustomersPeriod = {
  preset: CustomersPeriodPreset
  custom?: CustomersCustomPeriod
}

const VALID_COLUMN_IDS = new Set(CUSTOMER_TABLE_COLUMNS.map((c) => c.id))

export function normalizeCustomerVisibleColumns(
  columns: CustomerTableColumnId[]
): CustomerTableColumnId[] {
  const migrated = columns.map((id) => {
    if (id === ("name" as string)) return "customer_name" as CustomerTableColumnId
    if (id === ("contact" as string)) return "contact_phone" as CustomerTableColumnId
    return id
  })

  const seen = new Set<CustomerTableColumnId>()
  const result: CustomerTableColumnId[] = []
  for (const id of migrated) {
    if (!VALID_COLUMN_IDS.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  if (!result.includes("customer_name")) result.unshift("customer_name")
  if (!result.includes("actions")) {
    result.push("actions")
  } else {
    const withoutActions = result.filter((id) => id !== "actions")
    return [...withoutActions, "actions"]
  }
  return result
}

export function insertCustomerColumnBeforeActions(
  columns: CustomerTableColumnId[],
  columnId: CustomerTableColumnId
): CustomerTableColumnId[] {
  const without = columns.filter((id) => id !== columnId)
  const actionsIndex = without.indexOf("actions")
  if (actionsIndex === -1) return normalizeCustomerVisibleColumns([...without, columnId, "actions"])
  return normalizeCustomerVisibleColumns([
    ...without.slice(0, actionsIndex),
    columnId,
    ...without.slice(actionsIndex),
  ])
}

export function getCustomerColumnLabel(id: CustomerTableColumnId): string {
  return CUSTOMER_TABLE_COLUMNS.find((c) => c.id === id)?.label ?? id
}

export function getCustomerTypeLabel(type: CustomerType | null | undefined): string {
  if (!type) return "—"
  return CUSTOMER_TYPE_LABELS_AR[type] ?? type
}
