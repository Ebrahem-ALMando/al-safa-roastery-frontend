import { apiClient } from "./apiClient"
import type { HttpMethod, QueryParams, RequestConfig } from "./api.types"

function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(`${key}[]`, String(item)))
    } else if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  }
  const s = searchParams.toString()
  return s ? `?${s}` : ""
}

/**
 * High-level request helper: query string, body rules, then `apiClient`.
 */
export async function apiExecutor<T = unknown>(
  endpoint: string,
  method: HttpMethod = "GET",
  payload?: unknown,
  queryParams?: QueryParams,
  config?: RequestConfig
): Promise<T> {
  let path = endpoint
  if (queryParams && Object.keys(queryParams).length > 0) {
    path = `${endpoint}${buildQueryString(queryParams)}`
  }

  const canHaveBody = method !== "GET" && method !== "DELETE"
  return apiClient<T>(
    path,
    method,
    canHaveBody ? payload : undefined,
    config ?? {}
  )
}
