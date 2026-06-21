import { decodeVerifyOrderToken } from "@/lib/verify-order-wedge-token"

export type BarcodeRouteType = "patient" | "results" | "verify"

export type ResolvedBarcodeRoute =
  | {
      isValid: true
      type: BarcodeRouteType
      /** Patient id, lab order id (numeric), or decoded order number string for verify */
      id: string
      route: string
      normalizedValue: string
    }
  | {
      isValid: false
      error: string
      normalizedValue: string
    }

const PAT_RES_PATTERN = /^~(PAT|RES)-(\d+)$/
const VRF_PATTERN = /^~VRF-([0-9A-F]+)$/

function normalizeRaw(value: string): string {
  return value.trim().toUpperCase()
}

function parseEntityId(digits: string): string {
  return String(parseInt(digits, 10))
}

function buildPatResRoute(type: "patient" | "results", id: string): string {
  if (type === "patient") return `/dashboard/patients/${id}`
  return `/dashboard/results/${id}`
}

function resolvePatRes(normalized: string, match: RegExpExecArray): ResolvedBarcodeRoute {
  const typeLetter = match[1] as "PAT" | "RES"
  const type: "patient" | "results" = typeLetter === "PAT" ? "patient" : "results"
  const id = parseEntityId(match[2])
  const normalizedValue = `${typeLetter}-${id}`

  return {
    isValid: true,
    type,
    id,
    route: buildPatResRoute(type, id),
    normalizedValue,
  }
}

export type ResolveBarcodeRouteOptions = {
  /** When true, value must start with ~ (global scanner). Default false. */
  requirePrefix?: boolean
}

/**
 * Parses ~PAT-{id}, ~RES-{id}, and ~VRF-{hex} (public report verify) for redirects.
 */
export function resolveBarcodeRoute(
  value: string,
  options: ResolveBarcodeRouteOptions = {}
): ResolvedBarcodeRoute {
  const requirePrefix = options.requirePrefix ?? false
  const normalized = normalizeRaw(value)

  if (normalized === "") {
    return {
      isValid: false,
      error: "لم يُدخل باركود.",
      normalizedValue: "",
    }
  }

  if (requirePrefix && !normalized.startsWith("~")) {
    return {
      isValid: false,
      error: "يجب أن يبدأ الباركود بالرمز ~.",
      normalizedValue: normalized.startsWith("~") ? normalized.slice(1) : normalized,
    }
  }

  const vrfMatch = VRF_PATTERN.exec(normalized)
  if (vrfMatch) {
    const orderNumber = decodeVerifyOrderToken(vrfMatch[1])
    if (!orderNumber) {
      return {
        isValid: false,
        error: "رمز التحقق من التقرير غير صالح.",
        normalizedValue: vrfMatch[1],
      }
    }
    return {
      isValid: true,
      type: "verify",
      id: orderNumber,
      route: `/verify/${encodeURIComponent(orderNumber)}`,
      normalizedValue: `VRF-${orderNumber}`,
    }
  }

  const patResMatch = PAT_RES_PATTERN.exec(normalized)
  if (patResMatch) {
    return resolvePatRes(normalized, patResMatch)
  }

  if (requirePrefix) {
    return {
      isValid: false,
      error: "صيغة الباركود غير مدعومة. الصيغ المتوقعة: ~PAT-{id} أو ~RES-{id} أو ~VRF-...",
      normalizedValue: normalized.startsWith("~") ? normalized.slice(1) : normalized,
    }
  }

  /** Legacy: optional ~ for PAT/RES only (not VRF) */
  const legacy = /^~?(PAT|RES)-(\d+)$/.exec(normalized)
  if (legacy) {
    return resolvePatRes(normalized, legacy)
  }

  return {
    isValid: false,
    error: "صيغة الباركود غير مدعومة. الصيغ المتوقعة: ~PAT-{id} أو ~RES-{id} أو ~VRF-...",
    normalizedValue: normalized.startsWith("~") ? normalized.slice(1) : normalized,
  }
}

/** @deprecated Use resolveBarcodeRoute — kept for patient-only call sites. */
export function resolvePrefixedBarcodeRoute(value: string): ResolvedBarcodeRoute {
  return resolveBarcodeRoute(value, { requirePrefix: true })
}
