"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useOperationalDateScope } from "@/lib/hooks/useOperationalDateScope"
import { useTests } from "./useTests"

export type TestsViewMode = "table" | "cards" | "tree"

/** وضع العرض داخل تبويب «شجرة» — جدول أو بطاقات */
export type TestsTreeInnerView = "table" | "cards"

export interface TestsPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: TestsViewMode
  treeInnerView: TestsTreeInnerView
}

const CONFIG_KEY = "tests-page-config"

const defaultConfig: TestsPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
  treeInnerView: "cards",
}

function readConfig(): TestsPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<TestsPageConfig>
    const vm = parsed.viewMode
    const viewMode: TestsViewMode =
      vm === "cards" || vm === "tree" || vm === "table" ? vm : "table"
    const tiv = parsed.treeInnerView
    const treeInnerView: TestsTreeInnerView =
      tiv === "table" || tiv === "cards" ? tiv : "cards"
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode,
      treeInnerView,
    }
  } catch {
    return defaultConfig
  }
}

export function useTestsPage() {
  const { preset: dateScopePreset, setPreset: setDateScopePreset, dateRange } = useOperationalDateScope("tests")

  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<number | "all">("all")
  const [isActive, setIsActive] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<TestsPageConfig>(defaultConfig)

  useEffect(() => {
    setConfig(readConfig())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  const columnFilters = useMemo(
    () => ({
      category_id: categoryId === "all" ? undefined : categoryId,
      is_active: isActive === "all" ? undefined : isActive === "active",
    }),
    [categoryId, isActive]
  )

  useEffect(() => {
    setPage(1)
  }, [search, categoryId, isActive, dateScopePreset])

  const { tests, meta, isLoading, error, mutate } = useTests({
    search,
    page,
    columnFilters,
    dateRange,
  })

  const hasSearch = search.trim().length > 0
  const hasCategory = categoryId !== "all"
  const hasIsActive = isActive !== "all"
  const hasDateScopePreset = dateScopePreset !== "all"
  const hasAnyFilter = hasSearch || hasCategory || hasIsActive || hasDateScopePreset

  const isEmpty = !isLoading && tests.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: TestsViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const setTreeInnerView = useCallback((treeInnerView: TestsTreeInnerView) => {
    setConfig((prev) => ({ ...prev, treeInnerView }))
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
    dateRange,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    isActive,
    setIsActive,
    page,
    setPage,
    config,
    setViewMode,
    setTreeInnerView,
    toggleShowKPI,
    toggleShowFilters,
    tests,
    meta,
    isLoading,
    error,
    mutate,
    isTrueEmpty,
    isFilteredNoHits,
    currentPage,
    lastPage,
    canPrev,
    canNext,
  }
}
