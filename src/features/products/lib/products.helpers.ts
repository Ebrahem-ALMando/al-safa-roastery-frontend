import {
  formatLocalYmd,
  resolveOperationalDateRange,
} from "@/lib/date-scope/resolve-operational-date-range"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type { Product, ProductPriceStatus, ProductStockStatus } from "../types/product.types"
import type { ProductsCustomPeriod, ProductsPeriodPreset } from "./products.constants"
import {
  PRODUCT_PRICE_STATUS_LABELS_AR,
  PRODUCT_STOCK_STATUS_LABELS_AR,
  PRODUCTS_PERIOD_STORAGE_KEY,
} from "./products.constants"

export function parseNumericValue(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  const n = typeof value === "number" ? value : Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

export function formatQuantityKg(value: string | number | null | undefined): string {
  const n = parseNumericValue(value)
  return `${n.toFixed(3)} كغ`
}

export function formatProductPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "غير مسعّر"
  return `$${parseNumericValue(value).toFixed(2)}`
}

export function formatArDateTime(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getProductPriceStatusLabel(status: ProductPriceStatus | null | undefined): string {
  if (!status) return "بدون سعر"
  return PRODUCT_PRICE_STATUS_LABELS_AR[status] ?? status
}

export function getProductStockStatus(product: Product): ProductStockStatus {
  if (!product.linked_item && !product.ready_item && !product.ready_item_id) return "unlinked"
  if (product.stock_status) return product.stock_status
  const current = parseNumericValue(product.current_quantity_kg)
  const minimum = parseNumericValue(product.minimum_quantity_kg)
  if (current <= 0) return "out_of_stock"
  if (minimum > 0 && current <= minimum) return "reorder_required"
  return "available"
}

export function getProductStockStatusLabel(status: ProductStockStatus | null | undefined): string {
  if (!status) return PRODUCT_STOCK_STATUS_LABELS_AR.unlinked
  return PRODUCT_STOCK_STATUS_LABELS_AR[status] ?? status
}

export function getProductStockBadgeClass(status: ProductStockStatus): string {
  switch (status) {
    case "available":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "reorder_required":
    case "low":
      return "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300"
    case "out_of_stock":
      return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
    case "unlinked":
      return "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300"
  }
}

export function productDisplayName(product: Product): string {
  return product.name?.trim() || "—"
}

export function productInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}

export function linkedItemName(product: Product): string {
  return product.linked_item?.name || product.ready_item?.name || "غير مرتبط بصنف"
}

export function linkedItemCode(product: Product): string | null {
  return product.linked_item?.code || product.ready_item?.code || null
}

export function resolveProductsPeriodRange(
  preset: ProductsPeriodPreset,
  custom: ProductsCustomPeriod | null,
  now: Date = new Date()
): ResolvedOperationalDateRange | null {
  if (preset === "all") return null
  if (preset === "custom") {
    if (!custom?.from || !custom?.to) return null
    return { from: custom.from, to: custom.to }
  }
  return resolveOperationalDateRange(preset, now)
}

export function readStoredProductsPeriod(): {
  preset: ProductsPeriodPreset
  custom: ProductsCustomPeriod | null
} {
  if (typeof window === "undefined") {
    return { preset: "current_month", custom: null }
  }
  try {
    const raw = localStorage.getItem(PRODUCTS_PERIOD_STORAGE_KEY)
    if (!raw) return { preset: "current_month", custom: null }
    const parsed = JSON.parse(raw) as {
      preset?: ProductsPeriodPreset
      custom?: ProductsCustomPeriod
    }
    const validPresets: ProductsPeriodPreset[] = [
      "all",
      "today",
      "yesterday",
      "current_week",
      "current_month",
      "custom",
    ]
    const preset = parsed.preset ?? "current_month"
    return {
      preset: validPresets.includes(preset) ? preset : "current_month",
      custom: parsed.custom?.from && parsed.custom?.to ? parsed.custom : null,
    }
  } catch {
    return { preset: "current_month", custom: null }
  }
}

export function defaultCustomPeriod(): ProductsCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}
