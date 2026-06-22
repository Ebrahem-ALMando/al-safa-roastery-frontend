"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import {
  DEFAULT_VISIBLE_ITEM_COLUMNS,
  ITEMS_PAGE_CONFIG_KEY,
  ITEMS_PERIOD_STORAGE_KEY,
  ITEMS_TABLE_COLUMNS_STORAGE_KEY,
  type ItemTableColumnId,
  type ItemsCustomPeriod,
  type ItemsPeriodPreset,
  type ItemsViewMode,
  normalizeItemVisibleColumns,
} from "../lib/items.constants"
import {
  defaultCustomPeriod,
  readStoredItemsPeriod,
  resolveItemsPeriodRange,
  resolveQuantityRangeQuery,
} from "../lib/items.helpers"
import type { ItemType, StockStatusFilter } from "../types/item.types"
import { useItems } from "./useItems"

export interface ItemsPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: ItemsViewMode
}

const defaultConfig: ItemsPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): ItemsPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(ITEMS_PAGE_CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<ItemsPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

function readColumnVisibility(): ItemTableColumnId[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_ITEM_COLUMNS
  try {
    const raw = localStorage.getItem(ITEMS_TABLE_COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_VISIBLE_ITEM_COLUMNS
    const parsed = JSON.parse(raw) as ItemTableColumnId[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_VISIBLE_ITEM_COLUMNS
    return normalizeItemVisibleColumns(parsed)
  } catch {
    return DEFAULT_VISIBLE_ITEM_COLUMNS
  }
}

export type ItemsActiveStatus = "all" | "active" | "inactive"
export type ItemsTypeFilter = ItemType | "all"
export type ItemsStockStatusFilter = StockStatusFilter | "all"

export function useItemsPage() {
  const [periodPreset, setPeriodPreset] = useState<ItemsPeriodPreset>(() =>
    typeof window !== "undefined" ? readStoredItemsPeriod().preset : "current_month"
  )
  const [customPeriod, setCustomPeriod] = useState<ItemsCustomPeriod | null>(() =>
    typeof window !== "undefined" ? readStoredItemsPeriod().custom : null
  )
  const [customDialogOpen, setCustomDialogOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<ItemsActiveStatus>("all")
  const [itemType, setItemType] = useState<ItemsTypeFilter>("all")
  const [stockStatus, setStockStatus] = useState<ItemsStockStatusFilter>("all")
  const [quantityMin, setQuantityMin] = useState("")
  const [quantityMax, setQuantityMax] = useState("")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<ItemsPageConfig>(defaultConfig)
  const [visibleColumns, setVisibleColumns] = useState<ItemTableColumnId[]>(
    DEFAULT_VISIBLE_ITEM_COLUMNS
  )

  useEffect(() => {
    setConfig(readConfig())
    setVisibleColumns(readColumnVisibility())
    const period = readStoredItemsPeriod()
    setPeriodPreset(period.preset)
    setCustomPeriod(period.custom)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ITEMS_PAGE_CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ITEMS_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(
        ITEMS_PERIOD_STORAGE_KEY,
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
      resolveItemsPeriodRange(periodPreset, customPeriod),
    [periodPreset, customPeriod]
  )

  const columnFilters = useMemo(() => {
    const range = resolveQuantityRangeQuery(quantityMin, quantityMax)
    return {
      is_active: isActive === "all" ? undefined : isActive === "active",
      item_type: itemType !== "all" ? itemType : undefined,
      stock_status: stockStatus !== "all" ? stockStatus : undefined,
      quantity_min: range.quantity_min,
      quantity_max: range.quantity_max,
    }
  }, [isActive, itemType, stockStatus, quantityMin, quantityMax])

  useEffect(() => {
    setPage(1)
  }, [search, isActive, itemType, stockStatus, quantityMin, quantityMax, periodPreset, customPeriod])

  const { items, meta, isLoading, error, mutate } = useItems({
    search,
    page,
    columnFilters,
    dateRange,
  })

  const hasSearch = search.trim().length > 0
  const hasIsActive = isActive !== "all"
  const hasItemType = itemType !== "all"
  const hasStockStatus = stockStatus !== "all"
  const hasQuantityFilter = quantityMin.trim() !== "" || quantityMax.trim() !== ""
  const hasPeriodFilter = periodPreset !== "all"
  const hasAnyFilter =
    hasSearch || hasIsActive || hasItemType || hasStockStatus || hasQuantityFilter || hasPeriodFilter

  const isEmpty = !isLoading && items.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: ItemsViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const toggleShowKPI = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showKPI: value }))
  }, [])

  const toggleShowFilters = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showFilters: value }))
  }, [])

  const handlePeriodPresetChange = useCallback((preset: ItemsPeriodPreset) => {
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

  const setColumnVisibility = useCallback((columns: ItemTableColumnId[]) => {
    setVisibleColumns(normalizeItemVisibleColumns(columns))
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
    itemType,
    setItemType,
    stockStatus,
    setStockStatus,
    quantityMin,
    setQuantityMin,
    quantityMax,
    setQuantityMax,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    items,
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
