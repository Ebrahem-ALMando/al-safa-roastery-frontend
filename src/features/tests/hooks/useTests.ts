"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildTestsQueryParams } from "../lib/build-tests-query-params"
import type { Test, TestsListFilters, TestsListMeta } from "../types/test.types"

const ENDPOINT = "tests"

type UseTestsArgs = {
  page: number
  columnFilters: Omit<TestsListFilters, "search" | "page" | "created_from" | "created_to">
  search: string
  /** افتراضي 15؛ يُمرَّر مثلاً 100 لصفحة اختيار التحاليل. */
  perPage?: number
  dateRange: ResolvedOperationalDateRange | null
}

export function useTests({ page, search, columnFilters, perPage, dateRange }: UseTestsArgs) {
  const queryParams = useMemo(() => {
    return buildTestsQueryParams(
      page,
      {
        ...columnFilters,
        search: search.trim() || undefined,
      },
      dateRange,
      typeof perPage === "number" ? { perPage } : undefined
    )
  }, [page, search, columnFilters, perPage, dateRange])

  const swrKey = useMemo(
    () => `tests:${JSON.stringify(queryParams)}`,
    [queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Test[]>(
    swrKey,
    ENDPOINT,
    { queryParams }
  )

  return {
    tests: data ?? [],
    meta: meta as TestsListMeta | undefined,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
