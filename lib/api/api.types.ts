export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>

export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  signal?: AbortSignal
  baseUrl?: string
}

/**
 * Standard Laravel `ApiResponse::success` payload.
 */
export type LaravelSuccessResponse<T> = {
  status: number
  code: string
  message: string
  data: T
  meta?: unknown
}

/**
 * Error body from `ApiResponse::error` / exception handlers.
 */
export type ApiError = {
  status: number
  message: string
  code?: string
  errors?: Record<string, string[]>
}

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
