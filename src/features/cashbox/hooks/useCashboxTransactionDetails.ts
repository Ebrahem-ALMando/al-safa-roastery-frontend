"use client"

import { useApiQuery } from "@/lib/hooks/useApiQuery"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { CashboxTransaction } from "../types/cashbox.types"

export function useCashboxTransactionDetails(id: number | null, enabled = true) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const ready = enabled && id !== null && !authLoading && isAuthenticated
  const query = useApiQuery<CashboxTransaction>(ready ? `cashbox-transaction:${id}` : null, id ? `cashbox/transactions/${id}` : "")
  return { transaction: query.data, isLoading: authLoading || (ready && query.isLoading), error: query.error, mutate: query.mutate }
}
