import {
  formatLocalYmd,
  resolveOperationalDateRange,
} from "@/lib/date-scope/resolve-operational-date-range"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { Item, StockStatus } from "../types/item.types"
import type { ItemsCustomPeriod, ItemsPeriodPreset } from "./items.constants"
import { ITEMS_PERIOD_STORAGE_KEY, STOCK_STATUS_LABELS_AR } from "./items.constants"

export function parseNumericQuantity(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  const n = typeof value === "number" ? value : Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

export function formatQuantityKg(value: string | number | null | undefined): string {
  const n = parseNumericQuantity(value)
  return `${n.toFixed(3)} كغ`
}

export function formatCostPerKg(value: string | number | null | undefined): string {
  const n = parseNumericQuantity(value)
  return `${n.toFixed(2)} USD / كغ`
}

export function getItemStockStatus(item: Pick<Item, "current_quantity_kg" | "minimum_quantity_kg">): StockStatus {
  const qty = parseNumericQuantity(item.current_quantity_kg)
  const minQty = parseNumericQuantity(item.minimum_quantity_kg)

  if (qty <= 0) return "out_of_stock"
  if (minQty > 0 && qty <= minQty) return "low"
  return "available"
}

export function getStockStatusLabel(status: StockStatus): string {
  return STOCK_STATUS_LABELS_AR[status]
}

export function getStockBadgeClass(status: StockStatus): string {
  switch (status) {
    case "available":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "low":
      return "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300"
    case "out_of_stock":
      return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
  }
}

export function resolveQuantityRangeQuery(
  min: string,
  max: string
): { quantity_min?: number; quantity_max?: number } {
  const hasMin = min.trim() !== ""
  const hasMax = max.trim() !== ""
  if (!hasMin && !hasMax) return {}

  const minVal = hasMin ? Number.parseFloat(min) : undefined
  const maxVal = hasMax ? Number.parseFloat(max) : undefined
  if (hasMin && !Number.isFinite(minVal)) return {}
  if (hasMax && !Number.isFinite(maxVal)) return {}

  const result: { quantity_min?: number; quantity_max?: number } = {}
  if (hasMin && minVal != null) result.quantity_min = minVal
  if (hasMax && maxVal != null) result.quantity_max = maxVal

  if (result.quantity_min != null && result.quantity_max != null) {
    const low = Math.min(result.quantity_min, result.quantity_max)
    const high = Math.max(result.quantity_min, result.quantity_max)
    result.quantity_min = low
    result.quantity_max = high
  }

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

export function formatItemLastActivity(item: Item): {
  primary: string
  secondary: string | null
} {
  const activity = item.last_activity
  if (!activity) {
    return { primary: "لا توجد حركة بعد", secondary: null }
  }
  const typeName = activity.label || activity.type
  const numberPart = activity.number ? ` · ${activity.number}` : ""
  return {
    primary: `${typeName}${numberPart}`,
    secondary: formatArShortDate(activity.date),
  }
}

export function resolveItemsPeriodRange(
  preset: ItemsPeriodPreset,
  custom: ItemsCustomPeriod | null,
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

export function itemDisplayName(item: Item): string {
  return item.name?.trim() || "—"
}

export function itemInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}

export function readStoredItemsPeriod(): {
  preset: ItemsPeriodPreset
  custom: ItemsCustomPeriod | null
} {
  if (typeof window === "undefined") {
    return { preset: "current_month", custom: null }
  }
  try {
    const raw = localStorage.getItem(ITEMS_PERIOD_STORAGE_KEY)
    if (!raw) return { preset: "current_month", custom: null }
    const parsed = JSON.parse(raw) as {
      preset?: ItemsPeriodPreset
      custom?: ItemsCustomPeriod
    }
    const preset = parsed.preset ?? "current_month"
    const validPresets: ItemsPeriodPreset[] = [
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

export function defaultCustomPeriod(): ItemsCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}
