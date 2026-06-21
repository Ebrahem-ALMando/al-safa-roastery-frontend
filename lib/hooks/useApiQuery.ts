"use client"

import useSWR from "swr"
import {
  apiExecutor,
  type ApiSuccessResponse,
  type PaginatedMeta,
  type QueryParams,
  type RequestConfig,
} from "@/lib/api"
import { normalizePaginatedResponse } from "@/lib/api/parseApiResponse"

export type UseApiQueryResult<TData> = {
  /** Normalized list/resource payload from envelope `data`. */
  data: TData | undefined
  meta: PaginatedMeta | undefined
  message: string | undefined
  /** Full Laravel envelope when needed. */
  envelope: ApiSuccessResponse<TData> | undefined
  isLoading: boolean
  error: Error | undefined
  mutate: ReturnType<typeof useSWR<ApiSuccessResponse<TData>>>["mutate"]
}

/**
 * SWR + apiExecutor (GET) for Laravel `{ status, message, data, meta? }` payloads.
 * Collections: items from top-level `data`, pagination from top-level `meta`.
 */
export function useApiQuery<TData = unknown>(
  key: string | null,
  endpoint: string,
  options?: {
    queryParams?: QueryParams
    config?: RequestConfig
    /** When true (default for arrays), validates `data` is an array. */
    paginated?: boolean
  }
): UseApiQueryResult<TData> {
  const paginated = options?.paginated ?? false

  const { data: envelope, error, isLoading, mutate } = useSWR(
    key ? [key, endpoint, options?.queryParams ?? null, paginated] : null,
    async () => {
      const raw = await apiExecutor<ApiSuccessResponse<TData>>(
        endpoint,
        "GET",
        undefined,
        options?.queryParams,
        options?.config
      )

      if (paginated || Array.isArray(raw.data)) {
        const normalized = normalizePaginatedResponse(
          raw as ApiSuccessResponse<unknown[]>
        )
        return {
          ...raw,
          data: normalized.items as TData,
          meta: normalized.meta,
        }
      }

      return raw
    }
  )

  return {
    data: envelope?.data,
    meta: envelope?.meta as PaginatedMeta | undefined,
    message: envelope?.message,
    envelope,
    isLoading,
    error: error as Error | undefined,
    mutate,
  }
}
