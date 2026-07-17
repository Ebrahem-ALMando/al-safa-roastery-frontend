"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { QueryParams } from "@/lib/api"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import {
  STATEMENTS_PERIOD_STORAGE_KEY,
  type StatementCustomPeriod,
  type StatementPeriodPreset,
} from "../lib/statements.constants"
import { defaultStatementPeriod, readStatementPeriod, resolveStatementPeriod } from "../lib/statements.helpers"
import type { StatementEntityOption, StatementEntityType, StatementMovementDirection, StatementMovementEntryType, StatementQuery } from "../types/statement.types"
import { useStatement } from "./useStatement"

type InitialStatementSelection = {
  entityType?: StatementEntityType
  entityId?: number | null
}

export function useStatementPage(initial: InitialStatementSelection = {}) {
  const [hydrated, setHydrated] = useState(false)
  const [entityType, setEntityTypeState] = useState<StatementEntityType>(initial.entityType ?? "customer")
  const [selectedEntity, setSelectedEntity] = useState<StatementEntityOption | null>(() => initial.entityId ? {
    id: initial.entityId,
    name: `#${initial.entityId}`,
    code: null,
    phone: null,
  } : null)
  const [periodPreset, setPeriodPresetState] = useState<StatementPeriodPreset>("current_month")
  const [customPeriod, setCustomPeriod] = useState<StatementCustomPeriod | null>(null)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [movementSearch, setMovementSearch] = useState("")
  const [movementEntryType, setMovementEntryType] = useState<StatementMovementEntryType | "">("")
  const [movementDirection, setMovementDirection] = useState<StatementMovementDirection | "">("")
  const [movementAmountMin, setMovementAmountMin] = useState("")
  const [movementAmountMax, setMovementAmountMax] = useState("")
  const debouncedMovementSearch = useDebouncedValue(movementSearch, 300)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const period = readStatementPeriod()
      setPeriodPresetState(period.preset)
      setCustomPeriod(period.custom)
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STATEMENTS_PERIOD_STORAGE_KEY, JSON.stringify({ preset: periodPreset, custom: customPeriod }))
  }, [periodPreset, customPeriod, hydrated])

  const filters = useMemo(() => resolveStatementPeriod(periodPreset, customPeriod), [periodPreset, customPeriod])
  const amountMin = parseMovementAmount(movementAmountMin)
  const amountMax = parseMovementAmount(movementAmountMax)
  const movementAmountRangeInvalid = amountMin !== undefined && amountMax !== undefined && amountMax < amountMin
  const statementFilters = useMemo<StatementQuery>(() => ({
    ...filters,
    search: debouncedMovementSearch.trim() || undefined,
    entry_type: movementEntryType || undefined,
    direction: movementDirection || undefined,
    amount_min: movementAmountRangeInvalid ? undefined : amountMin,
    amount_max: movementAmountRangeInvalid ? undefined : amountMax,
  }), [filters, debouncedMovementSearch, movementEntryType, movementDirection, movementAmountRangeInvalid, amountMin, amountMax])
  const statementQuery = useStatement(entityType, selectedEntity?.id ?? null, statementFilters, hydrated)
  const setPeriodPreset = useCallback((preset: StatementPeriodPreset) => {
    if (preset === "custom") {
      setCustomPeriod((value) => value ?? defaultStatementPeriod())
      setCustomDialogOpen(true)
    }
    setPeriodPresetState(preset)
  }, [])
  const setEntityType = useCallback((type: StatementEntityType) => {
    setEntityTypeState(type)
    setSelectedEntity(null)
    setMovementSearch("")
    setMovementEntryType("")
    setMovementDirection("")
    setMovementAmountMin("")
    setMovementAmountMax("")
  }, [])

  return {
    hydrated,
    entityType,
    setEntityType,
    selectedEntity,
    setSelectedEntity,
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
    filters,
    movementSearch,
    setMovementSearch,
    movementEntryType,
    setMovementEntryType,
    movementDirection,
    setMovementDirection,
    movementAmountMin,
    setMovementAmountMin,
    movementAmountMax,
    setMovementAmountMax,
    movementAmountRangeInvalid,
    clearMovementFilters: () => {
      setMovementSearch("")
      setMovementEntryType("")
      setMovementDirection("")
      setMovementAmountMin("")
      setMovementAmountMax("")
    },
    ...statementQuery,
  }
}

function parseMovementAmount(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

type EntityApiRow = {
  id: number
  name: string
  code: string | null
  phone: string | null
}

export function useStatementEntityOptions(type: StatementEntityType, open: boolean, search: string) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const debouncedSearch = useDebouncedValue(search, 300)
  const endpoint = type === "customer" ? "customers" : "suppliers"
  const queryParams = useMemo<QueryParams>(() => {
    const params: QueryParams = { page: 1, per_page: 100, is_active: 1 }
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    return params
  }, [debouncedSearch])
  const ready = open && !authLoading && isAuthenticated
  const query = useApiQuery<EntityApiRow[]>(
    ready ? `statement-entity-options:${type}:${JSON.stringify(queryParams)}` : null,
    endpoint,
    { queryParams, paginated: true },
  )

  return {
    options: (query.data ?? []).map((entity) => ({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      phone: entity.phone,
    })),
    meta: query.meta,
    isLoading: ready && query.isLoading,
    isSearchPending: open && search !== debouncedSearch,
    error: query.error,
  }
}
