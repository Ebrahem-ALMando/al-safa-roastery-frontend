import { formatLocalYmd, resolveOperationalDateRange } from "@/lib/date-scope/resolve-operational-date-range"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { PRODUCTION_PERIOD_STORAGE_KEY, PRODUCTION_STATUS_LABELS_AR, type ProductionCustomPeriod, type ProductionPeriodPreset } from "./production.constants"
import type { ProductionBatch, ProductionStatus } from "../types/production.types"

export function productionNumber(value: string | number | null | undefined): number {
  const parsed = Number.parseFloat(String(value ?? 0))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatProductionQuantity(value: string | number | null | undefined): string {
  return `${productionNumber(value).toFixed(3)} كغ`
}

export function formatProductionMoney(value: string | number | null | undefined): string {
  return `$${productionNumber(value).toFixed(2)}`
}

export function formatProductionCost(value: string | number | null | undefined): string {
  return `$${productionNumber(value).toFixed(4)} / كغ`
}

export function formatProductionDate(value: string | null | undefined, withTime = false): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ar-SY", withTime
    ? { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    : { year: "numeric", month: "short", day: "numeric" }).format(date)
}

export function getProductionStatusLabel(status: ProductionStatus): string {
  return PRODUCTION_STATUS_LABELS_AR[status]
}

export function getProductionStatusClass(status: ProductionStatus): string {
  if (status === "completed") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
  if (status === "cancelled") return "border-rose-500/40 bg-rose-500/10 text-rose-700"
  return "border-amber-500/40 bg-amber-500/10 text-amber-800"
}

export function productionBatchNumber(batch: ProductionBatch): string {
  return batch.batch_number || `PRD-${String(batch.id).padStart(6, "0")}`
}

export function productionOutput(batch: ProductionBatch) {
  return batch.output ?? batch.outputs?.[0] ?? null
}

export function productionInputCost(batch: ProductionBatch): number {
  if (batch.status !== "draft") return productionNumber(batch.total_input_cost)
  return (batch.inputs ?? []).reduce(
    (total, line) => total + productionNumber(line.quantity_kg) * productionNumber(line.raw_item?.average_cost),
    0,
  )
}

export function productionCostPerOutput(batch: ProductionBatch): number {
  if (batch.status !== "draft") return productionNumber(batch.cost_per_output_kg)
  const outputQuantity = productionNumber(productionOutput(batch)?.quantity_kg ?? batch.total_output_weight_kg)
  return outputQuantity > 0 ? productionInputCost(batch) / outputQuantity : 0
}

export function resolveProductionPeriodRange(preset: ProductionPeriodPreset, custom: ProductionCustomPeriod | null): ResolvedOperationalDateRange | null {
  if (preset === "all") return null
  if (preset === "custom") return custom?.from && custom?.to ? custom : null
  return resolveOperationalDateRange(preset)
}

export function defaultProductionPeriod(): ProductionCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}

export function readProductionPeriod(): { preset: ProductionPeriodPreset; custom: ProductionCustomPeriod | null } {
  if (typeof window === "undefined") return { preset: "current_month", custom: null }
  try {
    const parsed = JSON.parse(localStorage.getItem(PRODUCTION_PERIOD_STORAGE_KEY) ?? "{}") as { preset?: ProductionPeriodPreset; custom?: ProductionCustomPeriod }
    const valid: ProductionPeriodPreset[] = ["all", "today", "yesterday", "current_week", "current_month", "custom"]
    return {
      preset: parsed.preset && valid.includes(parsed.preset) ? parsed.preset : "current_month",
      custom: parsed.custom?.from && parsed.custom?.to ? parsed.custom : null,
    }
  } catch {
    return { preset: "current_month", custom: null }
  }
}
