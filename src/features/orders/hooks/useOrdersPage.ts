"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useOperationalDateScope } from "@/lib/hooks/useOperationalDateScope"
import { useOrders } from "./useOrders"
import type { LabOrder } from "../types/order.types"

export type OrdersViewMode = "table" | "cards"

export interface OrdersPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: OrdersViewMode
}

const CONFIG_KEY = "orders-page-config"

const defaultConfig: OrdersPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): OrdersPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<OrdersPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

export function useOrdersPage() {
  const { preset: dateScopePreset, setPreset: setDateScopePreset, dateRange } = useOperationalDateScope("orders")

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<LabOrder["status"] | "all">("all")
  const [patientId, setPatientId] = useState<number | "all">("all")
  const [orderedFrom, setOrderedFrom] = useState("")
  const [orderedTo, setOrderedTo] = useState("")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<OrdersPageConfig>(defaultConfig)

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

  const setViewMode = useCallback((viewMode: OrdersViewMode) => {
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
