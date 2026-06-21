/**
 * Base URL of the Laravel API (no trailing slash).
 * Used by server components and route handlers to reach the backend.
 */
export function getLabApiBase(): string {
  const raw =
    process.env.LAB_API_BASE_URL ??
    process.env.NEXT_PUBLIC_LAB_API_BASE_URL ??
    'http://127.0.0.1:8000'
  return raw.replace(/\/$/, '')
}
