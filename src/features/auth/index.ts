/**
 * Auth feature — hooks + types only. No UI in this directory.
 */
export { useAuth } from "./hooks/useAuth"
export type { UseAuthReturn } from "./hooks/useAuth"
export { useAuthActions } from "./hooks/useAuthActions"
export type { UseAuthActionsReturn } from "./hooks/useAuthActions"
export { AUTH_ME_SWR_KEY } from "./auth.constants"
export type { AuthUser, LoginRequest, LoginResponse } from "./types/auth.types"
