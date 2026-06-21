"use client"

import { useCallback } from "react"
import useSWR, { type KeyedMutator } from "swr"
import type { LaravelSuccessResponse } from "@/lib/api"
import { ApiRequestError } from "@/lib/api"
import { useAction } from "@/lib/hooks/useAction"
import { AUTH_ME_SWR_KEY } from "../auth.constants"
import type { AuthUser, LoginResponse } from "../types/auth.types"

type MeState =
  | { state: "ok"; user: AuthUser }
  | { state: "unauth" }

export type UseAuthReturn = {
  isAuthenticated: boolean
  user: AuthUser | undefined
  isLoading: boolean
  /** Populated for real failures; `401` is treated as "not logged in" (not an error). */
  error: Error | null
  mutate: KeyedMutator<MeState>
}

/**
 * Read-only session via `useAction` (GET, no toast) -> `/api/auth/me`.
 * 401 -> unauthenticated (not an error in `error` field).
 */
export function useAuth(): UseAuthReturn {
  const { execute } = useAction()

  const fetchMe = useCallback(async (): Promise<MeState> => {
    try {
      const res = await execute<LaravelSuccessResponse<LoginResponse>>({
        endpoint: "/auth/me",
        method: "GET",
        config: { baseUrl: "/api" },
        notify: false,
      })

      if (!res.data?.user) {
        throw new ApiRequestError("??????? ??? ????? ?? ??????", 500)
      }

      return { state: "ok", user: res.data.user }
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        return { state: "unauth" }
      }
      throw e
    }
  }, [execute])

  const { data, error, isLoading, isValidating, mutate } = useSWR<MeState, Error>(
    AUTH_ME_SWR_KEY,
    fetchMe,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    isAuthenticated: data?.state === "ok",
    user: data?.state === "ok" ? data.user : undefined,
    isLoading: Boolean((isLoading || (isValidating && !data)) && !error),
    error: error ?? null,
    mutate,
  }
}
