/**
 * Hex-encodes an order number for ~VRF-{HEX} wedge barcodes.
 * Uses uppercase hex so normalization (toUpperCase) in the barcode resolver stays stable.
 */
export function encodeVerifyOrderToken(orderNumber: string): string {
  const trimmed = orderNumber.trim()
  if (!trimmed) return ""
  try {
    const bytes = new TextEncoder().encode(trimmed)
    let hex = ""
    for (const b of bytes) {
      hex += b.toString(16).padStart(2, "0")
    }
    return hex.toUpperCase()
  } catch {
    return ""
  }
}

export function decodeVerifyOrderToken(hexUpper: string): string | null {
  const cleaned = hexUpper.replace(/\s+/g, "").toUpperCase()
  if (!cleaned || cleaned.length % 2 !== 0) return null
  if (!/^[0-9A-F]+$/.test(cleaned)) return null
  try {
    const bytes = new Uint8Array(cleaned.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
    }
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}
