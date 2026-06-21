import { ApiRequestError } from "./api.types"
import type { ApiSuccessResponse, PaginatedMeta, PaginatedResult } from "./api.types"

/** Strip UTF-8 BOM (and repeated BOM) from upstream Laravel/PHP responses. */
export function stripResponseBom(text: string): string {
  return text.replace(/^\uFEFF+/, "").trimStart()
}

/** HTTP 200–299 inclusive. */
export function isHttpSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300
}

export function parseResponseJson(text: string): unknown {
  const normalized = stripResponseBom(text)
  if (!normalized) {
    return null
  }
  try {
    return JSON.parse(normalized) as unknown
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

/**
 * Validates Laravel `ApiResponse` success envelope after JSON parse.
 * Does not require body.status === 200; HTTP status is authoritative for success.
 */
export function assertApiSuccessEnvelope(body: unknown): ApiSuccessResponse<unknown> {
  if (!isRecord(body)) {
    throw new ApiRequestError("استجابة نجاح غير متوقعة من الخادم.", 500)
  }

  const message = typeof body.message === "string" ? body.message : "Success"
  const status =
    typeof body.status === "number" && Number.isFinite(body.status)
      ? body.status
      : 200

  if (!("data" in body)) {
    throw new ApiRequestError("استجابة نجاح غير متوقعة من الخادم.", status)
  }

  const code = typeof body.code === "string" && body.code.length > 0 ? body.code : undefined
  const meta = isRecord(body.meta) ? body.meta : undefined

  return {
    status,
    message,
    code,
    data: body.data,
    meta,
  }
}

function coerceFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

export function parsePaginatedMeta(meta: unknown): PaginatedMeta | undefined {
  if (!isRecord(meta)) return undefined
  const total = coerceFiniteNumber(meta.total)
  if (total === undefined) return undefined

  return {
    total,
    current_page: coerceFiniteNumber(meta.current_page) ?? 1,
    per_page: coerceFiniteNumber(meta.per_page) ?? 15,
    last_page: coerceFiniteNumber(meta.last_page) ?? 1,
    from: coerceFiniteNumber(meta.from) ?? null,
    to: coerceFiniteNumber(meta.to) ?? null,
  }
}

/**
 * Laravel paginated list: items in top-level `data`, pagination in top-level `meta`.
 */
export function normalizePaginatedResponse<T>(body: unknown): PaginatedResult<T> {
  const envelope = assertApiSuccessEnvelope(body)

  if (!Array.isArray(envelope.data)) {
    throw new ApiRequestError(
      "استجابة قائمة غير متوقعة من الخادم: الحقل data ليس مصفوفة.",
      envelope.status
    )
  }

  const meta = parsePaginatedMeta(envelope.meta)

  return {
    items: envelope.data as T[],
    meta,
    total: meta?.total ?? envelope.data.length,
    currentPage: meta?.current_page ?? 1,
    perPage: meta?.per_page ?? envelope.data.length,
    lastPage: meta?.last_page ?? 1,
    message: envelope.message,
    status: envelope.status,
  }
}

/**
 * Single-resource or mutation payload from envelope `data`.
 * Allows empty object `{}` (e.g. delete) but rejects null/undefined.
 */
export function requireApiEnvelopeData<T>(
  body: unknown,
  httpStatus = 200
): { data: T; message: string; status: number; code?: string } {
  if (body === null || body === undefined) {
    throw new ApiRequestError("استجابة نجاح غير متوقعة من الخادم.", httpStatus)
  }

  const envelope = assertApiSuccessEnvelope(body)

  if (envelope.data === undefined || envelope.data === null) {
    throw new ApiRequestError("استجابة نجاح غير متوقعة من الخادم.", httpStatus)
  }

  return {
    data: envelope.data as T,
    message: envelope.message,
    status: envelope.status,
    code: envelope.code,
  }
}

export function parseErrorBody(body: unknown, fallback: string): {
  message: string
  code?: string
  errors?: Record<string, string[]>
} {
  if (!isRecord(body)) {
    return { message: fallback }
  }
  const message =
    typeof body.message === "string" && body.message.length > 0 ? body.message : fallback
  const code = typeof body.code === "string" && body.code.length > 0 ? body.code : undefined
  const rawErrors = body.errors
  let errors: Record<string, string[]> | undefined
  if (rawErrors && typeof rawErrors === "object" && !Array.isArray(rawErrors)) {
    errors = rawErrors as Record<string, string[]>
  }
  return { message, code, errors }
}
