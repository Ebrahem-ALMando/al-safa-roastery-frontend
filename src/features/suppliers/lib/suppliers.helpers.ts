import {
  formatLocalYmd,
  resolveOperationalDateRange,
} from "@/lib/date-scope/resolve-operational-date-range"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { ReportCard, Supplier } from "../types/supplier.types"
import type { SuppliersCustomPeriod, SuppliersPeriodPreset } from "./suppliers.constants"

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

/** User-facing balance amount without negative sign. */
export function formatBalanceAmount(value: string | number | null | undefined): string {
  return formatUsdAmount(Math.abs(parseNumericBalance(value)))
}

export function formatOpeningBalanceSummary(value: string | number | null | undefined): string {
  const info = getBalanceStatusLabel(value)
  return `${formatBalanceAmount(value)} — ${info.label}`
}

export type BalanceStatusLabel = "payable" | "credit" | "settled"

export function getBalanceStatusLabel(balance: string | number | null | undefined): {
  key: BalanceStatusLabel
  label: string
} {
  const n = parseNumericBalance(balance)
  if (n > 0) return { key: "payable", label: " رصيد دائن للمورد" }
  if (n < 0) return { key: "credit", label: "رصيد دائن لنا" }
  return { key: "settled", label: "متوازن" }
}

export function getBalanceBadgeClass(key: BalanceStatusLabel): string {
  switch (key) {
    case "payable":
      return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
    case "credit":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "settled":
      return "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300"
  }
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

/** Short numeric date for table cells, e.g. 21/06/2026 */
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
  purchase_invoice: "فاتورة شراء",
  supplier_payment: "دفعة مورد",
  supplier_return: "مرتجع مورد",
}

export function formatSupplierLastActivity(supplier: Supplier): {
  primary: string
  secondary: string | null
} {
  const activity = supplier.last_activity
  if (!activity) {
    return { primary: "لا توجد حركة بعد", secondary: null }
  }
  const typeName = LAST_ACTIVITY_TYPE_LABELS[activity.type] ?? activity.type
  return {
    primary: `${typeName} · ${activity.number}`,
    secondary: formatArShortDate(activity.date),
  }
}

export function findReportCardValue(
  cards: ReportCard[] | undefined,
  key: string
): string | number | null {
  const card = cards?.find((c) => c.key === key)
  if (!card) return null
  return card.value
}

export function resolveSuppliersPeriodRange(
  preset: SuppliersPeriodPreset,
  custom: SuppliersCustomPeriod | null,
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

export function supplierDisplayName(supplier: Supplier): string {
  return supplier.name?.trim() || "—"
}

export function supplierInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}

export function readStoredSuppliersPeriod(): {
  preset: SuppliersPeriodPreset
  custom: SuppliersCustomPeriod | null
} {
  if (typeof window === "undefined") {
    return { preset: "current_month", custom: null }
  }
  try {
    const raw = localStorage.getItem("al-safa:suppliers-period-scope")
    if (!raw) return { preset: "current_month", custom: null }
    const parsed = JSON.parse(raw) as {
      preset?: SuppliersPeriodPreset
      custom?: SuppliersCustomPeriod
    }
    const preset = parsed.preset ?? "current_month"
    const validPresets: SuppliersPeriodPreset[] = [
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

export function defaultCustomPeriod(): SuppliersCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}
