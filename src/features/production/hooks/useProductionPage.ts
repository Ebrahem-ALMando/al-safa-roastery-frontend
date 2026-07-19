"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  DEFAULT_VISIBLE_PRODUCTION_COLUMNS,
  PRODUCTION_PAGE_CONFIG_KEY,
  PRODUCTION_PERIOD_STORAGE_KEY,
  PRODUCTION_TABLE_COLUMNS_STORAGE_KEY,
  normalizeProductionColumns,
  type ProductionCustomPeriod,
  type ProductionPeriodPreset,
  type ProductionTableColumnId,
  type ProductionViewMode,
} from "../lib/production.constants"
import { defaultProductionPeriod, readProductionPeriod, resolveProductionPeriodRange } from "../lib/production.helpers"
import type { ProductionFilterItem, ProductionStatus } from "../types/production.types"
import { useProductionBatches } from "./useProductionBatches"

type PageConfig = { showKPI: boolean; showFilters: boolean; viewMode: ProductionViewMode }
const DEFAULT_CONFIG: PageConfig = { showKPI: true, showFilters: true, viewMode: "table" }

function readConfig(): PageConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG
  try {
    const value = JSON.parse(localStorage.getItem(PRODUCTION_PAGE_CONFIG_KEY) ?? "{}") as Partial<PageConfig>
    return { showKPI: value.showKPI ?? true, showFilters: value.showFilters ?? true, viewMode: value.viewMode === "cards" ? "cards" : "table" }
  } catch { return DEFAULT_CONFIG }
}

function readColumns(): ProductionTableColumnId[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_PRODUCTION_COLUMNS
  try {
    const value = JSON.parse(localStorage.getItem(PRODUCTION_TABLE_COLUMNS_STORAGE_KEY) ?? "[]") as ProductionTableColumnId[]
    return Array.isArray(value) && value.length > 0 ? normalizeProductionColumns(value) : DEFAULT_VISIBLE_PRODUCTION_COLUMNS
  } catch { return DEFAULT_VISIBLE_PRODUCTION_COLUMNS }
}

export function useProductionPage() {
  const storedPeriod = typeof window !== "undefined" ? readProductionPeriod() : { preset: "current_month" as ProductionPeriodPreset, custom: null }
  const [periodPreset, setPeriodPresetState] = useState<ProductionPeriodPreset>(storedPeriod.preset)
  const [customPeriod, setCustomPeriod] = useState<ProductionCustomPeriod | null>(storedPeriod.custom)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [search, setSearchState] = useState("")
  const [status, setStatusState] = useState<ProductionStatus | "all">("all")
  const [outputItem, setOutputItemState] = useState<ProductionFilterItem | null>(null)
  const [inputItems, setInputItemsState] = useState<ProductionFilterItem[]>([])
  const [quantityMin, setQuantityMinState] = useState("")
  const [quantityMax, setQuantityMaxState] = useState("")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<PageConfig>(readConfig)
  const [visibleColumns, setVisibleColumns] = useState<ProductionTableColumnId[]>(readColumns)

  useEffect(() => { localStorage.setItem(PRODUCTION_PAGE_CONFIG_KEY, JSON.stringify(config)) }, [config])
  useEffect(() => { localStorage.setItem(PRODUCTION_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns)) }, [visibleColumns])
  useEffect(() => { localStorage.setItem(PRODUCTION_PERIOD_STORAGE_KEY, JSON.stringify({ preset: periodPreset, custom: customPeriod })) }, [customPeriod, periodPreset])

  const dateRange = useMemo(() => resolveProductionPeriodRange(periodPreset, customPeriod), [customPeriod, periodPreset])
  const filters = useMemo(() => ({
    search: search.trim() || undefined,
    status: status === "all" ? undefined : status,
    output_item_id: outputItem?.id,
    input_item_ids: inputItems.map((item) => item.id),
    output_quantity_min: finiteNonNegative(quantityMin),
    output_quantity_max: finiteNonNegative(quantityMax),
    date_from: dateRange?.from,
    date_to: dateRange?.to,
    per_page: 15,
  }), [dateRange, inputItems, outputItem, quantityMax, quantityMin, search, status])
  const result = useProductionBatches(page, filters)
  const hasAnyFilter = Boolean(search.trim() || status !== "all" || outputItem || inputItems.length || quantityMin || quantityMax || periodPreset !== "all")
  const currentPage = result.meta?.current_page ?? page
  const lastPage = result.meta?.last_page ?? 1

  const resetPage = useCallback(<T,>(setter: (value: T) => void, value: T) => { setPage(1); setter(value) }, [])
  const setPeriodPreset = useCallback((value: ProductionPeriodPreset) => {
    setPage(1)
    if (value === "custom") {
      setCustomPeriod((current) => current ?? defaultProductionPeriod())
      setCustomDialogOpen(true)
    }
    setPeriodPresetState(value)
  }, [])

  return {
    periodPreset, setPeriodPreset, customPeriod, customDialogOpen, setCustomDialogOpen,
    applyCustomPeriod: (from: string, to: string) => { setPage(1); setCustomPeriod({ from, to }); setPeriodPresetState("custom"); setCustomDialogOpen(false) },
    dateRange, search, setSearch: (value: string) => resetPage(setSearchState, value),
    status, setStatus: (value: ProductionStatus | "all") => resetPage(setStatusState, value),
    outputItem, setOutputItem: (value: ProductionFilterItem | null) => resetPage(setOutputItemState, value),
    inputItems, setInputItems: (value: ProductionFilterItem[]) => resetPage(setInputItemsState, value),
    quantityMin, setQuantityMin: (value: string) => resetPage(setQuantityMinState, value),
    quantityMax, setQuantityMax: (value: string) => resetPage(setQuantityMaxState, value),
    page, setPage, config,
    setViewMode: (viewMode: ProductionViewMode) => setConfig((current) => ({ ...current, viewMode })),
    toggleShowKPI: (showKPI: boolean) => setConfig((current) => ({ ...current, showKPI })),
    toggleShowFilters: (showFilters: boolean) => setConfig((current) => ({ ...current, showFilters })),
    visibleColumns, setVisibleColumns: (columns: ProductionTableColumnId[]) => setVisibleColumns(normalizeProductionColumns(columns)),
    filters, ...result, hasAnyFilter,
    isTrueEmpty: !result.isLoading && result.batches.length === 0 && !hasAnyFilter,
    isFilteredNoHits: !result.isLoading && result.batches.length === 0 && hasAnyFilter,
    currentPage, lastPage, canPrev: currentPage > 1, canNext: currentPage < lastPage,
  }
}

function finiteNonNegative(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}
