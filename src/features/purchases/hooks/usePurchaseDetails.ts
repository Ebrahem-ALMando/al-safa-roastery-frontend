"use client"

import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { PurchaseInvoice } from "../types/purchase.types"

export function usePurchaseDetails(id: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const authReady = !authLoading && isAuthenticated

  const swrKey = id != null && authReady ? `purchase:${id}` : null
  const endpoint = id != null ? `purchase-invoices/${id}` : ""

  const { data, isLoading, error, mutate } = useApiQuery<PurchaseInvoice>(swrKey, endpoint)

  return {
    purchase: data,
    isLoading: authLoading || !authReady || Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
