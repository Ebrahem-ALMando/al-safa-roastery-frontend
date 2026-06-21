"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { Patient } from "../types/patient.types"

/**
 * BFF GET `patients/{id}` — one resource in `data`.
 */
export function usePatient(id: number | null) {
  const key = useMemo(
    () => (id != null && id > 0 ? `patient:${id}` : null),
    [id]
  )
  const endpoint =
    id != null && id > 0 ? `patients/${id}` : "patients/placeholder"
  const q = useApiQuery<Patient>(key, endpoint, undefined)
  return {
    patient: q.data,
    isLoading: q.isLoading,
    error: q.error,
    mutate: q.mutate,
  }
}
