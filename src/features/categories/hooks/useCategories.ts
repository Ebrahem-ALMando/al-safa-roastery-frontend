"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { QueryParams } from "@/lib/api/api.types"
import { operationalDateScopeQueryKeysForPage } from "@/lib/date-scope/operational-date-scope-query-mapping"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { appendOperationalDateRangeToQueryParams } from "@/lib/date-scope/operational-date-scope-query"
import type { CategoriesListFilters, CategoriesListMeta, Category } from "../types/category.types"

const ENDPOINT = "categories"

function buildQueryParams(
  page: number,
  filters: Omit<CategoriesListFilters, "page" | "created_from" | "created_to">,
  dateRange: ResolvedOperationalDateRange | null
): QueryParams {
  const q: QueryParams = { page }

  if (filters.search != null && String(filters.search).trim() !== "") {
    q.search = String(filters.search).trim()
  }

  if (typeof filters.is_active === "boolean") {
    q.is_active = filters.is_active ? 1 : 0
  }

  if (filters.category_type === "main" || filters.category_type === "sub") {
    q.category_type = filters.category_type
  }

  return appendOperationalDateRangeToQueryParams(q, dateRange, operationalDateScopeQueryKeysForPage("test_categories"))
}

type UseCategoriesArgs = {
  page: number
  search: string
  filters: Omit<CategoriesListFilters, "search" | "page" | "created_from" | "created_to">
  dateRange: ResolvedOperationalDateRange | null
}

export function useCategories({ page, search, filters, dateRange }: UseCategoriesArgs) {
  const queryParams = useMemo(
    () =>
      buildQueryParams(page, {
        ...filters,
        search: search.trim() || undefined,
      }, dateRange),
    [page, search, filters, dateRange]
  )

  const swrKey = useMemo(
    () => `categories:${JSON.stringify(queryParams)}`,
    [queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Category[]>(
    swrKey,
    ENDPOINT,
    { queryParams }
  )

  return {
    categories: data ?? [],
    meta: meta as CategoriesListMeta | undefined,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
