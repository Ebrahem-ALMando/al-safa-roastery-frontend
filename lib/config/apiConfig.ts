const DEFAULT_BFF_BASE = "/api/bff"

/**
 * Base URL for browser-side API calls (BFF). No trailing slash.
 */
export function getApiBaseUrl(): string {
  return DEFAULT_BFF_BASE.replace(/\/+$/, "")
}

/**
 * Laravel API root, e.g. `http://localhost:8000/api/v1` (no trailing slash).
 * Use in Route Handlers / server code only.
 */
export function getLaravelBaseUrl(): string {
  const u = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "")
  if (!u) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set")
  }
  return u
}
