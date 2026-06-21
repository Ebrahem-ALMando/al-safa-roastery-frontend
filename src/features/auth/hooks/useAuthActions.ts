"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import { useAction } from "@/lib/hooks/useAction"
import type { LaravelSuccessResponse } from "@/lib/api"
import { ApiRequestError } from "@/lib/api"
import { AUTH_ME_SWR_KEY } from "../auth.constants"
import type { AuthUser, LoginRequest } from "../types/auth.types"

export type UseAuthActionsReturn = {
  /**
   * POST /api/auth/login (via apiExecutor, baseUrl `/api`).
   * On success, primes SWR auth cache and returns the user. On failure, throws `ApiRequestError`.
   */
  login: (params: LoginRequest) => Promise<AuthUser>
  /**
   * POST /api/auth/logout. Clears SWR `auth-me` state; **no** navigation.
   */
  logout: () => Promise<void>
}

type LoginEnvelope = LaravelSuccessResponse<{ user: AuthUser }>

/**
 * Write operations for session — all traffic goes through `apiExecutor` (never raw fetch in components).
 */
export function useAuthActions(): UseAuthActionsReturn {
  const { execute } = useAction()
  const { mutate: globalMutate } = useSWRConfig()

  const login = useCallback(
    async (params: LoginRequest) => {
      const body = await execute<LoginEnvelope>({
        endpoint: "/auth/login",
        method: "POST",
        payload: {
          username: params.username.trim().toLowerCase(),
          password: params.password,
        },
        config: { baseUrl: "/api" },
      })
      if (!body?.data?.user) {
        throw new ApiRequestError("استجابة غير صالحة من الخادم", 500)
      }
      const user = body.data.user
      await globalMutate(
        AUTH_ME_SWR_KEY,
        { state: "ok", user } as { state: "ok"; user: AuthUser },
        { revalidate: false }
      )
      return user
    },
    [execute, globalMutate]
  )

  const logout = useCallback(async () => {
    try {
      await execute<unknown>({
        endpoint: "/auth/logout",
        method: "POST",
        config: { baseUrl: "/api" },
      })
    } catch (e) {
      if (e instanceof ApiRequestError && (e.status === 401 || e.status === 403)) {
        // Session already invalid — still clear local cache
      } else {
        throw e
      }
    } finally {
      await globalMutate(
        AUTH_ME_SWR_KEY,
        { state: "unauth" } as { state: "unauth" },
        { revalidate: false }
      )
    }
  }, [execute, globalMutate])

  return { login, logout }
}