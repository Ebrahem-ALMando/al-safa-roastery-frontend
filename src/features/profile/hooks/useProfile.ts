"use client"

import type { AuthUser } from "@/src/features/auth/types/auth.types"
import { useAuth } from "@/src/features/auth/hooks/useAuth"
import type { Profile } from "../types/profile.types"

export function useProfile() {
  const { user, isLoading, error, mutate } = useAuth()

  const profile: Profile | undefined = user
    ? ({
        ...(user as AuthUser),
      } as Profile)
    : undefined

  return {
    profile,
    isLoading: Boolean(isLoading),
    error: error as Error | undefined,
    mutate,
  }
}
