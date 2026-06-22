"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import {
  DEFAULT_VISIBLE_PURCHASE_COLUMNS,
  PURCHASES_PAGE_CONFIG_KEY,
  PURCHASES_PERIOD_STORAGE_KEY,
  PURCHASES_TABLE_COLUMNS_STORAGE_KEY,
  type PurchaseTableColumnId,
  type PurchasesCustomPeriod,
  type PurchasesPeriodPreset,
  type PurchasesViewMode,
  normalizePurchaseVisibleColumns,
} from "../lib/purchases.constants"
import {
  defaultCustomPeriod,
  readStoredPurchasesPeriod,
  resolvePurchasesPeriodRange,
} from "../lib/purchases.helpers"
import type {
  PurchaseInvoiceStatus,
  PurchasePaymentMethod,
  PurchasePaymentStatus,
} from "../types/purchase.types"
import { usePurchases } from "./usePurchases"

export interface PurchasesPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: PurchasesViewMode
}

const defaultConfig: PurchasesPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): PurchasesPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(PURCHASES_PAGE_CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<PurchasesPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

function readColumnVisibility(): PurchaseTableColumnId[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_PURCHASE_COLUMNS
  try {
    const raw = localStorage.getItem(PURCHASES_TABLE_COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_VISIBLE_PURCHASE_COLUMNS
    const parsed = JSON.parse(raw) as PurchaseTableColumnId[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_VISIBLE_PURCHASE_COLUMNS
    return normalizePurchaseVisibleColumns(parsed)
  } catch {
    return DEFAULT_VISIBLE_PURCHASE_COLUMNS
  }
}

export type PurchasesStatusFilter = PurchaseInvoiceStatus | "all"
export type PurchasesPaymentStatusFilter = PurchasePaymentStatus | "all"
export type PurchasesPaymentMethodFilter = PurchasePaymentMethod | "all"

export function usePurchasesPage() {
  const [periodPreset, setPeriodPreset] = useState<PurchasesPeriodPreset>(() =>
    typeof window !== "undefined" ? readStoredPurchasesPeriod().preset : "current_month"
  )
  const [customPeriod, setCustomPeriod] = useState<PurchasesCustomPeriod | null>(() =>
    typeof window !== "undefined" ? readStoredPurchasesPeriod().custom : null
  )
  const [customDialogOpen, setCustomDialogOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<PurchasesStatusFilter>("all")
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PurchasesPaymentStatusFilter>("all")
  const [paymentMethod, setPaymentMethod] = useState<PurchasesPaymentMethodFilter>("all")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<PurchasesPageConfig>(defaultConfig)
  const [visibleColumns, setVisibleColumns] = useState<PurchaseTableColumnId[]>(
    DEFAULT_VISIBLE_PURCHASE_COLUMNS
  )

  useEffect(() => {
    setConfig(readConfig())
    setVisibleColumns(readColumnVisibility())
    const period = readStoredPurchasesPeriod()
    setPeriodPreset(period.preset)
    setCustomPeriod(period.custom)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PURCHASES_PAGE_CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PURCHASES_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(
        PURCHASES_PERIOD_STORAGE_KEY,
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
      resolvePurchasesPeriodRange(periodPreset, customPeriod),
    [periodPreset, customPeriod]
  )

  const columnFilters = useMemo(() => {
    return {
      status: status !== "all" ? status : undefined,
      supplier_id: supplierId ?? undefined,
      payment_status: paymentStatus !== "all" ? paymentStatus : undefined,
      payment_method: paymentMethod !== "all" ? paymentMethod : undefined,
    }
  }, [status, supplierId, paymentStatus, paymentMethod])

  useEffect(() => {
    setPage(1)
  }, [search, status, supplierId, paymentStatus, paymentMethod, periodPreset, customPeriod])

  const { purchases, meta, isLoading, error, mutate } = usePurchases({
    search,
    page,
    columnFilters,
    dateRange,
  })

  const hasSearch = search.trim().length > 0
  const hasStatus = status !== "all"
  const hasSupplier = supplierId != null
  const hasPaymentStatus = paymentStatus !== "all"
  const hasPaymentMethod = paymentMethod !== "all"
  const hasPeriodFilter = periodPreset !== "all"
  const hasAnyFilter =
    hasSearch || hasStatus || hasSupplier || hasPaymentStatus || hasPaymentMethod || hasPeriodFilter

  const isEmpty = !isLoading && purchases.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: PurchasesViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const toggleShowKPI = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showKPI: value }))
  }, [])

  const toggleShowFilters = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showFilters: value }))
  }, [])

  const handlePeriodPresetChange = useCallback((preset: PurchasesPeriodPreset) => {
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

  const setColumnVisibility = useCallback((columns: PurchaseTableColumnId[]) => {
    setVisibleColumns(normalizePurchaseVisibleColumns(columns))
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
    status,
    setStatus,
    supplierId,
    setSupplierId,
    paymentStatus,
    setPaymentStatus,
    paymentMethod,
    setPaymentMethod,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    columnFilters,
    purchases,
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
