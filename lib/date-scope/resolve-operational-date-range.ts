import type { OperationalDateScopePreset, ResolvedOperationalDateRange } from "./operational-date-scope.types"

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/** تاريخ محلي YYYY-MM-DD */
export function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function startOfDayLocal(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** أسبوع يبدأ الاثنين وينتهي الأحد (تقويم محلي). */
function startOfIsoWeekMonday(d: Date): Date {
  const x = startOfDayLocal(d)
  const day = x.getDay() // 0 = أحد
  const offset = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + offset)
  return x
}

function endOfIsoWeekSunday(d: Date): Date {
  const start = startOfIsoWeekMonday(d)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

function startOfMonthLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonthLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/**
 * يحوّل الإعداد المختار إلى نطاق تاريخين شاملين (محلي).
 * `all` → لا قيود (null).
 */
export function resolveOperationalDateRange(
  preset: OperationalDateScopePreset,
  now: Date = new Date()
): ResolvedOperationalDateRange | null {
  if (preset === "all") return null

  const n = startOfDayLocal(now)

  if (preset === "today") {
    const y = formatLocalYmd(n)
    return { from: y, to: y }
  }

  if (preset === "yesterday") {
    const y = new Date(n)
    y.setDate(y.getDate() - 1)
    const s = formatLocalYmd(y)
    return { from: s, to: s }
  }

  if (preset === "current_week") {
    const a = startOfIsoWeekMonday(n)
    const b = endOfIsoWeekSunday(n)
    return { from: formatLocalYmd(a), to: formatLocalYmd(b) }
  }

  if (preset === "current_month") {
    const a = startOfMonthLocal(n)
    const b = endOfMonthLocal(n)
    return { from: formatLocalYmd(a), to: formatLocalYmd(b) }
  }

  return null
}

export function isOperationalDateScopePreset(v: string): v is OperationalDateScopePreset {
  return (
    v === "all" ||
    v === "today" ||
    v === "yesterday" ||
    v === "current_week" ||
    v === "current_month"
  )
}
