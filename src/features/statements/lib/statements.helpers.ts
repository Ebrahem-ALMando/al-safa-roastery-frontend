import { formatLocalYmd, resolveOperationalDateRange } from "@/lib/date-scope/resolve-operational-date-range"
import {
  STATEMENTS_PERIOD_STORAGE_KEY,
  STATEMENT_ENTRY_LABELS_AR,
  type StatementCustomPeriod,
  type StatementPeriodPreset,
} from "./statements.constants"
import type { StatementEntityType, StatementEntry, StatementQuery } from "../types/statement.types"

export function statementNumber(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? 0))
  return Number.isFinite(parsed) ? parsed : 0
}

export const formatStatementMoney = (value: unknown) => `$ ${statementNumber(value).toFixed(2)}`

export function formatStatementDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ar-SY", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date)
}

export function resolveStatementPeriod(preset: StatementPeriodPreset, custom: StatementCustomPeriod | null): StatementQuery {
  if (preset === "all") return {}
  if (preset === "custom") return custom?.from && custom?.to ? { date_from: custom.from, date_to: custom.to } : {}
  const range = resolveOperationalDateRange(preset)
  return range ? { date_from: range.from, date_to: range.to } : {}
}

export function defaultStatementPeriod(): StatementCustomPeriod {
  const today = formatLocalYmd(new Date())
  return { from: today, to: today }
}

export function readStatementPeriod(): { preset: StatementPeriodPreset; custom: StatementCustomPeriod | null } {
  if (typeof window === "undefined") return { preset: "current_month", custom: null }
  try {
    const raw = localStorage.getItem(STATEMENTS_PERIOD_STORAGE_KEY)
    if (!raw) return { preset: "current_month", custom: null }
    const parsed = JSON.parse(raw)
    return { preset: parsed.preset ?? "current_month", custom: parsed.custom ?? null }
  } catch {
    return { preset: "current_month", custom: null }
  }
}

export function statementEntryLabel(entry: StatementEntry): string {
  return STATEMENT_ENTRY_LABELS_AR[entry.entry_type] ?? "أخرى"
}

export function statementReferenceHref(entry: StatementEntry): string | null {
  if (entry.reference_type === "purchase_invoice" && entry.reference_id) {
    return `/dashboard/purchases/${entry.reference_id}`
  }
  return null
}

export function statementBalanceMeaning(type: StatementEntityType, value: unknown): string {
  const amount = statementNumber(value)
  if (amount === 0) return "متوازن"
  if (type === "customer") return amount > 0 ? "عليه لنا" : "له عندنا"
  return amount > 0 ? "علينا للمورد" : "رصيد دائن لنا لدى المورد"
}

export function statementPrintHref(type: StatementEntityType, entityId: number, query: StatementQuery): string {
  const params = new URLSearchParams()
  if (query.date_from) params.set("date_from", query.date_from)
  if (query.date_to) params.set("date_to", query.date_to)
  const suffix = params.toString() ? `?${params.toString()}` : ""
  return `/dashboard/statements/${type}/${entityId}/print${suffix}`
}
