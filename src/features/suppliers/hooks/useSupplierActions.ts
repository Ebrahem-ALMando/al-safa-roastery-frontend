"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { SUPPLIER_MESSAGES } from "../lib/suppliers.messages"
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

function isSuppliersSummaryKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("suppliers-summary:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("suppliers-summary:")
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

  const invalidateSummary = useCallback(() => {
    return mutateGlobal((key) => isSuppliersSummaryKey(key), undefined, { revalidate: true })
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
      const res = await execute<ApiSuccessResponse<Supplier>>({
        id: actionId,
        endpoint: "suppliers",
        method: "POST",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<Supplier>(res, 201)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: SUPPLIER_MESSAGES.created,
      })
      await Promise.all([invalidateList(), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  const updateSupplier = useCallback(
    async (id: number, payload: UpdateSupplierInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Supplier>>({
        id: actionId,
        endpoint: `suppliers/${id}`,
        method: "PUT",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<Supplier>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: SUPPLIER_MESSAGES.updated,
      })
      await Promise.all([invalidateList(), revalidateDetail(id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const deleteSupplier = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<ApiSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `suppliers/${id}`,
        method: "DELETE",
        notify: false,
      })
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: SUPPLIER_MESSAGES.deleted,
      })
      await Promise.all([invalidateList(), invalidateSummary()])
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  const activateSupplier = useCallback(
    async (supplier: Supplier) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Supplier>>({
        id: actionId,
        endpoint: `suppliers/${supplier.id}`,
        method: "PUT",
        payload: { is_active: true },
        notify: false,
      })
      const { data } = extractMutationResult<Supplier>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: SUPPLIER_MESSAGES.activated,
      })
      await Promise.all([invalidateList(), revalidateDetail(supplier.id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const deactivateSupplier = useCallback(
    async (supplier: Supplier) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Supplier>>({
        id: actionId,
        endpoint: `suppliers/${supplier.id}`,
        method: "PUT",
        payload: { is_active: false },
        notify: false,
      })
      const { data } = extractMutationResult<Supplier>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: SUPPLIER_MESSAGES.deactivated,
      })
      await Promise.all([invalidateList(), revalidateDetail(supplier.id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const toggleSupplierActive = useCallback(
    async (supplier: Supplier) => {
      if (supplier.is_active) {
        return deactivateSupplier(supplier)
      }
      return activateSupplier(supplier)
    },
    [activateSupplier, deactivateSupplier]
  )

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    activateSupplier,
    deactivateSupplier,
    toggleSupplierActive,
  }
}
