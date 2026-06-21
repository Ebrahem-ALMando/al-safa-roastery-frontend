"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "@/components/ui/custom-toast-with-icons"
import { useCategories } from "@/features/categories"
import type { OperationalDateScopePreset } from "@/lib/date-scope/operational-date-scope.types"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildTestsExportFilterSummary } from "../lib/build-tests-export-filter-summary"
import { exportTestsToExcel } from "../lib/export-tests-excel"
import { fetchAllFilteredTests } from "../lib/fetch-all-filtered-tests"
import { mapTestsToExportRows } from "../lib/map-test-to-export-row"

export type UseTestsExcelExportArgs = {
  search: string
  categoryId: number | "all"
  isActive: "all" | "active" | "inactive"
  dateRange: ResolvedOperationalDateRange | null
  dateScopePreset: OperationalDateScopePreset
}

export function useTestsExcelExport({
  search,
  categoryId,
  isActive,
  dateRange,
  dateScopePreset,
}: UseTestsExcelExportArgs) {
  const [isExporting, setIsExporting] = useState(false)

  const { categories } = useCategories({
    page: 1,
    search: "",
    filters: { is_active: true },
    dateRange: null,
  })

  const categoryLabel = useMemo(() => {
    if (categoryId === "all") return undefined
    return categories.find((c) => c.id === categoryId)?.name
  }, [categories, categoryId])

  const exportExcel = useCallback(async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      const tests = await fetchAllFilteredTests({
        filters: {
          search: search.trim() || undefined,
          category_id: categoryId === "all" ? undefined : categoryId,
          is_active:
            isActive === "all" ? undefined : isActive === "active",
        },
        dateRange,
      })

      const rows = mapTestsToExportRows(tests)
      const filterSummary = buildTestsExportFilterSummary({
        search,
        categoryId,
        isActive,
        dateScopePreset,
        categoryLabel,
      })

      await exportTestsToExcel(rows, filterSummary)
    } catch {
      toast.error("تعذر تصدير ملف Excel")
    } finally {
      setIsExporting(false)
    }
  }, [
    isExporting,
    search,
    categoryId,
    isActive,
    dateRange,
    dateScopePreset,
    categoryLabel,
  ])

  return { exportExcel, isExporting }
}
