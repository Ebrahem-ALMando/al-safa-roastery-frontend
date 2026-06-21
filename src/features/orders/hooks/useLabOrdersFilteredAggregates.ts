"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { LaravelSuccessResponse } from "@/lib/api"
import { apiExecutor } from "@/lib/api"
import { orderHasNonNormalResultFlag } from "@/components/orders/orders-helpers"
import { getResultsProgressStatus } from "@/components/results/results-helpers"
import { mergeOperationalScopeWithManualYmd } from "@/lib/date-scope/merge-operational-scope-with-manual-ymd"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildLabOrdersQueryParams } from "../lib/build-lab-orders-query-params"
import type { LabOrder, LabOrdersListFilters, LabOrdersListMeta } from "../types/order.types"

const ENDPOINT = "lab-orders"
/** حدّ أمان كما في التقارير — قوائم ضخمة تتوقف عند هذا الحد. */
export const LAB_ORDERS_AGGREGATE_SCAN_MAX_PAGES = 400

export type LabOrdersFilteredAggregates = {
  /** total من الطبقة الأولى في meta (مرجِع الموثوقية) */
  totalOrdersInFilter: number
  /** توزيع حالات الطلب ضمن مجموعة الطلب الذي يطابق كل الفلاتر */
  byStatus: Partial<
    Record<"draft" | "pending" | "in_progress" | "completed" | "approved" | "cancelled", number>
  >
  /** مجموع عدد تحاليل (عناصر) عبر كل الطلبات المصفّاة */
  totalTestItems: number
  /** طلبات تعرض أي نتيجة غير طبيعية وفق قائمة مختصرة للعناصر */
  ordersWithFlaggedResults: number
  /** دلّ إدخال النتائج — كما لو طُبّقت على مجموعة قائمة واحدة مرشّحة بالكامل */
  resultsBuckets: {
    completed: number
    partial: number
    pending: number
  }
}

type Args = {
  enabled: boolean
  refreshNonce: number
  search: string
  columnFilters: Omit<LabOrdersListFilters, "search" | "page" | "ordered_from" | "ordered_to">
  dateRange: ResolvedOperationalDateRange | null
  orderedFromManual?: string
  orderedToManual?: string
  /** عند تعطيله لا يُحسب دلّ الطلب بحسب عمق الحقول (أخف)، لكن يُحسب عدّ الحالات وباقي حقول aggregates */
  computeResultsBuckets: boolean
}

export function useLabOrdersFilteredAggregates({
  enabled,
  refreshNonce,
  search,
  columnFilters,
  dateRange,
  orderedFromManual,
  orderedToManual,
  computeResultsBuckets,
}: Args): { aggregates: LabOrdersFilteredAggregates | null; aggregatesLoading: boolean } {
  const mergedOrdered = useMemo(
    () =>
      mergeOperationalScopeWithManualYmd(dateRange, orderedFromManual?.trim() || undefined, orderedToManual?.trim() || undefined),
    [dateRange, orderedFromManual, orderedToManual]
  )

  const filterPayload = useMemo(
    (): Omit<LabOrdersListFilters, "page"> => ({
      ...columnFilters,
      search: search.trim() || undefined,
      ordered_from: mergedOrdered?.from,
      ordered_to: mergedOrdered?.to,
    }),
    [search, columnFilters, mergedOrdered]
  )

  const fingerprint = useMemo(() => JSON.stringify(filterPayload), [filterPayload])

  const [aggregates, setAggregates] = useState<LabOrdersFilteredAggregates | null>(null)
  const [aggregatesLoading, setAggregatesLoading] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    if (!enabled) {
      setAggregates(null)
      setAggregatesLoading(false)
      return
    }

    setAggregatesLoading(true)

    ;(async () => {
      const byStatus: LabOrdersFilteredAggregates["byStatus"] = {}
      let totalOrdersInFilter = 0
      let totalTestItems = 0
      let ordersWithFlaggedResults = 0
      let resCompleted = 0
      let resPartial = 0
      let resPending = 0

      let page = 1
      let lastPage = 1
      let guard = 0

      try {
        do {
          if (cancelledRef.current) return

          const queryParams = buildLabOrdersQueryParams(page, filterPayload)
          const res = await apiExecutor<LaravelSuccessResponse<LabOrder[]>>(ENDPOINT, "GET", undefined, queryParams)
          const rows = Array.isArray(res.data) ? res.data : []
          const meta = res.meta as LabOrdersListMeta | undefined

          if (page === 1) totalOrdersInFilter = meta?.total ?? rows.length

          for (const o of rows) {
            const st = o.status
            byStatus[st] = (byStatus[st] ?? 0) + 1
            totalTestItems += o.items?.length ?? 0
            if (orderHasNonNormalResultFlag(o)) ordersWithFlaggedResults += 1
            if (computeResultsBuckets) {
              switch (getResultsProgressStatus(o)) {
                case "completed":
                  resCompleted += 1
                  break
                case "partial":
                  resPartial += 1
                  break
                default:
                  resPending += 1
              }
            }
          }

          lastPage = meta?.last_page ?? page
          page += 1
          guard += 1
        } while (page <= lastPage && guard < LAB_ORDERS_AGGREGATE_SCAN_MAX_PAGES)

        if (!cancelledRef.current) {
          setAggregates({
            totalOrdersInFilter,
            byStatus,
            totalTestItems,
            ordersWithFlaggedResults,
            resultsBuckets: {
              completed: resCompleted,
              partial: resPartial,
              pending: resPending,
            },
          })
        }
      } catch {
        if (!cancelledRef.current) setAggregates(null)
      } finally {
        if (!cancelledRef.current) setAggregatesLoading(false)
      }
    })()

    return () => {
      cancelledRef.current = true
    }
  }, [enabled, fingerprint, refreshNonce, computeResultsBuckets])

  return { aggregates, aggregatesLoading }
}
