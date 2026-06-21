"use client"

import * as React from "react"
import { useLabOrder } from "@/features/orders"
import { useOrderTestCatalogEnrichment } from "./useOrderTestCatalogEnrichment"
import type { LabOrder, LabOrderItem } from "@/features/orders/types/order.types"
import { defaultSelectValueForField } from "@/components/results/results-helpers"
import { useAction } from "@/lib/hooks/useAction"
import type { LaravelSuccessResponse } from "@/lib/api"
import { buildResultRowsForItem } from "../lib/build-results-payload"

function cellKey(itemId: number, fieldId: number): string {
  return `${itemId}:${fieldId}`
}

function stringifyStoredValue(fieldType: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  if (fieldType === "number" && typeof value === "number") return String(value)
  return String(value)
}

function initialValuesFromOrder(order: LabOrder): Record<string, string> {
  const out: Record<string, string> = {}
  for (const item of order.items) {
    const fields = item.test?.fields ?? []
    if (fields.length > 0) {
      for (const f of fields) {
        const r = item.results.find((x) => x.test_field_id === f.id)
        let v = stringifyStoredValue(f.field_type, r?.value ?? null)
        if (f.field_type === "select" && !v.trim()) {
          v = defaultSelectValueForField(f)
        }
        out[cellKey(item.id, f.id)] = v
      }
      continue
    }
    for (const r of item.results) {
      out[cellKey(item.id, r.test_field_id)] = stringifyStoredValue(r.field_type, r.value)
    }
  }
  return out
}

export function useResultEntry(orderId: number | null) {
  const { execute } = useAction()
  const { order: rawOrder, isLoading, error, mutate } = useLabOrder({
    id: orderId,
    enabled: orderId != null,
  })

  const { order, catalogsLoading } = useOrderTestCatalogEnrichment(rawOrder)

  const [values, setValues] = React.useState<Record<string, string>>({})

  const resultSnapshot = React.useMemo(() => {
    if (!order) return ""
    return order.items
      .map((i) =>
        [
          i.id,
          i.status,
          i.results.map((r) => [r.id, r.value, r.entry_status, r.result_flag].join(":")).join(","),
        ].join("|")
      )
      .join(";")
  }, [order])

  React.useEffect(() => {
    if (orderId == null) setValues({})
  }, [orderId])

  /**
   * مزامنة الحقول من الـ API عند تغيّر الطلب أو عند تغيّر **النتائج المحفوظة** فقط.
   * عدم إدراج `order` في المصفوفة يمنع فقدان المسودة عند إعادة جلب الطلب بعد تعديل بياناته (ملاحظات، مريض، إلخ).
   */
  React.useEffect(() => {
    if (orderId == null || !order || order.id !== orderId) return
    setValues(initialValuesFromOrder(order))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- لا نضيف `order`: أي إعادة جلب للطلب كانت تعيد ضبط المسودة.
  }, [orderId, resultSnapshot])

  const setCellValue = React.useCallback((itemId: number, fieldId: number, v: string) => {
    setValues((prev) => ({ ...prev, [cellKey(itemId, fieldId)]: v }))
  }, [])

  const sortedItems = React.useMemo(() => {
    if (!order) return []
    return [...order.items].sort((a, b) => a.sort_order - b.sort_order)
  }, [order])

  const [saving, setSaving] = React.useState(false)
  const [savingDraft, setSavingDraft] = React.useState(false)
  const [savingItemId, setSavingItemId] = React.useState<number | null>(null)

  const saveItem = React.useCallback(
    async (item: LabOrderItem) => {
      const { rows, errors } = buildResultRowsForItem(item, values, { enforceRequired: true })
      if (errors.length > 0) {
        throw new Error(errors[0])
      }
      if (rows.length === 0) {
        throw new Error("لا توجد قيم لحفظها لهذا الفحص.")
      }
      setSavingItemId(item.id)
      try {
        await execute<LaravelSuccessResponse<unknown>>({
          endpoint: "results",
          method: "PUT",
          payload: { lab_order_item_id: item.id, results: rows },
          notify: false,
        })
        await mutate()
      } finally {
        setSavingItemId(null)
      }
    },
    [execute, values, mutate]
  )

  const saveAll = React.useCallback(async () => {
    if (!order) return
    setSaving(true)
    try {
      let anySaved = false
      for (const item of sortedItems) {
        const fields = item.test?.fields ?? []
        if (fields.length === 0 && item.results.length === 0) continue
        const { rows, errors } = buildResultRowsForItem(item, values, { enforceRequired: true })
        if (errors.length > 0) {
          throw new Error(`${item.test_name}: ${errors[0]}`)
        }
        if (rows.length === 0) continue
        anySaved = true
        await execute<LaravelSuccessResponse<unknown>>({
          endpoint: "results",
          method: "PUT",
          payload: { lab_order_item_id: item.id, results: rows },
          notify: false,
        })
      }
      if (!anySaved) {
        throw new Error("لا توجد قيم جديدة للحفظ — تأكد من إدخال الحقول الإلزامية لكل فحص.")
      }
      await mutate()
    } finally {
      setSaving(false)
    }
  }, [order, sortedItems, values, execute, mutate])

  const saveDraft = React.useCallback(async () => {
    if (!order) return
    setSavingDraft(true)
    try {
      for (const item of sortedItems) {
        const fields = item.test?.fields ?? []
        if (fields.length === 0 && item.results.length === 0) continue
        const { rows, errors } = buildResultRowsForItem(item, values, { enforceRequired: false })
        if (errors.length > 0) {
          throw new Error(`${item.test_name}: ${errors[0]}`)
        }
        await execute<LaravelSuccessResponse<unknown>>({
          endpoint: "results",
          method: "PUT",
          payload: { lab_order_item_id: item.id, results: rows, is_draft: true },
          notify: false,
        })
      }
      await mutate()
    } finally {
      setSavingDraft(false)
    }
  }, [order, sortedItems, values, execute, mutate])

  const disabled =
    order?.status === "cancelled" ||
    order?.status === "approved"

  return {
    order,
    isLoading: isLoading || catalogsLoading,
    error,
    values,
    setCellValue,
    sortedItems,
    saveAll,
    saveDraft,
    saveItem,
    saving,
    savingDraft,
    savingItemId,
    disabled,
    mutate,
  }
}
