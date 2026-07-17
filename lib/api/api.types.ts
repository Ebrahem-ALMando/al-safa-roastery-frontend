export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type QueryParams = Record<
  string,
  string | number | boolean | Array<string | number | boolean> | null | undefined
>

export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  signal?: AbortSignal
  baseUrl?: string
}

/**
 * Standard Laravel `ApiResponse` success envelope.
 * HTTP status 200–299 is authoritative; body.status mirrors it when present.
 */
export type ApiSuccessResponse<T> = {
  status: number
  message: string
  code?: string
  data: T
  meta?: Record<string, unknown>
}

/** @deprecated Use ApiSuccessResponse — kept for existing imports. */
export type LaravelSuccessResponse<T> = ApiSuccessResponse<T>

export type PaginatedMeta = {
  total: number
  current_page: number
  per_page: number
  last_page: number
  from?: number | null
  to?: number | null
}

export type PaginatedApiResponse<T> = ApiSuccessResponse<T[]> & {
  meta: PaginatedMeta
}

export type PaginatedResult<T> = {
  items: T[]
  meta: PaginatedMeta | undefined
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  message: string
  status: number
}

/**
 * Error body from `ApiResponse::error` / exception handlers.
 */
export type ApiErrorResponse = {
  status: number
  message: string
  code?: string
  errors?: Record<string, string[]>
}

/** @deprecated Use ApiErrorResponse */
export type ApiError = ApiErrorResponse

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiRequestError"
  }
}
