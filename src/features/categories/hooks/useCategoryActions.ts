"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { ApiRequestError } from "@/lib/api/api.types"
import type { LaravelSuccessResponse } from "@/lib/api/api.types"
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types/category.types"

function isCategoriesListKey(k: unknown): boolean {
  if (typeof k === "string") {
    return k.startsWith("categories:")
  }
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("categories:")
  }
  return false
}

export function useCategoryActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(() => {
    return mutateGlobal((key) => isCategoriesListKey(key), undefined, {
      revalidate: true,
    })
  }, [mutateGlobal])

  const createCategory = useCallback(
    async (payload: CreateCategoryInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<LaravelSuccessResponse<Category>>({
        id: actionId,
        endpoint: "categories",
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

  const updateCategory = useCallback(
    async (id: number, payload: UpdateCategoryInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<LaravelSuccessResponse<Category>>({
        id: actionId,
        endpoint: `categories/${id}`,
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
      await invalidateList()
      return res.data
    },
    [execute, reportAction, invalidateList]
  )

  const deleteCategory = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<LaravelSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `categories/${id}`,
        method: "DELETE",
        notify: true,
      })
      await invalidateList()
    },
    [execute, invalidateList]
  )

  return { createCategory, updateCategory, deleteCategory }
}
