"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import {
  DEFAULT_VISIBLE_SUPPLIER_COLUMNS,
  SUPPLIERS_PAGE_CONFIG_KEY,
  SUPPLIERS_TABLE_COLUMNS_STORAGE_KEY,
  SUPPLIERS_PERIOD_STORAGE_KEY,
  type SupplierTableColumnId,
  type SuppliersCustomPeriod,
  type SuppliersPeriodPreset,
  type SuppliersViewMode,
  normalizeSupplierVisibleColumns,
} from "../lib/suppliers.constants"
import {
  defaultCustomPeriod,
  readStoredSuppliersPeriod,
  resolveSuppliersPeriodRange,
} from "../lib/suppliers.helpers"
import type { BalanceStatusFilter } from "../types/supplier.types"
import { useSuppliers } from "./useSuppliers"

export interface SuppliersPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: SuppliersViewMode
}

const defaultConfig: SuppliersPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): SuppliersPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(SUPPLIERS_PAGE_CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<SuppliersPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

function readColumnVisibility(): SupplierTableColumnId[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_SUPPLIER_COLUMNS
  try {
    const raw = localStorage.getItem(SUPPLIERS_TABLE_COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_VISIBLE_SUPPLIER_COLUMNS
    const parsed = JSON.parse(raw) as SupplierTableColumnId[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_VISIBLE_SUPPLIER_COLUMNS
    return normalizeSupplierVisibleColumns(parsed)
  } catch {
    return DEFAULT_VISIBLE_SUPPLIER_COLUMNS
  }
}

export type SuppliersActiveStatus = "all" | "active" | "inactive"

export function useSuppliersPage() {
  // B9: Use static SSR-safe defaults. localStorage is read in useEffect below.
  const [periodPreset, setPeriodPreset] = useState<SuppliersPeriodPreset>("current_month")
  const [customPeriod, setCustomPeriod] = useState<SuppliersCustomPeriod | null>(null)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<SuppliersActiveStatus>("all")
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatusFilter | "all">("all")
  const [balanceMin, setBalanceMin] = useState("")
  const [balanceMax, setBalanceMax] = useState("")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<SuppliersPageConfig>(defaultConfig)
  const [visibleColumns, setVisibleColumns] = useState<SupplierTableColumnId[]>(
    DEFAULT_VISIBLE_SUPPLIER_COLUMNS
  )

  useEffect(() => {
    setConfig(readConfig())
    setVisibleColumns(readColumnVisibility())
    const period = readStoredSuppliersPeriod()
    setPeriodPreset(period.preset)
    setCustomPeriod(period.custom)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SUPPLIERS_PAGE_CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SUPPLIERS_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(
        SUPPLIERS_PERIOD_STORAGE_KEY,
        JSON.stringify({
          preset: periodPreset,
          custom: customPeriod,
        })
      )
    } catch {
      /* ignore */
    }
  }, [periodPreset, customPeriod])

  const dateRange = useMemo(
    (): ResolvedOperationalDateRange | null =>
      resolveSuppliersPeriodRange(periodPreset, customPeriod),
    [periodPreset, customPeriod]
  )

  const columnFilters = useMemo(
    () => ({
      is_active: isActive === "all" ? undefined : isActive === "active",
      balance_status: balanceStatus !== "all" ? (balanceStatus as BalanceStatusFilter) : undefined,
      balance_min: balanceMin.trim() ? Number.parseFloat(balanceMin) : undefined,
      balance_max: balanceMax.trim() ? Number.parseFloat(balanceMax) : undefined,
    }),
    [isActive, balanceStatus, balanceMin, balanceMax]
  )

  useEffect(() => {
    setPage(1)
  }, [search, isActive, balanceStatus, balanceMin, balanceMax])

  const { suppliers, meta, isLoading, error, mutate } = useSuppliers({
    search,
    page,
    columnFilters,
  })

  const hasSearch = search.trim().length > 0
  const hasIsActive = isActive !== "all"
  const hasBalanceFilter =
    balanceStatus !== "all" || balanceMin.trim() !== "" || balanceMax.trim() !== ""
  const hasAnyFilter = hasSearch || hasIsActive || hasBalanceFilter

  const isEmpty = !isLoading && suppliers.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: SuppliersViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const toggleShowKPI = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showKPI: value }))
  }, [])

  const toggleShowFilters = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showFilters: value }))
  }, [])

  const handlePeriodPresetChange = useCallback((preset: SuppliersPeriodPreset) => {
    if (preset === "custom") {
      setCustomPeriod((prev) => prev ?? defaultCustomPeriod())
      setCustomDialogOpen(true)
      setPeriodPreset("custom")
      return
    }
    setPeriodPreset(preset)
  }, [])

  const applyCustomPeriod = useCallback((from: string, to: string) => {
    setCustomPeriod({ from, to })
    setPeriodPreset("custom")
    setCustomDialogOpen(false)
  }, [])

  const setColumnVisibility = useCallback((columns: SupplierTableColumnId[]) => {
    setVisibleColumns(normalizeSupplierVisibleColumns(columns))
  }, [])

  return {
    periodPreset,
    setPeriodPreset: handlePeriodPresetChange,
    customPeriod,
    customDialogOpen,
    setCustomDialogOpen,
    applyCustomPeriod,
    dateRange,
    search,
    setSearch,
    isActive,
    setIsActive,
    balanceStatus,
    setBalanceStatus,
    balanceMin,
    setBalanceMin,
    balanceMax,
    setBalanceMax,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    suppliers,
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
