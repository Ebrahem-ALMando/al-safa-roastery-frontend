"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { PURCHASE_MESSAGES } from "../lib/purchases.messages"
import type { CancelPurchaseInput, PurchaseInvoice } from "../types/purchase.types"

function isPurchasesListKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("purchases:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("purchases:")
  }
  return false
}

function isPurchaseDetailKeyForId(k: unknown, id: number): boolean {
  const prefix = `purchase:${id}`
  if (typeof k === "string") return k === prefix
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return k[0] === prefix
  }
  return false
}

function isPurchasesSummaryKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("purchases-summary:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("purchases-summary:")
  }
  return false
}

export function usePurchaseActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(() => {
    return mutateGlobal((key) => isPurchasesListKey(key), undefined, { revalidate: true })
  }, [mutateGlobal])

  const invalidateSummary = useCallback(() => {
    return mutateGlobal((key) => isPurchasesSummaryKey(key), undefined, { revalidate: true })
  }, [mutateGlobal])

  const revalidateDetail = useCallback(
    (id: number) => {
      return mutateGlobal((key) => isPurchaseDetailKeyForId(key, id), undefined, {
        revalidate: true,
      })
    },
    [mutateGlobal]
  )

  const deleteDraftPurchase = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<ApiSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `purchase-invoices/${id}`,
        method: "DELETE",
        notify: false,
      })
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: PURCHASE_MESSAGES.deleted,
      })
      await Promise.all([invalidateList(), invalidateSummary()])
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  const cancelPurchase = useCallback(
    async (id: number, payload: CancelPurchaseInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<PurchaseInvoice>>({
        id: actionId,
        endpoint: `purchase-invoices/${id}/cancel`,
        method: "POST",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<PurchaseInvoice>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: PURCHASE_MESSAGES.cancelled,
      })
      await Promise.all([invalidateList(), revalidateDetail(id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  return {
    deleteDraftPurchase,
    cancelPurchase,
  }
}
