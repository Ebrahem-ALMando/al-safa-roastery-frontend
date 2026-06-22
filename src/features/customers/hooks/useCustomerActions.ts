"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { CUSTOMER_MESSAGES } from "../lib/customers.messages"
import type { CreateCustomerInput, Customer, UpdateCustomerInput } from "../types/customer.types"

function isCustomersListKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("customers:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("customers:")
  }
  return false
}

function isCustomerDetailKeyForId(k: unknown, id: number): boolean {
  const prefix = `customer:${id}`
  if (typeof k === "string") return k === prefix
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return k[0] === prefix
  }
  return false
}

function isCustomersSummaryKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("customers-summary:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("customers-summary:")
  }
  return false
}

export function useCustomerActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(() => {
    return mutateGlobal((key) => isCustomersListKey(key), undefined, { revalidate: true })
  }, [mutateGlobal])

  const invalidateSummary = useCallback(() => {
    return mutateGlobal((key) => isCustomersSummaryKey(key), undefined, { revalidate: true })
  }, [mutateGlobal])

  const revalidateDetail = useCallback(
    (id: number) => {
      return mutateGlobal((key) => isCustomerDetailKeyForId(key, id), undefined, {
        revalidate: true,
      })
    },
    [mutateGlobal]
  )

  const createCustomer = useCallback(
    async (payload: CreateCustomerInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Customer>>({
        id: actionId,
        endpoint: "customers",
        method: "POST",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<Customer>(res, 201)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: CUSTOMER_MESSAGES.created,
      })
      await Promise.all([invalidateList(), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  const updateCustomer = useCallback(
    async (id: number, payload: UpdateCustomerInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Customer>>({
        id: actionId,
        endpoint: `customers/${id}`,
        method: "PUT",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<Customer>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: CUSTOMER_MESSAGES.updated,
      })
      await Promise.all([invalidateList(), revalidateDetail(id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const deleteCustomer = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<ApiSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `customers/${id}`,
        method: "DELETE",
        notify: false,
      })
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: CUSTOMER_MESSAGES.deleted,
      })
      await Promise.all([invalidateList(), invalidateSummary()])
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  const activateCustomer = useCallback(
    async (customer: Customer) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Customer>>({
        id: actionId,
        endpoint: `customers/${customer.id}`,
        method: "PUT",
        payload: { is_active: true },
        notify: false,
      })
      const { data } = extractMutationResult<Customer>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: CUSTOMER_MESSAGES.activated,
      })
      await Promise.all([invalidateList(), revalidateDetail(customer.id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const deactivateCustomer = useCallback(
    async (customer: Customer) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Customer>>({
        id: actionId,
        endpoint: `customers/${customer.id}`,
        method: "PUT",
        payload: { is_active: false },
        notify: false,
      })
      const { data } = extractMutationResult<Customer>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: CUSTOMER_MESSAGES.deactivated,
      })
      await Promise.all([invalidateList(), revalidateDetail(customer.id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const toggleCustomerActive = useCallback(
    async (customer: Customer) => {
      if (customer.is_active) {
        return deactivateCustomer(customer)
      }
      return activateCustomer(customer)
    },
    [activateCustomer, deactivateCustomer]
  )

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    activateCustomer,
    deactivateCustomer,
    toggleCustomerActive,
  }
}
