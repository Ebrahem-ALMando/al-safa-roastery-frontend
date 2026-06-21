/**
 * Shapes from Laravel `CategoryResource`, `IndexCategoryRequest`, `StoreCategoryRequest`, `UpdateCategoryRequest`.
 * Keys match backend (snake_case) exactly.
 */

export type Category = {
  id: number
  name: string
  slug: string | null
  parent_id: number | null
  icon_name: string | null
  is_active: boolean
  sort_order: number
  count: number
  children_count: number
}

export type CategoriesListMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
}

/** `Modules/Categories/Requests/IndexCategoryRequest` + Laravel paginator `page`. */
export type CategoriesListFilters = {
  search?: string
  is_active?: boolean
  category_type?: "main" | "sub"
  created_from?: string
  created_to?: string
  page?: number
}

/** `StoreCategoryRequest` payload shape. */
export type CreateCategoryInput = {
  name: string
  slug?: string | null
  icon_name?: string | null
  parent_id?: number | null
  sort_order?: number | null
  is_active?: boolean
}

/** `UpdateCategoryRequest` payload shape (partial updates). */
export type UpdateCategoryInput = {
  name?: string
  slug?: string | null
  icon_name?: string | null
  parent_id?: number | null
  sort_order?: number | null
  is_active?: boolean | null
}
