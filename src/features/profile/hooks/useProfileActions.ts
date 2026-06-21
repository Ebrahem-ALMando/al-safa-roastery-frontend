"use client"

import { useCallback } from "react"
import { useSWRConfig } from "swr"
import type { LaravelSuccessResponse } from "@/lib/api"
import { ApiRequestError } from "@/lib/api"
import { useAction } from "@/lib/hooks/useAction"
import { useActionToast } from "@/src/components/status"
import { AUTH_ME_SWR_KEY } from "@/src/features/auth/auth.constants"
import type {
  ChangePasswordInput,
  Profile,
  UpdateProfileInput,
  UploadAvatarInput,
} from "../types/profile.types"

function isProfileKey(k: unknown): boolean {
  if (typeof k === "string") {
    return k.startsWith("profile:")
  }
  if (Array.isArray(k) && k.length > 0 && typeof k[0] === "string") {
    return (k[0] as string).startsWith("profile:")
  }
  return false
}

export function useProfileActions() {
  const { execute } = useAction()
  const { reportAction } = useActionToast()
  const { mutate: mutateGlobal } = useSWRConfig()

  const revalidateProfile = useCallback(async () => {
    await Promise.all([
      mutateGlobal((key) => isProfileKey(key), undefined, { revalidate: true }),
      mutateGlobal(AUTH_ME_SWR_KEY, undefined, { revalidate: true }),
    ])
  }, [mutateGlobal])

  const updateProfile = useCallback(
    async (payload: UpdateProfileInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<LaravelSuccessResponse<Profile>>({
        id: actionId,
        endpoint: "/auth/profile",
        method: "PUT",
        payload,
        config: { baseUrl: "/api" },
        notify: false,
      })
      if (!res?.data) throw new ApiRequestError("استجابة غير صالحة", 500)
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: res.message,
      })
      await revalidateProfile()
      return res.data
    },
    [execute, reportAction, revalidateProfile]
  )

  const changePassword = useCallback(
    async (payload: ChangePasswordInput) => {
      const actionId = crypto.randomUUID()
      const res = await execute<LaravelSuccessResponse<Profile>>({
        id: actionId,
        endpoint: "/auth/change-password",
        method: "POST",
        payload,
        config: { baseUrl: "/api" },
        notify: false,
      })
      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: res.message,
      })
      await revalidateProfile()
      return res.data
    },
    [execute, reportAction, revalidateProfile]
  )

  const uploadAvatar = useCallback(
    async ({ file }: UploadAvatarInput) => {
      const actionId = crypto.randomUUID()
      const formData = new FormData()
      formData.append("file", file)

      const res = await execute<LaravelSuccessResponse<unknown>>({
        id: actionId,
        endpoint: "/auth/upload-avatar",
        method: "POST",
        payload: formData,
        config: { baseUrl: "/api" },
        notify: false,
      })

      reportAction({
        id: actionId,
        status: "success",
        error: null,
        successMessage: res.message,
      })
      await revalidateProfile()
    },
    [execute, reportAction, revalidateProfile]
  )

  const deleteAvatar = useCallback(async () => {
    const actionId = crypto.randomUUID()
    const res = await execute<LaravelSuccessResponse<Profile>>({
      id: actionId,
      endpoint: "/auth/profile",
      method: "PUT",
      payload: { avatar: null },
      config: { baseUrl: "/api" },
      notify: false,
    })
    reportAction({
      id: actionId,
      status: "success",
      error: null,
      successMessage: res.message,
    })
    await revalidateProfile()
  }, [execute, reportAction, revalidateProfile])

  return { updateProfile, changePassword, uploadAvatar, deleteAvatar }
}
