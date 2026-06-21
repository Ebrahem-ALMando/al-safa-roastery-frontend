"use client"

import { useCallback } from "react"
import { apiExecutor } from "@/lib/api"
import type { ApiError } from "@/lib/api/api.types"
import { ApiRequestError } from "@/lib/api/api.types"
import { mapApiError } from "@/lib/errors/mapApiError"
import { useActionToast } from "@/src/components/status"

import type { HttpMethod, QueryParams, RequestConfig } from "@/lib/api/api.types"

/**
 * Object-style action executor. Mutations are reported to {@link useActionToast} for centralized toasts.
 */
export type ActionExecuteParams = {
  endpoint: string
  method: HttpMethod
  payload?: unknown
  queryParams?: QueryParams
  config?: RequestConfig
  /**
   * Stable id for the same logical action (deduping in context). Defaults to a new UUID.
   */
  id?: string
  /**
   * When false, skips `reportAction` (e.g. GET /auth/me). Default: true for all except GET/HEAD.
   */
  notify?: boolean
}

function toApiError(err: unknown, mappedMessage: string): ApiError {
  if (err instanceof ApiRequestError) {
    return {
      status: err.status,
      message: mappedMessage,
      code: err.code,
      errors: err.errors,
    }
  }
  return { status: 0, message: mappedMessage }
}

function defaultNotify(method: HttpMethod): boolean {
  return method !== "GET"
}

function successMessageFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined
  const m = (data as { message?: unknown }).message
  return typeof m === "string" && m.length > 0 ? m : undefined
}

export function useAction() {
  const { reportAction } = useActionToast()

  const execute = useCallback(
    async <T,>(params: ActionExecuteParams): Promise<T> => {
      const actionId = params.id ?? crypto.randomUUID()
      const notify = params.notify ?? defaultNotify(params.method)

      try {
        const data = await apiExecutor<T>(
          params.endpoint,
          params.method,
          params.payload,
          params.queryParams,
          params.config
        )

        if (notify) {
          const sm = successMessageFromBody(data)
          if (sm) {
            reportAction({
              id: actionId,
              status: "success",
              error: null,
              successMessage: sm,
            })
          }
        }

        return data
      } catch (e) {
        if (notify) {
          const msg = mapApiError(e)
          const apiError = toApiError(e, msg)
          reportAction({
            id: actionId,
            status: "failed",
            error: apiError,
          })
        }
        throw e
      }
    },
    [reportAction]
  )

  return { execute }
}
