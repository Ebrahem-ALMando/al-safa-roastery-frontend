import {
  formatLocalYmd,
  resolveOperationalDateRange,
} from "@/lib/date-scope/resolve-operational-date-range"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import type {
  PurchaseInvoice,
  PurchaseInvoiceStatus,
  PurchasePaymentMethod,
  PurchasePaymentStatus,
} from "../types/purchase.types"
import type { PurchasesCustomPeriod, PurchasesPeriodPreset } from "./purchases.constants"
import {
  PURCHASE_PAYMENT_METHOD_LABELS_AR,
  PURCHASE_PAYMENT_STATUS_LABELS_AR,
  PURCHASE_STATUS_LABELS_AR,
  PURCHASES_PERIOD_STORAGE_KEY,
} from "./purchases.constants"

export function parseNumericAmount(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0
  const n = typeof value === "number" ? value : Number.parseFloat(String(value))
  return Number.isFinite(n) ? n : 0
}

export function formatUsd(value: string | number | null | undefined): string {
  const n = parseNumericAmount(value)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatArDate(value: string | null | undefined): string {
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

export function getPurchaseStatusLabel(status: PurchaseInvoiceStatus | null | undefined): string {
  if (!status) return "—"
  return PURCHASE_STATUS_LABELS_AR[status] ?? status
}

export function getPurchasePaymentStatusLabel(
  status: PurchasePaymentStatus | null | undefined
): string {
  if (!status) return "—"
  return PURCHASE_PAYMENT_STATUS_LABELS_AR[status] ?? status
}

export function getPurchasePaymentMethodLabel(
  method: PurchasePaymentMethod | null | undefined
): string {
  if (!method) return "—"
  return PURCHASE_PAYMENT_METHOD_LABELS_AR[method] ?? method
}

export function formatLinesCountAr(count: number | null | undefined): string {
  if (count == null || !Number.isFinite(count)) return "—"
  if (count === 0) return "لا بنود"
  if (count === 1) return "بند واحد"
  if (count === 2) return "بندان"
  if (count >= 3 && count <= 10) return `${count} بنود`
  return `${count} بنداً`
}

export function getPurchaseStatusBadgeClass(status: PurchaseInvoiceStatus): string {
  switch (status) {
    case "draft":
      return "border-slate-500/50 bg-slate-500/10 text-slate-700 dark:text-slate-300"
    case "completed":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "cancelled":
      return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
  }
}

export function getPurchasePaymentStatusBadgeClass(status: PurchasePaymentStatus): string {
  switch (status) {
    case "unpaid":
      return "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
    case "partial":
      return "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300"
    case "paid":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
}

export function purchaseSupplierName(purchase: PurchaseInvoice): string {
  return purchase.supplier?.name?.trim() || "—"
}

export function resolvePurchasesPeriodRange(
  preset: PurchasesPeriodPreset,
  custom: PurchasesCustomPeriod | null,
  now: Date = new Date()
): ResolvedOperationalDateRange | null {
  if (preset === "all") return null
  if (preset === "custom") {
    if (!custom?.from || !custom?.to) return null
    return { from: custom.from, to: custom.to }
  }
  return resolveOperationalDateRange(preset, now)
}

export function readStoredPurchasesPeriod(): {
  preset: PurchasesPeriodPreset
  custom: PurchasesCustomPeriod | null
} {
  if (typeof window === "undefined") {
    return { preset: "current_month", custom: null }
  }
  try {
    const raw = localStorage.getItem(PURCHASES_PERIOD_STORAGE_KEY)
    if (!raw) return { preset: "current_month", custom: null }
    const parsed = JSON.parse(raw) as {
      preset?: PurchasesPeriodPreset
      custom?: PurchasesCustomPeriod
    }
    const preset = parsed.preset ?? "current_month"
    const validPresets: PurchasesPeriodPreset[] = [
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

export function defaultCustomPeriod(): PurchasesCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}
