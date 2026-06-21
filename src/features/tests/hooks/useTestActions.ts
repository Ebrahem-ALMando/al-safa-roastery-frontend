"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import type { CreateTestInput, Test, UpdateTestInput } from "../types/test.types"

function isTestsListKey(k: unknown): boolean {
  if (typeof k === "string") {
    return k.startsWith("tests:")
  }
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("tests:")
  }
  return false
}

function isTestDetailKeyForId(k: unknown, id: number): boolean {
  const prefix = `test:${id}`
  if (typeof k === "string") {
    return k === prefix
  }
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return k[0] === prefix
  }
  return false
}

export function useTestActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(() => {
    return mutateGlobal((key) => isTestsListKey(key), undefined, {
      revalidate: true,
    })
  }, [mutateGlobal])

  const revalidateDetail = useCallback(
    (id: number) => {
      return mutateGlobal(
        (key) => isTestDetailKeyForId(key, id),
        undefined,
        { revalidate: true }
      )
    },
    [mutateGlobal]
  )

  const createTest = useCallback(
    async (payload: CreateTestInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Test>>({
        id: actionId,
        endpoint: "tests",
        method: "POST",
        payload: {
          ...payload,
          fields: payload.fields ?? [],
          prices: payload.prices ?? [],
        },
        notify: false,
      })
      const { data, message } = extractMutationResult<Test>(res, 201)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: message,
      })
      await invalidateList()
      return data
    },
    [execute, reportAction, invalidateList]
  )

  const updateTest = useCallback(
    async (id: number, payload: UpdateTestInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Test>>({
        id: actionId,
        endpoint: `tests/${id}`,
        method: "PUT",
        payload,
        notify: false,
      })
      const { data, message } = extractMutationResult<Test>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: message,
      })
      await Promise.all([invalidateList(), revalidateDetail(id)])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail]
  )

  const deleteTest = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<ApiSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `tests/${id}`,
        method: "DELETE",
        notify: true,
      })
      await invalidateList()
    },
    [execute, invalidateList]
  )

  return { createTest, updateTest, deleteTest }
}
