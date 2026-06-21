import { getApiBaseUrl } from "@/lib/config/apiConfig"
import type { HttpMethod, RequestConfig } from "./api.types"
import { ApiRequestError } from "./api.types"
import {
  assertApiSuccessEnvelope,
  isHttpSuccessStatus,
  parseErrorBody,
  parseResponseJson,
} from "./parseApiResponse"

function normalizeEndpoint(endpoint: string): string {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`
}

/**
 * Low-level JSON HTTP client. No auth — BFF adds the session cookie.
 * Success: any HTTP 2xx. Parses Laravel ApiResponse envelope centrally.
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

  const text = await response.text()
  const parsed = text ? parseResponseJson(text) : null

  if (!isHttpSuccessStatus(response.status)) {
    const { message, code, errors } = parseErrorBody(
      parsed,
      response.statusText || "Request failed"
    )
    throw new ApiRequestError(message, response.status, code, errors)
  }

  if (parsed === null) {
    throw new ApiRequestError("استجابة نجاح غير متوقعة من الخادم.", response.status)
  }

  const envelope = assertApiSuccessEnvelope(parsed)
  return envelope as T
}
