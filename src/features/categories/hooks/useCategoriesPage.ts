"use client"

import { useCallback, useEffect, useState } from "react"
import { useOperationalDateScope } from "@/lib/hooks/useOperationalDateScope"
import { useCategories } from "./useCategories"

export type CategoriesViewMode = "tree" | "table"

export interface CategoriesPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: CategoriesViewMode
}

const CONFIG_KEY = "categories-page-config"

const defaultConfig: CategoriesPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): CategoriesPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<CategoriesPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "tree" ? "tree" : "table",
    }
  } catch {
    return defaultConfig
  }
}

export function useCategoriesPage() {
  const { preset: dateScopePreset, setPreset: setDateScopePreset, dateRange } =
    useOperationalDateScope("test_categories")

  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<"all" | "active" | "inactive">("all")
  const [categoryType, setCategoryType] = useState<"all" | "main" | "sub">("all")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<CategoriesPageConfig>(defaultConfig)

  useEffect(() => {
    setConfig(readConfig())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  useEffect(() => {
    setPage(1)
  }, [search, isActive, categoryType, dateScopePreset])

  const { categories, meta, isLoading, error, mutate } = useCategories({
    search,
    page,
    filters: {
      is_active: isActive === "all" ? undefined : isActive === "active",
      category_type: categoryType === "all" ? undefined : categoryType,
    },
    dateRange,
  })

  const hasSearch = search.trim().length > 0
  const hasIsActive = isActive !== "all"
  const hasCategoryType = categoryType !== "all"
  const hasDateScopePreset = dateScopePreset !== "all"
  const hasAnyFilter = hasSearch || hasIsActive || hasCategoryType || hasDateScopePreset

  const isEmpty = !isLoading && categories.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: CategoriesViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const toggleShowKPI = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showKPI: value }))
  }, [])

  const toggleShowFilters = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showFilters: value }))
  }, [])

  return {
    dateScopePreset,
    setDateScopePreset,
    search,
    setSearch,
    isActive,
    setIsActive,
    categoryType,
    setCategoryType,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    categories,
    meta,
    isLoading,
    error,
    mutate,
    hasAnyFilter,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  }
}
