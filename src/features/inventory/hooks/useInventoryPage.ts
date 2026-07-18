"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { DEFAULT_VISIBLE_INVENTORY_COLUMNS, INVENTORY_PAGE_CONFIG_KEY, INVENTORY_PERIOD_STORAGE_KEY, INVENTORY_TABLE_COLUMNS_STORAGE_KEY, normalizeInventoryColumns, type InventoryCustomPeriod, type InventoryPeriodPreset, type InventoryTableColumnId, type InventoryViewMode } from "../lib/inventory.constants"
import { defaultInventoryPeriod, readInventoryPeriod, resolveInventoryPeriod } from "../lib/inventory.helpers"
import type { InventoryItemType, InventoryMovementPickerItem, InventoryStockStatusFilter } from "../types/inventory.types"
import { useInventoryItems } from "./useInventoryItems"

type Config = { showKPI: boolean; showFilters: boolean; viewMode: InventoryViewMode }
const DEFAULT_CONFIG: Config = { showKPI: true, showFilters: true, viewMode: "table" }

export function useInventoryPage() {
  const [hydrated, setHydrated] = useState(false)
  const [periodPreset, setPeriodPresetState] = useState<InventoryPeriodPreset>("current_month")
  const [customPeriod, setCustomPeriod] = useState<InventoryCustomPeriod | null>(null)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [search, setSearch] = useState(""); const debouncedSearch = useDebouncedValue(search, 300)
  const [itemType, setItemType] = useState<InventoryItemType | "all">("all")
  const [stockStatus, setStockStatus] = useState<InventoryStockStatusFilter | "all">("all")
  const [selectedItems, setSelectedItems] = useState<InventoryMovementPickerItem[]>([])
  const [quantityMin, setQuantityMin] = useState(""); const [quantityMax, setQuantityMax] = useState("")
  const [page, setPage] = useState(1); const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [visibleColumns, setVisibleColumns] = useState<InventoryTableColumnId[]>(DEFAULT_VISIBLE_INVENTORY_COLUMNS)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const period = readInventoryPeriod(); setPeriodPresetState(period.preset); setCustomPeriod(period.custom)
      try { const storedConfig = localStorage.getItem(INVENTORY_PAGE_CONFIG_KEY); if (storedConfig) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) }); const storedColumns = localStorage.getItem(INVENTORY_TABLE_COLUMNS_STORAGE_KEY); if (storedColumns) setVisibleColumns(normalizeInventoryColumns(JSON.parse(storedColumns))) } catch { /* defaults */ }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])
  useEffect(() => { if (hydrated) localStorage.setItem(INVENTORY_PAGE_CONFIG_KEY, JSON.stringify(config)) }, [config, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem(INVENTORY_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns)) }, [visibleColumns, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem(INVENTORY_PERIOD_STORAGE_KEY, JSON.stringify({ preset: periodPreset, custom: customPeriod })) }, [periodPreset, customPeriod, hydrated])
  useEffect(() => { const timer = window.setTimeout(() => setPage(1), 0); return () => window.clearTimeout(timer) }, [debouncedSearch, itemType, stockStatus, selectedItems, quantityMin, quantityMax, periodPreset, customPeriod])

  const dateRange = useMemo(() => resolveInventoryPeriod(periodPreset, customPeriod), [periodPreset, customPeriod])
  const filters = useMemo(() => {
    const min = quantityMin.trim() === "" ? undefined : Number(quantityMin); const max = quantityMax.trim() === "" ? undefined : Number(quantityMax)
    return { page, search: debouncedSearch || undefined, item_type: itemType === "all" ? undefined : itemType, stock_status: stockStatus === "all" ? undefined : stockStatus, item_ids: selectedItems.map((item) => item.id), quantity_min: Number.isFinite(min) ? min : undefined, quantity_max: Number.isFinite(max) ? max : undefined, date_from: dateRange?.from, date_to: dateRange?.to }
  }, [page, debouncedSearch, itemType, stockStatus, selectedItems, quantityMin, quantityMax, dateRange])
  const query = useInventoryItems(filters, hydrated)
  const setPeriodPreset = useCallback((preset: InventoryPeriodPreset) => { if (preset === "custom") { setCustomPeriod((value) => value ?? defaultInventoryPeriod()); setCustomDialogOpen(true) }; setPeriodPresetState(preset) }, [])
  const resetFilters = useCallback(() => { setSearch(""); setItemType("all"); setStockStatus("all"); setSelectedItems([]); setQuantityMin(""); setQuantityMax("") }, [])
  return { hydrated, periodPreset, setPeriodPreset, customPeriod, customDialogOpen, setCustomDialogOpen, applyCustomPeriod: (from: string, to: string) => { setCustomPeriod({ from, to }); setPeriodPresetState("custom"); setCustomDialogOpen(false) }, dateRange, search, setSearch, itemType, setItemType, stockStatus, setStockStatus, selectedItems, setSelectedItems, quantityMin, setQuantityMin, quantityMax, setQuantityMax, resetFilters, page, setPage, config, setViewMode: (viewMode: InventoryViewMode) => setConfig((v) => ({ ...v, viewMode })), toggleShowKPI: (showKPI: boolean) => setConfig((v) => ({ ...v, showKPI })), toggleShowFilters: (showFilters: boolean) => setConfig((v) => ({ ...v, showFilters })), visibleColumns, setVisibleColumns: (columns: InventoryTableColumnId[]) => setVisibleColumns(normalizeInventoryColumns(columns)), filters, ...query }
}
