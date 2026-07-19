"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { ApiRequestError, extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { PRODUCTION_MESSAGES } from "../lib/production.messages"
import type { CancelProductionInput, ProductionBatch, SaveProductionInput } from "../types/production.types"

function keyValue(key: unknown): string {
  return typeof key === "string" ? key : Array.isArray(key) && typeof key[0] === "string" ? key[0] : ""
}

export function useProductionActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate } = useSWRConfig()

  const invalidate = useCallback(async (id?: number) => {
    await Promise.all([
      mutate((key) => keyValue(key).startsWith("production-batches:"), undefined, { revalidate: true }),
      mutate((key) => keyValue(key).startsWith("production-summary:"), undefined, { revalidate: true }),
      mutate((key) => ["inventory-", "items:", "item:", "items-summary:", "products:", "product:"].some((prefix) => keyValue(key).startsWith(prefix)), undefined, { revalidate: true }),
      id ? mutate((key) => keyValue(key) === `production-detail:${id}`, undefined, { revalidate: true }) : Promise.resolve(),
    ])
  }, [mutate])

  const run = useCallback(async <T,>(endpoint: string, method: "POST" | "PATCH" | "DELETE", payload: unknown, successMessage: string, id?: number) => {
    const actionId = crypto.randomUUID()
    try {
      const response = await execute<ApiSuccessResponse<T>>({ id: actionId, endpoint, method, payload, notify: false })
      const { data } = extractMutationResult<T>(response)
      reportAction({ id: actionId, status: "success", error: null, successMessage })
      await invalidate(id)
      return data
    } catch (error) {
      reportAction({
        id: actionId,
        status: "failed",
        error: { status: error instanceof ApiRequestError ? error.status : 0, code: error instanceof ApiRequestError ? error.code : undefined, message: PRODUCTION_MESSAGES.failure },
      })
      throw error
    }
  }, [execute, invalidate, reportAction])

  return {
    createDraft: (payload: SaveProductionInput) => run<ProductionBatch>("production-batches", "POST", payload, PRODUCTION_MESSAGES.draftSaved),
    updateDraft: (id: number, payload: SaveProductionInput) => run<ProductionBatch>(`production-batches/${id}`, "PATCH", payload, PRODUCTION_MESSAGES.draftSaved, id),
    complete: (id: number) => run<ProductionBatch>(`production-batches/${id}/complete`, "POST", {}, PRODUCTION_MESSAGES.completed, id),
    cancel: (id: number, payload: CancelProductionInput) => run<ProductionBatch>(`production-batches/${id}/cancel`, "POST", payload, PRODUCTION_MESSAGES.cancelled, id),
    deleteDraft: (id: number) => run<unknown>(`production-batches/${id}`, "DELETE", undefined, PRODUCTION_MESSAGES.deleted, id),
  }
}
