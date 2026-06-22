"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { extractMutationResult, type ApiSuccessResponse } from "@/lib/api"
import { ITEM_MESSAGES } from "../lib/items.messages"
import type { CreateItemInput, Item, UpdateItemInput } from "../types/item.types"

function isItemsListKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("items:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("items:")
  }
  return false
}

function isItemDetailKeyForId(k: unknown, id: number): boolean {
  const prefix = `item:${id}`
  if (typeof k === "string") return k === prefix
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return k[0] === prefix
  }
  return false
}

function isItemsSummaryKey(k: unknown): boolean {
  if (typeof k === "string") return k.startsWith("items-summary:")
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("items-summary:")
  }
  return false
}

export function useItemActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const invalidateList = useCallback(() => {
    return mutateGlobal((key) => isItemsListKey(key), undefined, { revalidate: true })
  }, [mutateGlobal])

  const invalidateSummary = useCallback(() => {
    return mutateGlobal((key) => isItemsSummaryKey(key), undefined, { revalidate: true })
  }, [mutateGlobal])

  const revalidateDetail = useCallback(
    (id: number) => {
      return mutateGlobal((key) => isItemDetailKeyForId(key, id), undefined, {
        revalidate: true,
      })
    },
    [mutateGlobal]
  )

  const createItem = useCallback(
    async (payload: CreateItemInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Item>>({
        id: actionId,
        endpoint: "items",
        method: "POST",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<Item>(res, 201)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: ITEM_MESSAGES.created,
      })
      await Promise.all([invalidateList(), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  const updateItem = useCallback(
    async (id: number, payload: UpdateItemInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Item>>({
        id: actionId,
        endpoint: `items/${id}`,
        method: "PUT",
        payload,
        notify: false,
      })
      const { data } = extractMutationResult<Item>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: ITEM_MESSAGES.updated,
      })
      await Promise.all([invalidateList(), revalidateDetail(id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const deleteItem = useCallback(
    async (id: number) => {
      const actionId = crypto.randomUUID()
      await execute<ApiSuccessResponse<unknown>>({
        id: actionId,
        endpoint: `items/${id}`,
        method: "DELETE",
        notify: false,
      })
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: ITEM_MESSAGES.deleted,
      })
      await Promise.all([invalidateList(), invalidateSummary()])
    },
    [execute, reportAction, invalidateList, invalidateSummary]
  )

  const activateItem = useCallback(
    async (item: Item) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Item>>({
        id: actionId,
        endpoint: `items/${item.id}`,
        method: "PUT",
        payload: { is_active: true },
        notify: false,
      })
      const { data } = extractMutationResult<Item>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: ITEM_MESSAGES.activated,
      })
      await Promise.all([invalidateList(), revalidateDetail(item.id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const deactivateItem = useCallback(
    async (item: Item) => {
      const actionId = crypto.randomUUID()
      const res = await execute<ApiSuccessResponse<Item>>({
        id: actionId,
        endpoint: `items/${item.id}`,
        method: "PUT",
        payload: { is_active: false },
        notify: false,
      })
      const { data } = extractMutationResult<Item>(res)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: ITEM_MESSAGES.deactivated,
      })
      await Promise.all([invalidateList(), revalidateDetail(item.id), invalidateSummary()])
      return data
    },
    [execute, reportAction, invalidateList, revalidateDetail, invalidateSummary]
  )

  const toggleItemActive = useCallback(
    async (item: Item) => {
      if (item.is_active) {
        return deactivateItem(item)
      }
      return activateItem(item)
    },
    [activateItem, deactivateItem]
  )

  return {
    createItem,
    updateItem,
    deleteItem,
    activateItem,
    deactivateItem,
    toggleItemActive,
  }
}
