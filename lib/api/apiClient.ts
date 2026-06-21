import { getApiBaseUrl } from "@/lib/config/apiConfig"
import type { HttpMethod, RequestConfig } from "./api.types"
import { ApiRequestError } from "./api.types"

function normalizeEndpoint(endpoint: string): string {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function parseErrorBody(body: unknown, fallback: string): {
  message: string
  code?: string
  errors?: Record<string, string[]>
} {
  if (!body || typeof body !== "object") {
    return { message: fallback }
  }
  const o = body as Record<string, unknown>
  const message =
    typeof o.message === "string" && o.message.length > 0 ? o.message : fallback
  const code = typeof o.code === "string" && o.code.length > 0 ? o.code : undefined
  const rawErrors = o.errors
  let errors: Record<string, string[]> | undefined
  if (rawErrors && typeof rawErrors === "object" && !Array.isArray(rawErrors)) {
    errors = rawErrors as Record<string, string[]>
  }
  return { message, code, errors }
}

/**
 * Low-level JSON HTTP client. No auth — BFF adds the session cookie.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  config: RequestConfig = {}
): Promise<T> {
  const baseUrl = (config.baseUrl ?? getApiBaseUrl()).replace(/\/+$/, "")
  const path = normalizeEndpoint(endpoint)
  const url = `${baseUrl}${path}`

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...config.headers,
  }

  const canSendBody = body !== undefined && method !== "GET" && method !== "DELETE"
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData
  const canSendJsonBody = canSendBody && !isFormData
  if (canSendJsonBody) {
    headers["Content-Type"] = "application/json"
  }

  const requestInit: RequestInit = {
    method,
    headers,
    signal: config.signal,
  }

  let abortController: AbortController | undefined
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  if (!config.signal && config.timeout && config.timeout > 0) {
    abortController = new AbortController()
    requestInit.signal = abortController.signal
    timeoutId = setTimeout(() => abortController?.abort(), config.timeout)
  }

  if (canSendJsonBody) {
    requestInit.body = JSON.stringify(body)
  } else if (canSendBody && isFormData) {
    requestInit.body = body
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...requestInit,
      credentials: "include",
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "فشل الاتصال"
    throw new ApiRequestError(msg, 0)
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }

  if (response.status === 204) {
    return null as T
  }

  const parsed = await parseJsonBody(response)

  if (!response.ok) {
    const { message, code, errors } = parseErrorBody(
      parsed,
      response.statusText || "Request failed"
    )
    throw new ApiRequestError(message, response.status, code, errors)
  }

  return (parsed ?? ({} as T)) as T
}
