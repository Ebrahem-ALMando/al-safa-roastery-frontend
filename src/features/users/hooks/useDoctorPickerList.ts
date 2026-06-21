"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue"
import type { QueryParams } from "@/lib/api"
import type { DoctorPickerRow, DoctorUser, UserListMeta } from "../types/user.types"

const ENDPOINT = "auth/doctors"
const PICKER_PER_PAGE = 100

function mapDoctor(u: DoctorUser): DoctorPickerRow {
  return {
    id: String(u.id),
    name: u.name,
    username: u.username,
    email: u.email,
    isActive: Boolean(u.is_active),
  }
}

type UseDoctorPickerListArgs = {
  open: boolean
  search: string
  debounceMs?: number
}

export function useDoctorPickerList({
  open,
  search,
  debounceMs = 350,
}: UseDoctorPickerListArgs) {
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
    () => (open ? `doctor-picker:${JSON.stringify(queryParams)}` : null),
    [open, queryParams]
  )

  const { data, meta, isLoading, error, mutate } = useApiQuery<DoctorUser[]>(
    swrKey,
    ENDPOINT,
    { queryParams }
  )

  const rows = useMemo(() => (data ?? []).map(mapDoctor), [data])
  const listMeta = meta as UserListMeta | undefined

  return {
    rows,
    meta: listMeta,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
    isSearchPending: open && debouncedSearch !== search,
  }
}
