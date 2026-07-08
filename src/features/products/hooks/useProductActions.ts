"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { ApiRequestError, extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { PRODUCT_MESSAGES } from "../lib/products.messages"
import type { Product } from "../types/product.types"

function isProductsListKey(key: unknown): boolean {
  if (typeof key === "string") return key.startsWith("products:")
  if (Array.isArray(key) && typeof key[0] === "string") return key[0].startsWith("products:")
  return false
}

function isProductsSummaryKey(key: unknown): boolean {
  if (typeof key === "string") return key.startsWith("products-summary:")
  if (Array.isArray(key) && typeof key[0] === "string") return key[0].startsWith("products-summary:")
  return false
}

function isProductDetailKeyForId(key: unknown, id: number): boolean {
  if (typeof key === "string") return key === `product:${id}`
  if (Array.isArray(key) && typeof key[0] === "string") return key[0] === `product:${id}`
  return false
}

export function useProductActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(
    () => mutateGlobal((key) => isProductsListKey(key), undefined, { revalidate: true }),
    [mutateGlobal]
  )

  const invalidateSummary = useCallback(
    () => mutateGlobal((key) => isProductsSummaryKey(key), undefined, { revalidate: true }),
    [mutateGlobal]
  )

  const revalidateDetail = useCallback(
    (id: number) =>
      mutateGlobal((key) => isProductDetailKeyForId(key, id), undefined, { revalidate: true }),
    [mutateGlobal]
  )

  const setProductActive = useCallback(
    async (product: Product, isActive: boolean) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Product>>({
        id: actionId,
        endpoint: `products/${product.id}`,
        method: "PATCH",
        payload: { is_active: isActive },
        notify: false,
      })
      const { data } = extractMutationResult<Product>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: isActive ? PRODUCT_MESSAGES.activated : PRODUCT_MESSAGES.deactivated,
      })
      await Promise.all([invalidateList(), invalidateSummary(), revalidateDetail(product.id)])
      return data
    },
    [execute, reportAction, invalidateList, invalidateSummary, revalidateDetail]
  )

  const toggleProductActive = useCallback(
    (product: Product) => setProductActive(product, !product.is_active),
    [setProductActive]
  )

  const deleteProduct = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      try {
        await execute<ApiSuccessResponse<unknown>>({
          id: actionId,
          endpoint: `products/${id}`,
          method: "DELETE",
          notify: false,
        })
        reportAction({
          id: actionId,
          status: "success",
          error: null,
          successMessage: PRODUCT_MESSAGES.deleted,
        })
        await Promise.all([invalidateList(), invalidateSummary()])
      } catch (error) {
        const isInUse = error instanceof ApiRequestError && error.code === "PRODUCT_IN_USE"
        reportAction({
          id: actionId,
          status: "failed",
          error: {
            status: error instanceof ApiRequestError ? error.status : 0,
            code: error instanceof ApiRequestError ? error.code : undefined,
            message: isInUse ? PRODUCT_MESSAGES.inUseDelete : PRODUCT_MESSAGES.failure,
          },
        })
        throw error
      }
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  return {
    toggleProductActive,
    deleteProduct,
  }
}
