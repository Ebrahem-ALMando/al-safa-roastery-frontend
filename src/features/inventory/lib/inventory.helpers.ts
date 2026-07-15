import { formatLocalYmd, resolveOperationalDateRange } from "@/lib/date-scope/resolve-operational-date-range"
import { INVENTORY_PERIOD_STORAGE_KEY, INVENTORY_STOCK_STATUS_LABELS_AR, type InventoryCustomPeriod, type InventoryPeriodPreset } from "./inventory.constants"

export function inventoryNumber(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? 0)); return Number.isFinite(parsed) ? parsed : 0
}
export const formatInventoryQuantity = (value: unknown) => `${inventoryNumber(value).toFixed(3)} كغ`
export const formatInventoryCost = (value: unknown) => `$ ${inventoryNumber(value).toFixed(4)} / كغ`
export const formatInventoryMoney = (value: unknown) => `$ ${inventoryNumber(value).toFixed(2)}`
export function formatInventoryDate(value: string | null | undefined, withTime = false): string {
  if (!value) return "—"; const date = new Date(value); if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(date)
}
export function stockStatusLabel(status: keyof typeof INVENTORY_STOCK_STATUS_LABELS_AR) { return INVENTORY_STOCK_STATUS_LABELS_AR[status] }
export function resolveInventoryPeriod(preset: InventoryPeriodPreset, custom: InventoryCustomPeriod | null) {
  if (preset === "all") return null
  if (preset === "custom") return custom?.from && custom?.to ? custom : null
  return resolveOperationalDateRange(preset)
}
export function defaultInventoryPeriod(): InventoryCustomPeriod { const today = formatLocalYmd(new Date()); return { from: today, to: today } }
export function readInventoryPeriod(): { preset: InventoryPeriodPreset; custom: InventoryCustomPeriod | null } {
  if (typeof window === "undefined") return { preset: "current_month", custom: null }
  try { const raw = localStorage.getItem(INVENTORY_PERIOD_STORAGE_KEY); if (!raw) return { preset: "current_month", custom: null }; const parsed = JSON.parse(raw); return { preset: parsed.preset ?? "current_month", custom: parsed.custom ?? null } } catch { return { preset: "current_month", custom: null } }
}
export function sourceDetailsHref(type: string | null, id: number | null): string | null {
  if (!type || !id) return null
  if (type === "purchase_invoice_line") return null
  if (type === "sales_invoice_line") return null
  return null
}
