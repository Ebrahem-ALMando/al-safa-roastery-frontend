"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { ApiRequestError, type LaravelSuccessResponse } from "@/lib/api"
import type { CreateSupplierInput, Supplier, UpdateSupplierInput } from "../types/supplier.types"

function isSuppliersListKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("suppliers:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("suppliers:")
  }
  return false
}

function isSupplierDetailKeyForId(k: unknown, id: number): boolean {
  const prefix = `supplier:${id}`
  if (typeof k === "string") return k === prefix
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return k[0] === prefix
  }
  return false
}

export function useSupplierActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(() => {
    return mutateGlobal((key) => isSuppliersListKey(key), undefined, { revalidate: true })
  }, [mutateGlobal])

  const revalidateDetail = useCallback(
    (id: number) => {
      return mutateGlobal((key) => isSupplierDetailKeyForId(key, id), undefined, {
        revalidate: true,
      })
    },
    [mutateGlobal]
  )

  const createSupplier = useCallback(
    async (payload: CreateSupplierInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<LaravelSuccessResponse<Supplier>>({
        id: actionId,
        endpoint: "suppliers",
        method: "POST",
        payload,
        notify: false,
      })
      if (!res?.data) {
        throw new ApiRequestError("استجابة غير صالحة", 500)
      }
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: res.message,
      })
      await invalidateList()
      return res.data
    },
    [execute, reportAction, invalidateList]
  )

  const updateSupplier = useCallback(
    async (id: number, payload: UpdateSupplierInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<LaravelSuccessResponse<Supplier>>({
        id: actionId,
        endpoint: `suppliers/${id}`,
        method: "PUT",
        payload,
        notify: false,
      })
      if (!res?.data) {
        throw new ApiRequestError("استجابة غير صالحة", 500)
      }
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: res.message,
      })
      await Promise.all([invalidateList(), revalidateDetail(id)])
      return res.data
    },
    [execute, reportAction, invalidateList, revalidateDetail]
  )

  const deleteSupplier = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<LaravelSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `suppliers/${id}`,
        method: "DELETE",
        notify: true,
      })
      await invalidateList()
    },
    [execute, invalidateList]
  )

  const toggleSupplierActive = useCallback(
    async (supplier: Supplier) => {
      return updateSupplier(supplier.id, { is_active: !supplier.is_active })
    },
    [updateSupplier]
  )

  return { createSupplier, updateSupplier, deleteSupplier, toggleSupplierActive }
}
