"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { apiExecutor } from "@/lib/api"
import type { LaravelSuccessResponse } from "@/lib/api"
import type { Category, CategoriesListMeta } from "../types/category.types"
import { categoriesToTree } from "../utils/categoriesToTree"
import type { CategoryNode } from "@/lib/lab-catalog-types"

async function fetchAllActiveCategories(): Promise<Category[]> {
  const first = await apiExecutor<LaravelSuccessResponse<Category[]>>(
    "categories",
    "GET",
    undefined,
    { page: 1, is_active: 1 }
  )

  let rows = first.data ?? []
  const meta = first.meta as CategoriesListMeta | undefined
  const lastPage = meta?.last_page ?? 1

  if (lastPage > 1) {
    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) =>
        apiExecutor<LaravelSuccessResponse<Category[]>>("categories", "GET", undefined, {
          page: i + 2,
          is_active: 1,
        })
      )
    )
    for (const r of rest) {
      rows = rows.concat(r.data ?? [])
    }
  }

  return rows
}

/**
 * جلب كل التصنيفات النشطة (جميع الصفحات) وبناء شجرة للموديلات القديمة مثل `TestFormDialog`.
 */
export function useCategoriesTree(enabled: boolean) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? "categories:tree-all-active" : null,
    fetchAllActiveCategories,
    { revalidateOnFocus: false }
  )

  const categoryTree = useMemo(() => (data?.length ? categoriesToTree(data) : []), [data])

  return {
    categoryTree: categoryTree as CategoryNode[],
    flatCategories: data ?? [],
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
