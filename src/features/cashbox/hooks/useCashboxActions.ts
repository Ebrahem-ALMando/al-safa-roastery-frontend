"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { ApiRequestError, extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import type { CashboxTransaction, ManualCashboxTransactionInput } from "../types/cashbox.types"

function isCashboxKey(key: unknown): boolean {
  const value = typeof key === "string" ? key : Array.isArray(key) && typeof key[0] === "string" ? key[0] : ""
  return value.startsWith("cashbox-")
}

function cashboxError(error: unknown): string {
  if (error instanceof ApiRequestError && error.code === "INSUFFICIENT_CASHBOX_BALANCE") {
    return "الرصيد الحالي في الصندوق غير كافٍ لتنفيذ هذا السحب."
  }
  return "تعذر تنفيذ العملية. حاول مجددًا."
}

export function useCashboxActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate } = useSWRConfig()

  const run = useCallback(async (mode: "deposit" | "withdrawal", payload: ManualCashboxTransactionInput) => {
    const id = crypto.randomUUID()
    try {
      const response = await execute<ApiSuccessResponse<CashboxTransaction>>({
        id,
        endpoint: mode === "deposit" ? "cashbox/manual-deposit" : "cashbox/manual-withdrawal",
        method: "POST",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<CashboxTransaction>(response, 201)
      reportAction({
        id,
        status: "success",
        error: null,
        successMessage: mode === "deposit" ? "تم تسجيل الإيداع اليدوي بنجاح." : "تم تسجيل السحب اليدوي بنجاح.",
      })
      await mutate((key) => isCashboxKey(key), undefined, { revalidate: true })
      return data
    } catch (error) {
      reportAction({ id, status: "failed", error: { status: error instanceof ApiRequestError ? error.status : 0, message: cashboxError(error) } })
      throw error
    }
  }, [execute, mutate, reportAction])

  return {
    manualDeposit: (payload: ManualCashboxTransactionInput) => run("deposit", payload),
    manualWithdrawal: (payload: ManualCashboxTransactionInput) => run("withdrawal", payload),
  }
}
