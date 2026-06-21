"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { LabOrder } from "../types/order.types"

type UseLabOrderArgs = {
  id: number | null
  enabled: boolean
}

export function useLabOrder({ id, enabled }: UseLabOrderArgs) {
  const key = useMemo(
    () => (enabled && id != null ? `lab-order-detail:${id}` : null),
    [enabled, id]
  )

  const endpoint = id != null ? `lab-orders/${id}` : "lab-orders"

  const { data, isLoading, error, mutate } = useApiQuery<LabOrder>(key, endpoint)

  return {
    order: data ?? null,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
