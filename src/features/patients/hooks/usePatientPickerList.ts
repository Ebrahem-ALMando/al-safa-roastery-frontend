"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import type { QueryParams } from "@/lib/api"
import type { Patient, PatientsListMeta } from "../types/patient.types"

const ENDPOINT = "patients"
const PICKER_PER_PAGE = 100

export type PatientPickerRow = {
  id: string
  name: string
  phone: string
  patientNumber: string
}

function mapPatient(p: Patient): PatientPickerRow {
  return {
    id: String(p.id),
    name: p.full_name,
    phone: p.phone?.trim() ? p.phone : "—",
    patientNumber: p.patient_number?.trim() ? p.patient_number : "—",
  }
}

type UsePatientPickerListArgs = {
  open: boolean
  /** نص البحث المرسل للسيرفر بعد debounce */
  search: string
  debounceMs?: number
}

export function usePatientPickerList({
  open,
  search,
  debounceMs = 350,
}: UsePatientPickerListArgs) {
  const debouncedSearch = useDebouncedValue(search, debounceMs)

  const queryParams = useMemo((): QueryParams => {
    const q: QueryParams = {
      page: 1,
      per_page: PICKER_PER_PAGE,
    }
    const s = debouncedSearch.trim()
    if (s !== "") {
      q.search = s
    }
    return q
  }, [debouncedSearch])

  const swrKey = useMemo(
    () => (open ? `patient-picker:${JSON.stringify(queryParams)}` : null),
    [open, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<Patient[]>(
    swrKey,
    ENDPOINT,
    { queryParams }
  )

  const rows = useMemo(() => (data ?? []).map(mapPatient), [data])
  const listMeta = meta as PatientsListMeta | undefined

  return {
    rows,
    meta: listMeta,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
    isSearchPending: open && debouncedSearch !== search,
  }
}
