"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useOperationalDateScope } from "@/lib/hooks/useOperationalDateScope"
import { usePatients } from "./usePatients"

export type PatientsViewMode = "table" | "cards"

export interface PatientsPageConfig {
  showKPI: boolean
  showFilters: boolean
  viewMode: PatientsViewMode
}

const CONFIG_KEY = "patients-page-config"

const defaultConfig: PatientsPageConfig = {
  showKPI: true,
  showFilters: true,
  viewMode: "table",
}

function readConfig(): PatientsPageConfig {
  if (typeof window === "undefined") return defaultConfig
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Partial<PatientsPageConfig>
    return {
      showKPI: parsed.showKPI ?? true,
      showFilters: parsed.showFilters ?? true,
      viewMode: parsed.viewMode === "cards" ? "cards" : "table",
    }
  } catch {
    return defaultConfig
  }
}

export function usePatientsPage() {
  const { preset: dateScopePreset, setPreset: setDateScopePreset, dateRange } = useOperationalDateScope("patients")

  const [search, setSearch] = useState("")
  const [gender, setGender] = useState<string>("")
  const [isActive, setIsActive] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [config, setConfig] = useState<PatientsPageConfig>(defaultConfig)

  useEffect(() => {
    setConfig(readConfig())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    }
  }, [config])

  const columnFilters = useMemo(
    () => ({
      gender: gender || undefined,
      is_active: isActive === "all" ? undefined : isActive === "active",
    }),
    [gender, isActive]
  )

  useEffect(() => {
    setPage(1)
  }, [search, gender, isActive, dateScopePreset])

  const { patients, meta, isLoading, error, mutate } = usePatients({
    search,
    page,
    columnFilters,
    dateRange,
  })

  const hasSearch = search.trim().length > 0
  const hasGender = gender !== ""
  const hasIsActive = isActive !== "all"
  const hasDateScope = dateScopePreset !== "all"
  const hasAnyFilter = hasSearch || hasGender || hasIsActive || hasDateScope

  const isEmpty = !isLoading && patients.length === 0
  const isTrueEmpty = isEmpty && !hasAnyFilter
  const isFilteredNoHits = isEmpty && hasAnyFilter

  const currentPage = meta?.current_page ?? page
  const lastPage = meta?.last_page ?? 1
  const canPrev = currentPage > 1
  const canNext = currentPage < lastPage

  const setViewMode = useCallback((viewMode: PatientsViewMode) => {
    setConfig((prev) => ({ ...prev, viewMode }))
  }, [])

  const toggleShowKPI = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showKPI: value }))
  }, [])

  const toggleShowFilters = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, showFilters: value }))
  }, [])

  return {
    dateScopePreset,
    setDateScopePreset,
    search,
    setSearch,
    gender,
    setGender,
    isActive,
    setIsActive,
    page,
    setPage,
    config,
    setViewMode,
    toggleShowKPI,
    toggleShowFilters,
    patients,
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

