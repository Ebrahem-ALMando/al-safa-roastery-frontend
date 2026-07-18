"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import type { SavePurchaseDraftInput } from "../types/purchase-editor.types"
import type { PurchaseInvoice } from "../types/purchase.types"
import { PURCHASE_MESSAGES } from "../lib/purchases.messages"

function isPurchasesListKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("purchases:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("purchases:")
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

function isPurchaseDetailKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("purchase:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("purchase:")
  }
  return false
}

function isItemsKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("items:") || k.startsWith("item:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    const s = k[0] as string
    return s.startsWith("items:") || s.startsWith("item:")
  }
  return false
}

function isSuppliersKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("suppliers:") || k.startsWith("supplier:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    const s = k[0] as string
    return s.startsWith("suppliers:") || s.startsWith("supplier:")
  }
  return false
}

function isItemsSummaryKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("items-summary:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("items-summary:")
  }
  return false
}

function isPurchaseDownstreamKey(k: unknown): boolean {
  const value = typeof k === "string" ? k : Array.isArray(k) && typeof k[0] === "string" ? k[0] : ""
  return ["inventory-", "cashbox-", "statement:", "statement-tab:"].some((prefix) => value.startsWith(prefix))
}

export function usePurchaseEditorMutations() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateAfterMutation = useCallback(async () => {
    await Promise.all([
      mutateGlobal((key) => isPurchasesListKey(key), undefined, { revalidate: true }),
      mutateGlobal((key) => isPurchasesSummaryKey(key), undefined, { revalidate: true }),
      mutateGlobal((key) => isItemsKey(key), undefined, { revalidate: true }),
      mutateGlobal((key) => isItemsSummaryKey(key), undefined, { revalidate: true }),
      mutateGlobal((key) => isSuppliersKey(key), undefined, { revalidate: true }),
      mutateGlobal((key) => isPurchaseDownstreamKey(key), undefined, { revalidate: true }),
    ])
  }, [mutateGlobal])

  const revalidateDetail = useCallback(
    (id: number) => {
      return mutateGlobal((key) => {
        if (typeof key === "string") return key === `purchase:${id}`
        if (Array.isArray(key) && key[0] === `purchase:${id}`) return true
        return false
      }, undefined, { revalidate: true })
    },
    [mutateGlobal]
  )

  const createDraft = useCallback(
    async (payload: SavePurchaseDraftInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<PurchaseInvoice>>({
        id: actionId,
        endpoint: "purchase-invoices",
        method: "POST",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<PurchaseInvoice>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: PURCHASE_MESSAGES.draftSaved,
      })
      await invalidateAfterMutation()
      return data
    },
    [execute, reportAction, invalidateAfterMutation]
  )

  const updateDraft = useCallback(
    async (id: number, payload: SavePurchaseDraftInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<PurchaseInvoice>>({
        id: actionId,
        endpoint: `purchase-invoices/${id}`,
        method: "PUT",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<PurchaseInvoice>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: PURCHASE_MESSAGES.draftSaved,
      })
      await Promise.all([invalidateAfterMutation(), revalidateDetail(id)])
      return data
    },
    [execute, reportAction, invalidateAfterMutation, revalidateDetail]
  )

  const completeDraft = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<PurchaseInvoice>>({
        id: actionId,
        endpoint: `purchase-invoices/${id}/complete`,
        method: "POST",
        payload: {},
        notify: false,
      })
      const { data } = extractMutationResult<PurchaseInvoice>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: PURCHASE_MESSAGES.completed,
      })
      await Promise.all([invalidateAfterMutation(), revalidateDetail(id)])
      return data
    },
    [execute, reportAction, invalidateAfterMutation, revalidateDetail]
  )

  const storeAndComplete = useCallback(
    async (payload: SavePurchaseDraftInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<PurchaseInvoice>>({
        id: actionId,
        endpoint: "purchase-invoices/store-and-complete",
        method: "POST",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<PurchaseInvoice>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: PURCHASE_MESSAGES.completed,
      })
      await invalidateAfterMutation()
      return data
    },
    [execute, reportAction, invalidateAfterMutation]
  )

  return {
    createDraft,
    updateDraft,
    completeDraft,
    storeAndComplete,
  }
}
