"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import {
  CASHBOX_PAGE_CONFIG_KEY,
  CASHBOX_PERIOD_STORAGE_KEY,
  CASHBOX_TABLE_COLUMNS_STORAGE_KEY,
  DEFAULT_VISIBLE_CASHBOX_COLUMNS,
  normalizeCashboxColumns,
  type CashboxCustomPeriod,
  type CashboxPeriodPreset,
  type CashboxTableColumnId,
  type CashboxViewMode,
} from "../lib/cashbox.constants"
import { defaultCashboxPeriod, readCashboxPeriod, resolveCashboxPeriod } from "../lib/cashbox.helpers"
import type {
  CashboxDirection,
  CashboxFilters,
  CashboxPaymentMethod,
  CashboxTransactionType,
} from "../types/cashbox.types"
import { useCashboxSummary } from "./useCashboxSummary"
import { useCashboxTransactions } from "./useCashboxTransactions"

type PageConfig = { showKPI: boolean; showFilters: boolean; viewMode: CashboxViewMode }
const DEFAULT_CONFIG: PageConfig = { showKPI: true, showFilters: true, viewMode: "table" }

export function useCashboxPage() {
  const [hydrated, setHydrated] = useState(false)
  const [periodPreset, setPeriodPresetState] = useState<CashboxPeriodPreset>("current_month")
  const [customPeriod, setCustomPeriod] = useState<CashboxCustomPeriod | null>(null)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [direction, setDirection] = useState<CashboxDirection | "all">("all")
  const [sourceType, setSourceType] = useState("all")
  const [paymentMethod, setPaymentMethod] = useState<CashboxPaymentMethod | "all">("all")
  const [transactionType, setTransactionType] = useState<CashboxTransactionType | "all">("all")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG)
  const [visibleColumns, setVisibleColumns] = useState<CashboxTableColumnId[]>(DEFAULT_VISIBLE_CASHBOX_COLUMNS)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const period = readCashboxPeriod()
      setPeriodPresetState(period.preset)
      setCustomPeriod(period.custom)
      try {
        const storedConfig = localStorage.getItem(CASHBOX_PAGE_CONFIG_KEY)
        if (storedConfig) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) })
        const storedColumns = localStorage.getItem(CASHBOX_TABLE_COLUMNS_STORAGE_KEY)
        if (storedColumns) setVisibleColumns(normalizeCashboxColumns(JSON.parse(storedColumns)))
      } catch {
        /* Keep safe defaults when stored preferences are invalid. */
      }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(CASHBOX_PAGE_CONFIG_KEY, JSON.stringify(config))
  }, [config, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(CASHBOX_TABLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [visibleColumns, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(CASHBOX_PERIOD_STORAGE_KEY, JSON.stringify({ preset: periodPreset, custom: customPeriod }))
  }, [periodPreset, customPeriod, hydrated])
  useEffect(() => {
    const timer = window.setTimeout(() => setPage(1), 0)
    return () => window.clearTimeout(timer)
  }, [debouncedSearch, direction, sourceType, paymentMethod, transactionType, periodPreset, customPeriod])

  const dateRange = useMemo(() => resolveCashboxPeriod(periodPreset, customPeriod), [periodPreset, customPeriod])
  const sharedFilters = useMemo<Omit<CashboxFilters, "page" | "per_page" | "sort_by" | "sort_direction">>(() => ({
    search: debouncedSearch || undefined,
    type: direction === "all" ? undefined : direction,
    source_type: sourceType === "all" ? undefined : sourceType,
    payment_method: paymentMethod === "all" ? undefined : paymentMethod,
    transaction_type: transactionType === "all" ? undefined : transactionType,
    date_from: dateRange?.from,
    date_to: dateRange?.to,
  }), [debouncedSearch, direction, sourceType, paymentMethod, transactionType, dateRange])
  const listFilters = useMemo<CashboxFilters>(() => ({
    ...sharedFilters,
    page,
    per_page: 15,
    sort_by: "transaction_date",
    sort_direction: "desc",
  }), [sharedFilters, page])

  const transactionsQuery = useCashboxTransactions(listFilters, hydrated)
  const summaryQuery = useCashboxSummary(sharedFilters, hydrated)
  const setPeriodPreset = useCallback((preset: CashboxPeriodPreset) => {
    if (preset === "custom") {
      setCustomPeriod((value) => value ?? defaultCashboxPeriod())
      setCustomDialogOpen(true)
    }
    setPeriodPresetState(preset)
  }, [])
  const resetFilters = useCallback(() => {
    setSearch("")
    setDirection("all")
    setSourceType("all")
    setPaymentMethod("all")
    setTransactionType("all")
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
    search,
    setSearch,
    direction,
    setDirection,
    sourceType,
    setSourceType,
    paymentMethod,
    setPaymentMethod,
    transactionType,
    setTransactionType,
    resetFilters,
    page,
    setPage,
    config,
    setViewMode: (viewMode: CashboxViewMode) => setConfig((value) => ({ ...value, viewMode })),
    toggleShowKPI: (showKPI: boolean) => setConfig((value) => ({ ...value, showKPI })),
    toggleShowFilters: (showFilters: boolean) => setConfig((value) => ({ ...value, showFilters })),
    visibleColumns,
    setVisibleColumns: (columns: CashboxTableColumnId[]) => setVisibleColumns(normalizeCashboxColumns(columns)),
    ...transactionsQuery,
    summary: summaryQuery.summary,
    summaryIsLoading: summaryQuery.isLoading,
    summaryError: summaryQuery.error,
  }
}
