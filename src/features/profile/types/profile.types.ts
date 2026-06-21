"use client"

export type Profile = {
  id: number
  name: string
  username: string
  role: string
  email?: string | null
  is_active?: boolean
  avatar_name?: string | null
  avatar_url?: string | null
}

export type UpdateProfileInput = {
  name?: string
  email?: string
  avatar?: null
}

export type ChangePasswordInput = {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export type UploadAvatarInput = {
  file: File
}
