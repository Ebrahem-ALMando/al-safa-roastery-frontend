import type { LabOrder, LabOrderItemResultAttachment, LabOrderResultFlag } from "@/features/orders"
import { effectiveResultFlagForDisplay } from "@/components/results/results-helpers"
import { findOrderItemFieldForResult } from "@/features/results/lib/order-item-result-sections"
import { formatOrderItemResultReference } from "@/components/orders/orders-helpers"
import { filterResultsForReport } from "@/features/results/lib/report-result-inclusion"

export const PATIENT_DETAIL_TABS = [
  "overview",
  "orders",
  "results",
  "attachments",
  "notes",
] as const

export type PatientDetailTab = (typeof PATIENT_DETAIL_TABS)[number]

export function parsePatientDetailTab(value: string | null | undefined): PatientDetailTab {
  if (value && PATIENT_DETAIL_TABS.includes(value as PatientDetailTab)) {
    return value as PatientDetailTab
  }
  return "overview"
}

export type FlatAttachment = LabOrderItemResultAttachment & {
  orderId: number
  orderNumber: string
  testName: string
  fieldName: string
}

export type FlatResultRow = {
  orderId: number
  orderNumber: string
  orderedAt: string | null
  testName: string
  fieldName: string
  fieldKey: string
  value: string
  unit: string | null
  flag: string | null
  reference: string | null
}

