"use client"

import { useMemo } from "react"
import { useOrders } from "@/features/orders"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"

const COMPLETED_LIST_FILTERS = { status: "completed" as const }

type UseReportsArgs = {
  page: number
  search: string
  dateRange: ResolvedOperationalDateRange | null
}

/**
 * قائمة التقارير: طلبات مكتملة ضمن النطاق التشغيلي — مطابقة أسلوب usePatients (هوك بيانات مستقل).
 */
export function useReports({ page, search, dateRange }: UseReportsArgs) {
  const columnFilters = useMemo(() => COMPLETED_LIST_FILTERS, [])

  return useOrders({
    page,
    search,
    columnFilters,
    dateRange,
  })
}
