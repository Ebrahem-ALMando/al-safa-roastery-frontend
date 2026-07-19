"use client"

import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { ProductionBatch } from "../types/production.types"

export function useProductionDetails(id: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const ready = !authLoading && isAuthenticated && id !== null
  const result = useApiQuery<ProductionBatch>(ready ? `production-detail:${id}` : null, `production-batches/${id ?? 0}`)
  return { batch: result.data ?? null, isLoading: authLoading || (id !== null && (!ready || result.isLoading)), error: result.error, mutate: result.mutate }
}
