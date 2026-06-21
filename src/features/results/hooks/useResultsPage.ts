"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useOrders } from "@/features/orders/hooks/useOrders"
import type { LabOrder } from "@/features/orders/types/order.types"
import { useOperationalDateScope } from "@/lib/hooks/useOperationalDateScope"

export type ResultsViewMode = "table" | "cards"

export interface ResultsPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: ResultsViewMode
}

const CONFIG_KEY = "results-page-config"

const defaultConfig: ResultsPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): ResultsPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<ResultsPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

export function useResultsPage() {
  const { preset: dateScopePreset, setPreset: setDateScopePreset, dateRange } = useOperationalDateScope("results")

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<LabOrder["status"] | "all">("all")
  const [patientId, setPatientId] = useState<number | "all">("all")
  const [orderedFrom, setOrderedFrom] = useState("")
  const [orderedTo, setOrderedTo] = useState("")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<ResultsPageConfig>(defaultConfig)

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
      status: status === "all" ? undefined : status,
      patient_id: patientId === "all" ? undefined : patientId,
    }),
    [status, patientId]
  )

  useEffect(() => {
    setPage(1)
  }, [search, status, patientId, orderedFrom, orderedTo, dateScopePreset])

  const { orders, meta, isLoading, error, mutate } = useOrders({
    search,
    page,
    columnFilters,
    dateRange,
    orderedFromManual: orderedFrom || undefined,
    orderedToManual: orderedTo || undefined,
  })

  const hasDateScopePreset = dateScopePreset !== "all"
  const hasAnyFilter =
    Boolean(search.trim()) ||
    status !== "all" ||
    patientId !== "all" ||
    Boolean(orderedFrom) ||
    Boolean(orderedTo) ||
    hasDateScopePreset

  const isEmpty = !isLoading && orders.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: ResultsViewMode) => {
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
    status,
    setStatus,
    patientId,
    setPatientId,
    orderedFrom,
    setOrderedFrom,
    orderedTo,
    setOrderedTo,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    orders,
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