export function filterResultRows(rows: FlatResultRow[], query: string): FlatResultRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return rows

  return rows.filter((row) => {
    const haystack = [
      row.testName,
      row.fieldName,
      row.orderNumber,
      row.value,
      row.unit,
      row.reference,
      row.flag,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}

export type OrderResultGroup = {
  orderId: number
  orderNumber: string
  orderedAt: string | null
  status: LabOrder["status"]
  themeIndex: number
  rows: FlatResultRow[]
}

export type ComparisonEntry = {
  orderId: number
  orderNumber: string
  orderedAt: string | null
  value: string
  unit: string | null
  flag: string | null
  numeric: number | null
}

export const ORDER_RESULT_THEMES = [
  {
    border: "border-amber-200/90 dark:border-amber-800/50",
    bg: "bg-amber-50/70 dark:bg-amber-950/20",
    header: "bg-amber-100/80 dark:bg-amber-950/35",
    accent: "text-amber-900 dark:text-amber-100",
    dot: "bg-amber-400",
    ring: "ring-amber-200/60",
  },
  {
    border: "border-sky-200/90 dark:border-sky-800/50",
    bg: "bg-sky-50/70 dark:bg-sky-950/20",
    header: "bg-sky-100/80 dark:bg-sky-950/35",
    accent: "text-sky-900 dark:text-sky-100",
    dot: "bg-sky-400",
    ring: "ring-sky-200/60",
  },
  {
    border: "border-violet-200/90 dark:border-violet-800/50",
    bg: "bg-violet-50/70 dark:bg-violet-950/20",
    header: "bg-violet-100/80 dark:bg-violet-950/35",
    accent: "text-violet-900 dark:text-violet-100",
    dot: "bg-violet-400",
    ring: "ring-violet-200/60",
  },
  {
    border: "border-emerald-200/90 dark:border-emerald-800/50",
    bg: "bg-emerald-50/70 dark:bg-emerald-950/20",
    header: "bg-emerald-100/80 dark:bg-emerald-950/35",
    accent: "text-emerald-900 dark:text-emerald-100",
    dot: "bg-emerald-400",
    ring: "ring-emerald-200/60",
  },
  {
    border: "border-rose-200/90 dark:border-rose-800/50",
    bg: "bg-rose-50/70 dark:bg-rose-950/20",
    header: "bg-rose-100/80 dark:bg-rose-950/35",
    accent: "text-rose-900 dark:text-rose-100",
    dot: "bg-rose-400",
    ring: "ring-rose-200/60",
  },
] as const

export function normalizeFieldKey(fieldName: string, testName: string): string {
  const f = fieldName.trim().toLowerCase()
  const t = testName.trim().toLowerCase()
  if (!f || f === "—") return `test:${t}`
  return `${t}::${f}`
}

export function parseNumericResult(value: string): number | null {
  if (!value || value === "—") return null
  const cleaned = value.replace(/[^\d.,+\-eE]/g, "").replace(",", ".")
  if (!cleaned) return null
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

export function collectFlatData(orders: LabOrder[]) {
  const attachments: FlatAttachment[] = []
  const resultRows: FlatResultRow[] = []

  const sortedOrders = [...orders].sort((a, b) => {
    const ta = a.ordered_at ? new Date(a.ordered_at).getTime() : 0
    const tb = b.ordered_at ? new Date(b.ordered_at).getTime() : 0
    return tb - ta
  })

  for (const order of sortedOrders) {
    for (const item of order.items ?? []) {
      for (const r of filterResultsForReport(item)) {
        const val = r.value
        const valueStr =
          val === null || val === undefined ? "—" : typeof val === "number" ? String(val) : String(val)
        const fieldName = r.field_name?.trim() || "—"
        const referenceDisplay = formatOrderItemResultReference(item, r)
        const testField = findOrderItemFieldForResult(item, r)
        const displayFlag = effectiveResultFlagForDisplay(
          r,
          testField?.select_options,
          testField ?? null
        )
        resultRows.push({
          orderId: order.id,
          orderNumber: order.order_number,
          orderedAt: order.ordered_at,
          testName: item.test_name,
          fieldName,
          fieldKey: normalizeFieldKey(fieldName, item.test_name),
          value: valueStr,
          unit: r.unit,
          flag: displayFlag,
          reference: referenceDisplay === "—" ? null : referenceDisplay,
        })
        for (const att of r.attachments ?? []) {
          attachments.push({
            ...att,
            orderId: order.id,
            orderNumber: order.order_number,
            testName: item.test_name,
            fieldName,
          })
        }
      }
    }
  }

  return { attachments, resultRows }
}

export function groupResultsByOrder(orders: LabOrder[], resultRows: FlatResultRow[]): OrderResultGroup[] {
  const orderById = new Map(orders.map((o) => [o.id, o]))
  const groups = new Map<number, OrderResultGroup>()

  for (const row of resultRows) {
    let group = groups.get(row.orderId)
    if (!group) {
      const order = orderById.get(row.orderId)
      groups.set(row.orderId, {
        orderId: row.orderId,
        orderNumber: row.orderNumber,
        orderedAt: row.orderedAt,
        status: order?.status ?? "pending",
        themeIndex: groups.size % ORDER_RESULT_THEMES.length,
        rows: [],
      })
      group = groups.get(row.orderId)!
    }
    group.rows.push(row)
  }

  return [...groups.values()].sort((a, b) => {
    const ta = a.orderedAt ? new Date(a.orderedAt).getTime() : 0
    const tb = b.orderedAt ? new Date(b.orderedAt).getTime() : 0
    return tb - ta
  })
}

export function buildComparableFieldMap(resultRows: FlatResultRow[]): Map<string, FlatResultRow[]> {
  const map = new Map<string, FlatResultRow[]>()
  for (const row of resultRows) {
    const list = map.get(row.fieldKey) ?? []
    list.push(row)
    map.set(row.fieldKey, list)
  }

  const comparable = new Map<string, FlatResultRow[]>()
  for (const [key, rows] of map) {
    const orderIds = new Set(rows.map((r) => r.orderId))
    if (orderIds.size >= 2) {
      comparable.set(
        key,
        [...rows].sort((a, b) => {
          const ta = a.orderedAt ? new Date(a.orderedAt).getTime() : 0
          const tb = b.orderedAt ? new Date(b.orderedAt).getTime() : 0
          return ta - tb
        })
      )
    }
  }
  return comparable
}

export function rowsToComparisonEntries(rows: FlatResultRow[]): ComparisonEntry[] {
  return rows.map((row) => ({
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    orderedAt: row.orderedAt,
    value: row.value,
    unit: row.unit,
    flag: row.flag,
    numeric: parseNumericResult(row.value),
  }))
}

export function flagBadgeClass(flag: string | null): string {
  switch (flag) {
    case "high":
      return "border-rose-300/70 bg-linear-to-bl from-rose-500/15 to-rose-500/5 text-rose-800 dark:text-rose-100"
    case "low":
      return "border-amber-300/70 bg-linear-to-bl from-amber-500/15 to-amber-500/5 text-amber-900 dark:text-amber-100"
    case "abnormal":
      return "border-orange-300/70 bg-linear-to-bl from-orange-500/15 to-orange-500/5 text-orange-900 dark:text-orange-100"
    default:
      return "border-emerald-300/70 bg-linear-to-bl from-emerald-500/15 to-emerald-500/5 text-emerald-900 dark:text-emerald-100"
  }
}

export function flagDotClass(flag: string | null): string {
  switch (flag) {
    case "high":
      return "bg-rose-500"
    case "low":
      return "bg-amber-500"
    case "abnormal":
      return "bg-orange-500"
    default:
      return "bg-emerald-500"
  }
}

export type TrendDirection = "up" | "down" | "stable" | "unknown"

export function computeTrendDirection(
  current: number | null,
  previous: number | null
): TrendDirection {
  if (current === null || previous === null) return "unknown"
  const diff = current - previous
  const threshold = Math.max(Math.abs(previous) * 0.02, 0.01)
  if (Math.abs(diff) <= threshold) return "stable"
  return diff > 0 ? "up" : "down"
}

/** Result row ids visible after search/filter — for grouped per-test rendering. */
export function buildVisibleResultIdSet(
  orders: LabOrder[],
  filteredRows: FlatResultRow[]
): Set<number> {
  const rowKeys = new Set(
    filteredRows.map((row) => `${row.orderId}\0${row.testName}\0${row.fieldName}`)
  )
  const ids = new Set<number>()

  for (const order of orders) {
    for (const item of order.items ?? []) {
      for (const r of filterResultsForReport(item)) {
        const fieldName = r.field_name?.trim() || "—"
        const key = `${order.id}\0${item.test_name}\0${fieldName}`
        if (rowKeys.has(key)) {
          ids.add(r.id)
        }
      }
    }
  }

  return ids
}

export function computeResultsSummary(resultRows: FlatResultRow[], comparable: Map<string, FlatResultRow[]>) {
  let abnormal = 0
  for (const row of resultRows) {
    if (row.flag && row.flag !== "normal") abnormal += 1
  }
  return {
    totalResults: resultRows.length,
    comparableFields: comparable.size,
    abnormalCount: abnormal,
    orderCount: new Set(resultRows.map((r) => r.orderId)).size,
  }
}
