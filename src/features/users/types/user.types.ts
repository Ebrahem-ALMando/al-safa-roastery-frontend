export type UserListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export type DoctorUser = {
  id: number
  name: string
  username: string
  email: string
  role: string
  is_active: boolean
}

export type DoctorPickerRow = {
  id: string
  name: string
  username: string
  email: string
  isActive: boolean
}
