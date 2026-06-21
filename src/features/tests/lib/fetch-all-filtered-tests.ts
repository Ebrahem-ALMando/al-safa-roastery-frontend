import { apiExecutor, type LaravelSuccessResponse } from "@/lib/api"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { buildTestsQueryParams } from "./build-tests-query-params"
import type { Test, TestsListFilters, TestsListMeta } from "../types/test.types"

const ENDPOINT = "tests"
const EXPORT_PER_PAGE = 100
/** حد أقصى 50 صفحة × 100 = 5000 سجل */
const MAX_EXPORT_PAGES = 50

export type FetchAllFilteredTestsInput = {
  filters: Omit<TestsListFilters, "page" | "created_from" | "created_to">
  dateRange: ResolvedOperationalDateRange | null
}

export async function fetchAllFilteredTests({
  filters,
  dateRange,
}: FetchAllFilteredTestsInput): Promise<Test[]> {
  const all: Test[] = []
  let page = 1
  let lastPage = 1

  do {
    if (page > MAX_EXPORT_PAGES) {
      break
    }

    const queryParams = buildTestsQueryParams(page, filters, dateRange, {
      perPage: EXPORT_PER_PAGE,
    })

    const response = await apiExecutor<LaravelSuccessResponse<Test[]>>(
      ENDPOINT,
      "GET",
      undefined,
      queryParams
    )

    const batch = response.data ?? []
    all.push(...batch)

    const meta = response.meta as TestsListMeta | undefined
    lastPage = meta?.last_page ?? (batch.length < EXPORT_PER_PAGE ? page : page + 1)
    page += 1
  } while (page <= lastPage)

  return all
}
