import { resolveBarcodeRoute } from "@/lib/resolve-barcode-route"

export type ResolvePatientBarcodeResult = {
  isValid: boolean
  patientId?: string
  redirectUrl?: string
  error?: string
}

function toPatientResult(
  result: ReturnType<typeof resolveBarcodeRoute>
): ResolvePatientBarcodeResult {
  if (!result.isValid) {
    return { isValid: false, error: result.error }
  }
  if (result.type !== "patient") {
    return {
      isValid: false,
      error: "صيغة الباركود غير مدعومة. الصيغة المتوقعة ~PAT-{id}",
    }
  }
  return {
    isValid: true,
    patientId: result.id,
    redirectUrl: result.route,
  }
}

/**
 * Parses printed patient tube barcodes for client-side redirect.
 * Accepts ~PAT-{id} and legacy PAT-{id}. Does not call the backend.
 */
export function resolvePatientBarcode(value: string): ResolvePatientBarcodeResult {
  return toPatientResult(resolveBarcodeRoute(value, { requirePrefix: false }))
}

/**
 * Strict parser for global scanner listener (~ prefix required).
 */
export function resolvePrefixedPatientBarcode(value: string): ResolvePatientBarcodeResult {
  const result = resolveBarcodeRoute(value, { requirePrefix: true })
  return toPatientResult(result)
}
