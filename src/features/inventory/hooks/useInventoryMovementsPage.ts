"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import {
  DEFAULT_VISIBLE_INVENTORY_MOVEMENT_COLUMNS,
  INVENTORY_MOVEMENTS_PAGE_CONFIG_KEY,
  INVENTORY_MOVEMENTS_TABLE_COLUMNS_STORAGE_KEY,
  INVENTORY_PERIOD_STORAGE_KEY,
  normalizeInventoryMovementColumns,
  type InventoryCustomPeriod,
  type InventoryMovementTableColumnId,
  type InventoryPeriodPreset,
  type InventoryViewMode,
} from "../lib/inventory.constants"
import { defaultInventoryPeriod, readInventoryPeriod, resolveInventoryPeriod } from "../lib/inventory.helpers"
import type { InventoryDirectionFilter, InventoryMovementFilters, InventoryMovementPickerItem } from "../types/inventory.types"
import { useInventoryMovementSummary } from "./useInventoryMovementSummary"
import { useInventoryMovements } from "./useInventoryMovements"

type PageConfig = { showKPI: boolean; showFilters: boolean; viewMode: InventoryViewMode }
const DEFAULT_CONFIG: PageConfig = { showKPI: true, showFilters: true, viewMode: "table" }

function readInitialItemIds(): number[] {
  const params = new URLSearchParams(window.location.search)
  const values = [
    ...params.getAll("item_ids[]"),
    ...params.getAll("item_ids"),
    ...(params.get("item_id") ? [params.get("item_id") as string] : []),
  ]
  return [...new Set(values.flatMap((value) => value.split(",")).map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0))]
}

