"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import {
  DEFAULT_VISIBLE_PRODUCT_COLUMNS,
  PRODUCTS_PAGE_CONFIG_KEY,
  PRODUCTS_PERIOD_STORAGE_KEY,
  PRODUCTS_TABLE_COLUMNS_STORAGE_KEY,
  type ProductTableColumnId,
  type ProductsCustomPeriod,
  type ProductsPeriodPreset,
  type ProductsViewMode,
  normalizeProductVisibleColumns,
} from "../lib/products.constants"
import {
  defaultCustomPeriod,
  readStoredProductsPeriod,
  resolveProductsPeriodRange,
} from "../lib/products.helpers"
import type { ProductPriceStatus, ProductStockStatus } from "../types/product.types"
import { useProducts } from "./useProducts"

export interface ProductsPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: ProductsViewMode
}

const defaultConfig: ProductsPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): ProductsPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(PRODUCTS_PAGE_CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<ProductsPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

function readColumnVisibility(): ProductTableColumnId[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_PRODUCT_COLUMNS
  try {
    const raw = localStorage.getItem(PRODUCTS_TABLE_COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_VISIBLE_PRODUCT_COLUMNS
    const parsed = JSON.parse(raw) as ProductTableColumnId[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_VISIBLE_PRODUCT_COLUMNS
    return normalizeProductVisibleColumns(parsed)
  } catch {
    return DEFAULT_VISIBLE_PRODUCT_COLUMNS
  }
}

export type ProductsActiveStatus = "all" | "active" | "inactive"
export type ProductsPriceStatusFilter = ProductPriceStatus | "all"
export type ProductsStockStatusFilter = ProductStockStatus | "all"
export type ProductsLinkedItemFilter = { id: number; label: string }

export function useProductsPage() {
  const [periodPreset, setPeriodPreset] = useState<ProductsPeriodPreset>(() =>
    typeof window !== "undefined" ? readStoredProductsPeriod().preset : "current_month"
  )
  const [customPeriod, setCustomPeriod] = useState<ProductsCustomPeriod | null>(() =>
    typeof window !== "undefined" ? readStoredProductsPeriod().custom : null
  )
  const [customDialogOpen, setCustomDialogOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<ProductsActiveStatus>("all")
  const [priceStatus, setPriceStatus] = useState<ProductsPriceStatusFilter>("all")
  const [stockStatus, setStockStatus] = useState<ProductsStockStatusFilter>("all")
  const [linkedItems, setLinkedItems] = useState<ProductsLinkedItemFilter[]>([])
  const [page, setPageState] = useState(1)
  const [config, setConfig] = useState<ProductsPageConfig>(() =>
    typeof window !== "undefined" ? readConfig() : defaultConfig
  )
  const [visibleColumns, setVisibleColumns] = useState<ProductTableColumnId[]>(
    () => (typeof window !== "undefined" ? readColumnVisibility() : DEFAULT_VISIBLE_PRODUCT_COLUMNS)
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PRODUCTS_PAGE_CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PRODUCTS_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(PRODUCTS_PERIOD_STORAGE_KEY, JSON.stringify({ preset: periodPreset, custom: customPeriod }))
  }, [periodPreset, customPeriod])

  const dateRange = useMemo(
    (): ResolvedOperationalDateRange | null => resolveProductsPeriodRange(periodPreset, customPeriod),
    [periodPreset, customPeriod]
  )

  const columnFilters = useMemo(
    () => ({
      is_active: isActive === "all" ? undefined : isActive === "active",
      price_status: priceStatus !== "all" ? priceStatus : undefined,
      stock_status: stockStatus !== "all" ? stockStatus : undefined,
      linked_item_ids: linkedItems.map((item) => item.id),
    }),
    [isActive, priceStatus, stockStatus, linkedItems]
  )

  const { products, meta, isLoading, error, mutate } = useProducts({
    search,
    page,
    columnFilters,
    dateRange,
  })

  const hasAnyFilter =
    search.trim().length > 0 ||
    isActive !== "all" ||
    priceStatus !== "all" ||
    stockStatus !== "all" ||
    linkedItems.length > 0 ||
    periodPreset !== "all"

  const isEmpty = !isLoading && products.length === 0
  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1

  const setViewMode = useCallback((viewMode: ProductsViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const toggleShowKPI = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showKPI: value }))
  }, [])

  const toggleShowFilters = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showFilters: value }))
  }, [])

  const handlePeriodPresetChange = useCallback((preset: ProductsPeriodPreset) => {
    setPageState(1)
    if (preset === "custom") {
      setCustomPeriod((prev) => prev ?? defaultCustomPeriod())
      setCustomDialogOpen(true)
      setPeriodPreset("custom")
      return
    }
    setPeriodPreset(preset)
  }, [])

  const applyCustomPeriod = useCallback((from: string, to: string) => {
    setPageState(1)
    setCustomPeriod({ from, to })
    setPeriodPreset("custom")
    setCustomDialogOpen(false)
  }, [])

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage)
  }, [])

  const updateSearch = useCallback((value: string) => {
    setPageState(1)
    setSearch(value)
  }, [])

  const updateIsActive = useCallback((value: ProductsActiveStatus) => {
    setPageState(1)
    setIsActive(value)
  }, [])

  const updatePriceStatus = useCallback((value: ProductsPriceStatusFilter) => {
    setPageState(1)
    setPriceStatus(value)
  }, [])

  const updateStockStatus = useCallback((value: ProductsStockStatusFilter) => {
    setPageState(1)
    setStockStatus(value)
  }, [])

  const updateLinkedItems = useCallback((value: ProductsLinkedItemFilter[]) => {
    setPageState(1)
    setLinkedItems(value)
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
    setSearch: updateSearch,
    isActive,
    setIsActive: updateIsActive,
    priceStatus,
    setPriceStatus: updatePriceStatus,
    stockStatus,
    setStockStatus: updateStockStatus,
    linkedItems,
    setLinkedItems: updateLinkedItems,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility: (columns: ProductTableColumnId[]) =>
      setVisibleColumns(normalizeProductVisibleColumns(columns)),
    products,
    meta,
    isLoading,
    error,
    mutate,
    hasAnyFilter,
    isTrueEmpty: isEmpty && !hasAnyFilter,
    isFilteredNoHits: isEmpty && hasAnyFilter,
    currentPage,
    lastPage,
    canPrev: currentPage > 1,
    canNext: currentPage < lastPage,
  }
}
