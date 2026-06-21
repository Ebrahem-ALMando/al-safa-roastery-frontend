/**
 * Auth feature types (Laravel + Next /api layer).
 * UI components must not import API shapes directly  use feature hooks.
 */

export type UserRole = {
  id: number
  name: string
  code: string
}

export type AuthUser = {
  id: number
  name: string
  username: string
  email?: string | null
  phone?: string | null
  role: UserRole | string
  is_active?: boolean
  last_login_at?: string | null
  avatar_name?: string | null
  avatar_url?: string | null
}

export type LoginRequest = {
  username: string
  password: string
}

/** Data returned to the client after successful login/me (no token in JS). */
export type LoginResponse = {
  user: AuthUser
}