export function useInventoryMovementsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)
  const [urlFiltersReady, setUrlFiltersReady] = useState(false)
  const [periodPreset, setPeriodPresetState] = useState<InventoryPeriodPreset>("current_month")
  const [customPeriod, setCustomPeriod] = useState<InventoryCustomPeriod | null>(null)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [selectedItems, setSelectedItems] = useState<InventoryMovementPickerItem[]>([])
  const [pendingUrlItemIds, setPendingUrlItemIds] = useState<number[]>([])
  const [movementType, setMovementType] = useState("all")
  const [direction, setDirection] = useState<InventoryDirectionFilter | "all">("all")
  const [sourceType, setSourceType] = useState("all")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG)
  const [visibleColumns, setVisibleColumns] = useState<InventoryMovementTableColumnId[]>(DEFAULT_VISIBLE_INVENTORY_MOVEMENT_COLUMNS)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const period = readInventoryPeriod()
      setPeriodPresetState(period.preset)
      setCustomPeriod(period.custom)
      const initialIds = readInitialItemIds()
      setPendingUrlItemIds(initialIds)
      setSelectedItems(initialIds.map((id) => ({ id, code: "", name: `الصنف #${id}`, item_type: "raw" })))
      setUrlFiltersReady(true)
      try {
        const storedConfig = localStorage.getItem(INVENTORY_MOVEMENTS_PAGE_CONFIG_KEY)
        if (storedConfig) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) })
        const storedColumns = localStorage.getItem(INVENTORY_MOVEMENTS_TABLE_COLUMNS_STORAGE_KEY)
        if (storedColumns) setVisibleColumns(normalizeInventoryMovementColumns(JSON.parse(storedColumns)))
      } catch {
        // Keep defaults when stored preferences are invalid.
      }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const initialItemsQuery = useApiQuery<InventoryMovementPickerItem[]>(
    hydrated && pendingUrlItemIds.length > 0 ? `inventory-initial-items:${pendingUrlItemIds.join(",")}` : null,
    "items/picker",
    { queryParams: { item_ids: pendingUrlItemIds, limit: Math.max(1, pendingUrlItemIds.length) } }
  )

  useEffect(() => {
    if (!initialItemsQuery.data || initialItemsQuery.data.length === 0) return
    const timer = window.setTimeout(() => {
      const resolved = new Map(initialItemsQuery.data?.map((item) => [item.id, item]) ?? [])
      setSelectedItems((current) => current.map((item) => resolved.get(item.id) ?? item))
      setPendingUrlItemIds([])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [initialItemsQuery.data])

  useEffect(() => {
    if (hydrated) localStorage.setItem(INVENTORY_MOVEMENTS_PAGE_CONFIG_KEY, JSON.stringify(config))
  }, [config, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(INVENTORY_MOVEMENTS_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [visibleColumns, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(INVENTORY_PERIOD_STORAGE_KEY, JSON.stringify({ preset: periodPreset, custom: customPeriod }))
  }, [periodPreset, customPeriod, hydrated])
  useEffect(() => {
    if (!hydrated || !urlFiltersReady) return
    const params = new URLSearchParams(window.location.search)
    params.delete("item_ids[]")
    params.delete("item_ids")
    params.delete("item_id")
    selectedItems.forEach((item) => params.append("item_ids[]", String(item.id)))
    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    const currentUrl = `${window.location.pathname}${window.location.search}`
    if (nextUrl !== currentUrl) router.replace(nextUrl, { scroll: false })
  }, [hydrated, pathname, router, selectedItems, urlFiltersReady])
  useEffect(() => {
    const timer = window.setTimeout(() => setPage(1), 0)
    return () => window.clearTimeout(timer)
  }, [debouncedSearch, selectedItems, movementType, direction, sourceType, periodPreset, customPeriod])

  const dateRange = useMemo(() => resolveInventoryPeriod(periodPreset, customPeriod), [periodPreset, customPeriod])
  const sharedFilters = useMemo<Omit<InventoryMovementFilters, "page" | "per_page" | "sort_by" | "sort_direction">>(() => ({
    search: debouncedSearch || undefined,
    item_ids: selectedItems.map((item) => item.id),
    movement_type: movementType === "all" ? undefined : movementType,
    direction: direction === "all" ? undefined : direction,
    source_type: sourceType === "all" ? undefined : sourceType,
    date_from: dateRange?.from,
    date_to: dateRange?.to,
  }), [debouncedSearch, selectedItems, movementType, direction, sourceType, dateRange])
  const listFilters = useMemo<InventoryMovementFilters>(() => ({
    ...sharedFilters,
    page,
    per_page: 15,
    sort_by: "movement_date",
    sort_direction: "desc",
  }), [sharedFilters, page])

  const movementsQuery = useInventoryMovements(listFilters, false, hydrated)
  const summaryQuery = useInventoryMovementSummary(sharedFilters, hydrated)
  const setPeriodPreset = useCallback((preset: InventoryPeriodPreset) => {
    if (preset === "custom") {
      setCustomPeriod((value) => value ?? defaultInventoryPeriod())
      setCustomDialogOpen(true)
    }
    setPeriodPresetState(preset)
  }, [])
  const resetFilters = useCallback(() => {
    setSearch("")
    setSelectedItems([])
    setPendingUrlItemIds([])
    setMovementType("all")
    setDirection("all")
    setSourceType("all")
  }, [])

  return {
    hydrated,
    periodPreset,
    setPeriodPreset,
    customPeriod,
    customDialogOpen,
    setCustomDialogOpen,
    applyCustomPeriod: (from: string, to: string) => {
      setCustomPeriod({ from, to })
      setPeriodPresetState("custom")
      setCustomDialogOpen(false)
    },
    dateRange,
    search,
    setSearch,
    selectedItems,
    setSelectedItems,
    movementType,
    setMovementType,
    direction,
    setDirection,
    sourceType,
    setSourceType,
    resetFilters,
    page,
    setPage,
    config,
    setViewMode: (viewMode: InventoryViewMode) => setConfig((value) => ({ ...value, viewMode })),
    toggleShowKPI: (showKPI: boolean) => setConfig((value) => ({ ...value, showKPI })),
    toggleShowFilters: (showFilters: boolean) => setConfig((value) => ({ ...value, showFilters })),
    visibleColumns,
    setVisibleColumns: (columns: InventoryMovementTableColumnId[]) => setVisibleColumns(normalizeInventoryMovementColumns(columns)),
    ...movementsQuery,
    movementSummary: summaryQuery.summary,
    summaryIsLoading: summaryQuery.isLoading,
    summaryError: summaryQuery.error,
    mutateSummary: summaryQuery.mutate,
  }
}
