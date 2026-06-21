"use client"

import { useMemo } from "react"
import { mergeOperationalScopeWithManualYmd } from "@/lib/date-scope/merge-operational-scope-with-manual-ymd"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { LabOrder, LabOrdersListFilters, LabOrdersListMeta } from "../types/order.types"
import { buildLabOrdersQueryParams } from "../lib/build-lab-orders-query-params"

const ENDPOINT = "lab-orders"

type UseOrdersArgs = {
  page: number
  search: string
  columnFilters: Omit<LabOrdersListFilters, "search" | "page" | "ordered_from" | "ordered_to">
  /** مطابق لتمرير `dateRange` في `usePatients` — المصدر وحيد لمربى النطاق من الهيدر */
  dateRange: ResolvedOperationalDateRange | null
  /** حقول الطلب اليومية بالفلاتر فقط؛ يدمج الهوك مع `dateRange` كما يدمج المرضى عبر المعالج الموحد للاستعلام */
  orderedFromManual?: string
  orderedToManual?: string
  /** عند `false` لا يُنفَّذ الطلب (مثلاً قبل جاهزية `patient_id`) */
  enabled?: boolean
}

export function useOrders({
  page,
  search,
  columnFilters,
  dateRange,
  orderedFromManual,
  orderedToManual,
  enabled = true,
}: UseOrdersArgs) {
  const mergedOrdered = useMemo(
    () =>
      mergeOperationalScopeWithManualYmd(dateRange, orderedFromManual?.trim() || undefined, orderedToManual?.trim() || undefined),
    [dateRange, orderedFromManual, orderedToManual]
  )

  const queryParams = useMemo(
    () =>
      buildLabOrdersQueryParams(page, {
        ...columnFilters,
        search: search.trim() || undefined,
        ordered_from: mergedOrdered?.from,
        ordered_to: mergedOrdered?.to,
      }),
    [page, search, columnFilters, mergedOrdered]
  )

  const swrKey = useMemo(
    () => (enabled ? `lab-orders:${JSON.stringify(queryParams)}` : null),
    [queryParams, enabled]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<LabOrder[]>(
    swrKey,
    ENDPOINT,
    { queryParams }
  )

  return {
    orders: data ?? [],
    meta: meta as LabOrdersListMeta | undefined,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
