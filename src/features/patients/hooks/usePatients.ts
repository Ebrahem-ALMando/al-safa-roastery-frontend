"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { Patient, PatientsListMeta, PatientsListFilters } from "../types/patient.types"
import type { QueryParams } from "@/lib/api"
import { operationalDateScopeQueryKeysForPage } from "@/lib/date-scope/operational-date-scope-query-mapping"
import type { ResolvedOperationalDateRange } from "@/lib/date-scope/operational-date-scope.types"
import { appendOperationalDateRangeToQueryParams } from "@/lib/date-scope/operational-date-scope-query"

const ENDPOINT = "patients"

function buildQueryParams(
  page: number,
  filters: Omit<PatientsListFilters, "page" | "created_from" | "created_to">,
  dateRange: ResolvedOperationalDateRange | null
): QueryParams {
  const q: QueryParams = { page }
  if (filters.search != null && String(filters.search).trim() !== "") {
    q.search = String(filters.search).trim()
  }
  if (filters.patient_number != null && String(filters.patient_number).trim() !== "") {
    q.patient_number = String(filters.patient_number).trim()
  }
  if (filters.national_id != null && String(filters.national_id).trim() !== "") {
    q.national_id = String(filters.national_id).trim()
  }
  if (filters.full_name != null && String(filters.full_name).trim() !== "") {
    q.full_name = String(filters.full_name).trim()
  }
  if (filters.phone != null && String(filters.phone).trim() !== "") {
    q.phone = String(filters.phone).trim()
  }
  if (filters.gender != null && String(filters.gender).trim() !== "") {
    q.gender = String(filters.gender).trim()
  }
  if (typeof filters.is_active === "boolean") {
    q.is_active = filters.is_active ? 1 : 0
  }
  return appendOperationalDateRangeToQueryParams(q, dateRange, operationalDateScopeQueryKeysForPage("patients"))
}

type UsePatientsArgs = {
  page: number
  /** Non-search filters (not debounced). */
  columnFilters: Omit<PatientsListFilters, "search" | "page" | "created_from" | "created_to">
  /** Debounced in parent (300ms). */
  search: string
  perPage?: number
  /** نطاق تاريخ الإنشاء الأساسي للقائمة؛ null = لا قيود. */
  dateRange: ResolvedOperationalDateRange | null
}

export function usePatients({ page, search, columnFilters, perPage, dateRange }: UsePatientsArgs) {
  const queryParams = useMemo(() => {
    const q = buildQueryParams(page, {
      ...columnFilters,
      search: search.trim() || undefined,
    }, dateRange)
    if (typeof perPage === "number") {
      q.per_page = Math.min(100, Math.max(1, perPage))
    }
    return q
  }, [page, search, columnFilters, perPage, dateRange])

  const swrKey = useMemo(
    () => `patients:${JSON.stringify(queryParams)}`,
    [queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Patient[]>(
    swrKey,
    ENDPOINT,
    { queryParams }
  )

  return {
    patients: data ?? [],
    meta: meta as PatientsListMeta | undefined,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
