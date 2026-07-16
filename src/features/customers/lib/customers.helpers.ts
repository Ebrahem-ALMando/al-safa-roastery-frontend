import {
  formatLocalYmd,
  resolveOperationalDateRange,
} from "@/lib/date-scope/resolve-operational-date-range"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { Customer, BalanceRangeDirection } from "../types/customer.types"
import type { CustomersCustomPeriod, CustomersPeriodPreset } from "./customers.constants"

export function parseNumericBalance(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  const n = typeof value === "number" ? value : Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

export function formatUsdAmount(value: string | number | null | undefined): string {
  const n = parseNumericBalance(value)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatBalanceAmount(value: string | number | null | undefined): string {
  return formatUsdAmount(Math.abs(parseNumericBalance(value)))
}

export function formatOpeningBalanceSummary(value: string | number | null | undefined): string {
  const info = getBalanceStatusLabel(value)
  return `${formatBalanceAmount(value)} — ${info.label}`
}

export type BalanceStatusLabel = "receivable" | "credit" | "settled"

export function getBalanceStatusLabel(balance: string | number | null | undefined): {
  key: BalanceStatusLabel
  label: string
} {
  const n = parseNumericBalance(balance)
  if (n > 0) return { key: "receivable", label: "عليه لنا" }
  if (n < 0) return { key: "credit", label: "له عندنا" }
  return { key: "settled", label: "متوازن" }
}

export function getBalanceBadgeClass(key: BalanceStatusLabel): string {
  switch (key) {
    case "receivable":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "credit":
      return "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300"
    case "settled":
      return "border-slate-300 bg-slate-100/70 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
  }
}

/** Maps user-facing amount range + direction to signed balance_min/max for the API. */
export function resolveBalanceRangeQuery(
  min: string,
  max: string,
  direction: BalanceRangeDirection | null
): { balance_min?: number; balance_max?: number } {
  const hasMin = min.trim() !== ""
  const hasMax = max.trim() !== ""
  if (!hasMin && !hasMax) return {}
  if (!direction) return {}

  const minVal = hasMin ? Number.parseFloat(min) : 0
  const maxVal = hasMax ? Number.parseFloat(max) : minVal
  if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) return {}

  const low = Math.min(minVal, maxVal)
  const high = Math.max(minVal, maxVal)

  if (direction === "receivable") {
    const result: { balance_min?: number; balance_max?: number } = {}
    if (hasMin) result.balance_min = low
    if (hasMax) result.balance_max = high
    if (hasMin && !hasMax) result.balance_max = high
    if (!hasMin && hasMax) result.balance_min = low
    return result
  }

  const result: { balance_min?: number; balance_max?: number } = {}
  if (hasMax || hasMin) result.balance_min = -high
  if (hasMin) result.balance_max = -low
  else if (hasMax) result.balance_max = 0
  return result
}

export function formatArDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatArShortDate(value: string | null | undefined): string {
  if (!value) return "—"
  const normalized = value.length === 10 ? `${value}T00:00:00` : value
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

const LAST_ACTIVITY_TYPE_LABELS: Record<string, string> = {
  sales_invoice: "فاتورة مبيعات",
  customer_payment: "دفعة زبون",
  customer_return: "مرتجع زبون",
}

export function formatCustomerLastActivity(customer: Customer): {
  primary: string
  secondary: string | null
} {
  const activity = customer.last_activity
  if (!activity) {
    return { primary: "لا توجد حركة بعد", secondary: null }
  }
  const typeName = LAST_ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type
  return {
    primary: `${typeName} · ${activity.number}`,
    secondary: formatArShortDate(activity.date),
  }
}

export function resolveCustomersPeriodRange(
  preset: CustomersPeriodPreset,
  custom: CustomersCustomPeriod | null,
  now: Date = new Date()
): ResolvedOperationalDateRange | null {
  if (preset === "all") return null
  if (preset === "custom") {
    if (!custom?.from || !custom?.to) return null
    return { from: custom.from, to: custom.to }
  }
  return resolveOperationalDateRange(preset, now)
}

export function isValidCustomPeriod(from: string, to: string): boolean {
  if (!from || !to) return false
  return from <= to
}

export function customerDisplayName(customer: Customer): string {
  return customer.name?.trim() || "—"
}

export function customerInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}

export function readStoredCustomersPeriod(): {
  preset: CustomersPeriodPreset
  custom: CustomersCustomPeriod | null
} {
  if (typeof window === "undefined") {
    return { preset: "current_month", custom: null }
  }
  try {
    const raw = localStorage.getItem("al-safa:customers-period")
    if (!raw) return { preset: "current_month", custom: null }
    const parsed = JSON.parse(raw) as {
      preset?: CustomersPeriodPreset
      custom?: CustomersCustomPeriod
    }
    const preset = parsed.preset ?? "current_month"
    const validPresets: CustomersPeriodPreset[] = [
      "all",
      "today",
      "yesterday",
      "current_week",
      "current_month",
      "custom",
    ]
    return {
      preset: validPresets.includes(preset) ? preset : "current_month",
      custom: parsed.custom?.from && parsed.custom?.to ? parsed.custom : null,
    }
  } catch {
    return { preset: "current_month", custom: null }
  }
}

export function defaultCustomPeriod(): CustomersCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}
