"use client"

import { useCallback, useEffect, useState } from "react"
import { useOperationalDateScope } from "@/lib/hooks/useOperationalDateScope"
import { useReports } from "./useReports"

export interface ReportsPageConfig {
  showKPI: boolean
  showFilters: boolean
}

const CONFIG_KEY = "reports-page-config"

const defaultConfig: ReportsPageConfig = {
  showKPI: true,
  showFilters: true,
}

function readConfig(): ReportsPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<ReportsPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
    }
  } catch {
    return defaultConfig
  }
}

/**
 * صفحة التقارير — نفس سلسلة usePatientsPage: نطاق من الهيدر → dateRange → هوك قائمة واحد → إعادة الجلب مع SWR عند تغيير المعيّن أو البحث.
 */
export function useReportsPage() {
  const { preset: dateScopePreset, setPreset: setDateScopePreset, dateRange } = useOperationalDateScope("reports")

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<ReportsPageConfig>(defaultConfig)

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
  }, [search, dateScopePreset])

  const { orders, meta, isLoading, error, mutate } = useReports({
    page,
    search,
    dateRange,
  })

  const hasSearch = search.trim().length > 0
  const hasDateScope = dateScopePreset !== "all"
  const hasAnyFilter = hasSearch || hasDateScope

  const isEmpty = !isLoading && orders.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

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
    setPage,
    config,
    toggleShowKPI,
    toggleShowFilters,
    orders,
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
