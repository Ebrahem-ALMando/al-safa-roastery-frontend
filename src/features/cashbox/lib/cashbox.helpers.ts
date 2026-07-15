import { formatLocalYmd, resolveOperationalDateRange } from "@/lib/date-scope/resolve-operational-date-range"
import {
  CASHBOX_PERIOD_STORAGE_KEY,
  type CashboxCustomPeriod,
  type CashboxPeriodPreset,
} from "./cashbox.constants"

export function cashboxNumber(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? 0))
  return Number.isFinite(parsed) ? parsed : 0
}

export const formatCashboxMoney = (value: unknown) => `$ ${cashboxNumber(value).toFixed(2)}`

export function formatCashboxDate(value: string | null | undefined, withTime = false): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date)
}

export function resolveCashboxPeriod(preset: CashboxPeriodPreset, custom: CashboxCustomPeriod | null) {
  if (preset === "all") return null
  if (preset === "custom") return custom?.from && custom?.to ? custom : null
  return resolveOperationalDateRange(preset)
}

export function defaultCashboxPeriod(): CashboxCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}

export function readCashboxPeriod(): { preset: CashboxPeriodPreset; custom: CashboxCustomPeriod | null } {
  if (typeof window === "undefined") return { preset: "current_month", custom: null }
  try {
    const raw = localStorage.getItem(CASHBOX_PERIOD_STORAGE_KEY)
    if (!raw) return { preset: "current_month", custom: null }
    const parsed = JSON.parse(raw)
    return { preset: parsed.preset ?? "current_month", custom: parsed.custom ?? null }
  } catch {
    return { preset: "current_month", custom: null }
  }
}

export function cashboxSourceDetailsHref(type: string | null, id: number | null): string | null {
  if (!type || !id) return null
  if (type === "purchase_invoice" || type === "purchase_invoice_cancellation") {
    return `/dashboard/purchases/${id}`
  }
  return null
}
