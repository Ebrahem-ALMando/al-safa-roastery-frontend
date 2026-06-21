"use client"

import useSWR from "swr"
import {
  apiExecutor,
  type LaravelSuccessResponse,
  type QueryParams,
  type RequestConfig,
} from "@/lib/api"

/**
 * SWR + apiExecutor (GET) for Laravel `{ status, code, message, data, meta? }` payloads.
 */
export function useApiQuery<TData = unknown>(
  key: string | null,
  endpoint: string,
  options?: { queryParams?: QueryParams; config?: RequestConfig }
) {
  const { data, error, isLoading, mutate } = useSWR(
    key ? [key, endpoint, options?.queryParams ?? null] : null,
    () =>
      apiExecutor<LaravelSuccessResponse<TData>>(
        endpoint,
        "GET",
        undefined,
        options?.queryParams,
        options?.config
      )
  )

  return {
    data: data?.data,
    meta: data?.meta,
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}
