"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { ApiRequestError } from "@/lib/api/api.types"
import { useActionToast } from "@/src/components/status"
import { INVENTORY_MESSAGES } from "../lib/inventory.messages"
import type { InventoryAdjustmentInput, InventoryItem, InventoryWithdrawalInput } from "../types/inventory.types"

function keyStarts(key: unknown, prefixes: string[]) {
  const value = typeof key === "string" ? key : Array.isArray(key) && typeof key[0] === "string" ? key[0] : ""
  return prefixes.some((prefix) => value.startsWith(prefix))
}
function businessMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.code === "INSUFFICIENT_STOCK") return "لا يمكن سحب كمية أكبر من الكمية المتاحة."
    if (error.code === "NO_STOCK_CHANGE") return "لا يوجد فرق بين الكمية الحالية والكمية الفعلية."
    if (error.code === "ITEM_INACTIVE") return "الصنف غير متاح أو موقوف."
    if (error.code === "ADJUSTMENT_UNIT_COST_REQUIRED") return "أدخل تكلفة الوحدة لتسجيل الزيادة لهذا الصنف."
  }
  return INVENTORY_MESSAGES.fallback
}

export function useInventoryActions() {
  const { execute } = useAction(); const { reportAction } = useActionToast(); const { mutate } = useSWRConfig()
  const invalidate = useCallback((itemId: number) => mutate((key) => keyStarts(key, ["inventory-", "items:", "items-summary:", `item:${itemId}`, "products:", "products-summary:"]), undefined, { revalidate: true }), [mutate])
  const run = useCallback(async (endpoint: string, payload: InventoryWithdrawalInput | InventoryAdjustmentInput, successMessage: string) => {
    const id = crypto.randomUUID()
    try {
      const response = await execute<ApiSuccessResponse<unknown>>({ id, endpoint, method: "POST", payload, notify: false })
      extractMutationResult(response, 201)
      reportAction({ id, status: "success", error: null, successMessage })
      await invalidate(payload.item_id)
    } catch (error) {
      reportAction({ id, status: "failed", error: { status: error instanceof ApiRequestError ? error.status : 0, message: businessMessage(error) } })
      throw error
    }
  }, [execute, invalidate, reportAction])
  return {
    withdraw: (payload: InventoryWithdrawalInput) => run("inventory/withdrawals", payload, INVENTORY_MESSAGES.withdrawalSuccess),
    adjust: (payload: InventoryAdjustmentInput) => run("inventory/adjustments", payload, INVENTORY_MESSAGES.adjustmentSuccess),
  }
}
