/**
 * Public site origin for absolute URLs in QR codes, emails, and print.
 * Prefer explicit env, then caller override (e.g. preview passed from page), then `window`.
 */
export function getAppOrigin(override?: string | null): string {
  const trimmedOverride = override?.replace(/\/$/, "").trim()
  if (trimmedOverride) return trimmedOverride

  const fromEnv =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL)) ||
    ""
  const trimmedEnv = String(fromEnv).replace(/\/$/, "").trim()
  if (trimmedEnv) return trimmedEnv

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "")
  }

  return ""
}
