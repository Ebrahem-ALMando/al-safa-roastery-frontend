"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import {
  CUSTOMERS_PAGE_CONFIG_KEY,
  CUSTOMERS_PERIOD_STORAGE_KEY,
  CUSTOMERS_TABLE_COLUMNS_STORAGE_KEY,
  DEFAULT_VISIBLE_CUSTOMER_COLUMNS,
  type CustomerTableColumnId,
  type CustomersCustomPeriod,
  type CustomersPeriodPreset,
  type CustomersViewMode,
  normalizeCustomerVisibleColumns,
} from "../lib/customers.constants"
import {
  defaultCustomPeriod,
  readStoredCustomersPeriod,
  resolveBalanceRangeQuery,
  resolveCustomersPeriodRange,
} from "../lib/customers.helpers"
import type {
  BalanceRangeDirection,
  BalanceStatusFilter,
  CustomerType,
} from "../types/customer.types"
import { useCustomers } from "./useCustomers"

export interface CustomersPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: CustomersViewMode
}

const defaultConfig: CustomersPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): CustomersPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(CUSTOMERS_PAGE_CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<CustomersPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

function readColumnVisibility(): CustomerTableColumnId[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE_CUSTOMER_COLUMNS
  try {
    const raw = localStorage.getItem(CUSTOMERS_TABLE_COLUMNS_STORAGE_KEY)
    if (!raw) return DEFAULT_VISIBLE_CUSTOMER_COLUMNS
    const parsed = JSON.parse(raw) as CustomerTableColumnId[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_VISIBLE_CUSTOMER_COLUMNS
    return normalizeCustomerVisibleColumns(parsed)
  } catch {
    return DEFAULT_VISIBLE_CUSTOMER_COLUMNS
  }
}

export type CustomersActiveStatus = "all" | "active" | "inactive"
export type CustomersTypeFilter = CustomerType | "all"

export function useCustomersPage() {
  const [periodPreset, setPeriodPreset] = useState<CustomersPeriodPreset>(() =>
    typeof window !== "undefined" ? readStoredCustomersPeriod().preset : "current_month"
  )
  const [customPeriod, setCustomPeriod] = useState<CustomersCustomPeriod | null>(() =>
    typeof window !== "undefined" ? readStoredCustomersPeriod().custom : null
  )
  const [customDialogOpen, setCustomDialogOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [isActive, setIsActive] = useState<CustomersActiveStatus>("all")
  const [customerType, setCustomerType] = useState<CustomersTypeFilter>("all")
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatusFilter | "all">("all")
  const [balanceMin, setBalanceMin] = useState("")
  const [balanceMax, setBalanceMax] = useState("")
  const [balanceRangeDirection, setBalanceRangeDirection] = useState<BalanceRangeDirection | null>(
    null
  )
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<CustomersPageConfig>(defaultConfig)
  const [visibleColumns, setVisibleColumns] = useState<CustomerTableColumnId[]>(
    DEFAULT_VISIBLE_CUSTOMER_COLUMNS
  )

  useEffect(() => {
    setConfig(readConfig())
    setVisibleColumns(readColumnVisibility())
    const period = readStoredCustomersPeriod()
    setPeriodPreset(period.preset)
    setCustomPeriod(period.custom)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CUSTOMERS_PAGE_CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CUSTOMERS_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    }
  }, [visibleColumns])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(
        CUSTOMERS_PERIOD_STORAGE_KEY,
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
      resolveCustomersPeriodRange(periodPreset, customPeriod),
    [periodPreset, customPeriod]
  )

  const columnFilters = useMemo(() => {
    const range = resolveBalanceRangeQuery(balanceMin, balanceMax, balanceRangeDirection)
    return {
      is_active: isActive === "all" ? undefined : isActive === "active",
      customer_type: customerType !== "all" ? customerType : undefined,
      balance_status: balanceStatus !== "all" ? (balanceStatus as BalanceStatusFilter) : undefined,
      balance_min: range.balance_min,
      balance_max: range.balance_max,
    }
  }, [isActive, customerType, balanceStatus, balanceMin, balanceMax, balanceRangeDirection])

  useEffect(() => {
    setPage(1)
  }, [
    search,
    isActive,
    customerType,
    balanceStatus,
    balanceMin,
    balanceMax,
    balanceRangeDirection,
    periodPreset,
    customPeriod,
  ])

  const { customers, meta, isLoading, error, mutate } = useCustomers({
    search,
    page,
    columnFilters,
    dateRange,
  })

  const hasSearch = search.trim().length > 0
  const hasIsActive = isActive !== "all"
  const hasCustomerType = customerType !== "all"
  const hasBalanceFilter =
    balanceStatus !== "all" || balanceMin.trim() !== "" || balanceMax.trim() !== ""
  const hasPeriodFilter = periodPreset !== "all"
  const hasAnyFilter =
    hasSearch || hasIsActive || hasCustomerType || hasBalanceFilter || hasPeriodFilter

  const isEmpty = !isLoading && customers.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: CustomersViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const toggleShowKPI = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showKPI: value }))
  }, [])

  const toggleShowFilters = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showFilters: value }))
  }, [])

  const handlePeriodPresetChange = useCallback((preset: CustomersPeriodPreset) => {
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

  const setColumnVisibility = useCallback((columns: CustomerTableColumnId[]) => {
    setVisibleColumns(normalizeCustomerVisibleColumns(columns))
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
    customerType,
    setCustomerType,
    balanceStatus,
    setBalanceStatus,
    balanceMin,
    setBalanceMin,
    balanceMax,
    setBalanceMax,
    balanceRangeDirection,
    setBalanceRangeDirection,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    visibleColumns,
    setColumnVisibility,
    customers,
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
