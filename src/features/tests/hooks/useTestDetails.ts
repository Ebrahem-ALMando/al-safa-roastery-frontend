"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { Test } from "../types/test.types"

type UseTestDetailsArgs = {
  id: number | null
  enabled?: boolean
}

export function useTestDetails({ id, enabled = true }: UseTestDetailsArgs) {
  const canFetch = enabled && typeof id === "number"
  const endpoint = useMemo(() => (typeof id === "number" ? `tests/${id}` : ""), [id])
  const swrKey = useMemo(
    () => (canFetch && typeof id === "number" ? `test:${id}` : null),
    [canFetch, id]
  )

  const { data, isLoading, error, mutate } = useApiQuery<Test>(
    swrKey,
    endpoint
  )

  return {
    test: data ?? null,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
