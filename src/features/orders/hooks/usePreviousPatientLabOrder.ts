"use client"

import { useMemo } from "react"
import { useApiQuery } from "@/lib/hooks/useApiQuery"
import type { LabOrder } from "../types/order.types"
import { pickPreviousPatientLabOrder } from "../lib/pick-previous-patient-lab-order"

type Args = {
  currentOrder: LabOrder | null
  enabled: boolean
}

/**
 * يجلب قائمة طلبات المريض ويختار أحدث طلب مكتمل/معتمد قبل الطلب الحالي
 * لمطابقة نتائج سابقة في التقرير.
 */
export function usePreviousPatientLabOrder({ currentOrder, enabled }: Args) {
  const patientId = currentOrder?.patient_id ?? null
  const key = useMemo(
    () =>
      enabled && patientId != null && currentOrder != null
        ? `patient-lab-orders-prev:${patientId}:${currentOrder.id}`
        : null,
    [enabled, patientId, currentOrder]
  )

  const { data: orders, isLoading, error } = useApiQuery<LabOrder[]>(key, "lab-orders", {
    queryParams:
      patientId != null
        ? { page: 1, per_page: 40, patient_id: patientId }
        : undefined,
  })

  const previousOrder = useMemo(() => {
    if (!currentOrder || !orders?.length) return null
    return pickPreviousPatientLabOrder(orders, currentOrder)
  }, [currentOrder, orders])

  return {
    previousOrder,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
  }
}
