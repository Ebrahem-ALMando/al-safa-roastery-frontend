import type {
  OperationalDateScopePreset,
} from "./operational-date-scope.types"

export const OPERATIONAL_SCOPE_PRESET_LABELS_AR = {
  all: "الكل",
  today: "اليوم الحالي",
  yesterday: "اليوم السابق",
  current_week: "الأسبوع الحالي",
  current_month: "الشهر الحالي",
} as const satisfies Record<OperationalDateScopePreset, string>

/** خيارات القائمة المنسدلة (بدون «الكل»). */
export const OPERATIONAL_SCOPE_DROPDOWN_PRESETS = [
  "today",
  "yesterday",
  "current_week",
  "current_month",
] as const satisfies readonly Exclude<OperationalDateScopePreset, "all">[]
